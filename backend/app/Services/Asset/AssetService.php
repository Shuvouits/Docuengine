<?php

namespace App\Services\Asset;

use App\Models\Asset;
use App\Models\AuditEvent;
use App\Models\User;
use App\Repositories\AssetLayoutActivationRepository;
use App\Repositories\AssetLayoutFieldRepository;
use App\Repositories\AssetLayoutRepository;
use App\Repositories\AssetLayoutVersionRepository;
use App\Repositories\AssetRepository;
use App\Repositories\CompanyRepository;
use App\Repositories\TenantUserRepository;
use App\Services\Archive\ArchiveService;
use App\Services\Audit\AuditEventService;
use App\Services\Company\CompanyAccessService;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssetService
{
    public function __construct(
        private readonly AssetRepository $assetRepository,
        private readonly CompanyRepository $companyRepository,
        private readonly AssetLayoutRepository $assetLayoutRepository,
        private readonly AssetLayoutActivationRepository $assetLayoutActivationRepository,
        private readonly AssetLayoutVersionRepository $assetLayoutVersionRepository,
        private readonly AssetLayoutFieldRepository $assetLayoutFieldRepository,
        private readonly TenantUserRepository $tenantUserRepository,
        private readonly AssetFieldValueService $assetFieldValueService,
        private readonly AssetTagService $assetTagService,
        private readonly CompanyAccessService $companyAccessService,
        private readonly ArchiveService $archiveService,
        private readonly AuditEventService $auditEventService
    ) {
    }

    public function getAll(
        string $tenantId,
        array $filters,
        User $actor
    ): LengthAwarePaginator {
        $allowedCompanyIds = $this
            ->companyAccessService
            ->allowedCompanyIds(
                $tenantId,
                $actor
            );

        if ($allowedCompanyIds !== null) {
            $filters['company_ids'] =
                $allowedCompanyIds;
        }

        $perPage = (int) (
            $filters['per_page']
            ?? 20
        );

        $perPage = max(
            1,
            min($perPage, 100)
        );

        return $this
            ->assetRepository
            ->paginateForTenant(
                $tenantId,
                $filters,
                $perPage
            );
    }

    public function getById(
        string $tenantId,
        string $assetId,
        User $actor
    ): Asset {
        $asset = $this
            ->assetRepository
            ->findByTenantAndId(
                $tenantId,
                $assetId
            );

        if (!$asset) {
            throw new DomainException(
                'Asset not found.'
            );
        }

        $this
            ->companyAccessService
            ->requireView(
                $tenantId,
                $actor,
                $asset->company_id
            );

        return $asset;
    }

    public function create(
        string $tenantId,
        array $data,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Asset {
        $name = trim(
            (string) (
                $data['name']
                ?? ''
            )
        );

        if ($name === '') {
            throw ValidationException::withMessages([
                'name' => [
                    'Asset name is required.',
                ],
            ]);
        }

        $companyId = trim(
            (string) (
                $data['company_id']
                ?? ''
            )
        );

        if ($companyId === '') {
            throw ValidationException::withMessages([
                'company_id' => [
                    'Company is required.',
                ],
            ]);
        }

        $company = $this
            ->companyRepository
            ->findByTenantAndId(
                $tenantId,
                $companyId
            );

        if (!$company) {
            throw ValidationException::withMessages([
                'company_id' => [
                    'The selected company was not found.',
                ],
            ]);
        }

        $this
            ->companyAccessService
            ->requireEdit(
                $tenantId,
                $actor,
                $companyId
            );

        $layoutId = trim(
            (string) (
                $data['asset_layout_id']
                ?? ''
            )
        );

        if ($layoutId === '') {
            throw ValidationException::withMessages([
                'asset_layout_id' => [
                    'Asset Layout is required.',
                ],
            ]);
        }

        $layout = $this
            ->assetLayoutRepository
            ->findById(
                $tenantId,
                $layoutId
            );

        if (!$layout) {
            throw ValidationException::withMessages([
                'asset_layout_id' => [
                    'The selected Asset Layout was not found.',
                ],
            ]);
        }

        if (!$layout->is_active) {
            throw ValidationException::withMessages([
                'asset_layout_id' => [
                    'The selected Asset Layout is not active.',
                ],
            ]);
        }

        $activation = $this
            ->assetLayoutActivationRepository
            ->findByLayoutAndCompany(
                $tenantId,
                $layoutId,
                $companyId
            );

        if (
            !$activation ||
            !$activation->is_active
        ) {
            throw ValidationException::withMessages([
                'asset_layout_id' => [
                    'The selected Asset Layout is not assigned to this company.',
                ],
            ]);
        }

        $currentVersionNumber =
            (int) $layout->current_version;

        if ($currentVersionNumber < 1) {
            throw new DomainException(
                'The selected Asset Layout does not have a valid current version.'
            );
        }

        $layoutVersion = $this
            ->assetLayoutVersionRepository
            ->findByVersionNumber(
                $tenantId,
                $layoutId,
                $currentVersionNumber
            );

        if (!$layoutVersion) {
            throw new DomainException(
                'The current Asset Layout version could not be found.'
            );
        }

        $status =
            $data['status']
            ?? Asset::STATUS_ACTIVE;

        $this->validateStatus(
            $status
        );

        $lifecycleStatus =
            $data['lifecycle_status']
            ?? Asset::LIFECYCLE_ACTIVE;

        $this->validateLifecycleStatus(
            $lifecycleStatus
        );

        $ownerUserId = $this
            ->validateTenantUser(
                $tenantId,
                $data['owner_user_id']
                    ?? null,
                'owner_user_id'
            );

        $assignedUserId = $this
            ->validateTenantUser(
                $tenantId,
                $data['assigned_user_id']
                    ?? null,
                'assigned_user_id'
            );

        $dataSource =
            $data['data_source']
            ?? Asset::DATA_SOURCE_MANUAL;

        $this->validateDataSource(
            $dataSource
        );

        $fieldValues =
            $data['fields']
            ?? [];

        if (!is_array($fieldValues)) {
            throw ValidationException::withMessages([
                'fields' => [
                    'Asset fields must be an object or array.',
                ],
            ]);
        }

        $layoutFields = $this
            ->assetLayoutFieldRepository
            ->getAllByLayout(
                $tenantId,
                $layoutId
            );

        $this->validateWarrantyDates(
            $data['warranty_start_date']
                ?? null,
            $data['warranty_expiration_date']
                ?? null
        );

        $hasTags = array_key_exists(
            'tag_ids',
            $data
        );

        $tagIds = $hasTags
            ? $this
                ->assetTagService
                ->validateTagIds(
                    $tenantId,
                    $data['tag_ids']
                )
            : [];

        $payload = [
            'tenant_id' =>
                $tenantId,

            'company_id' =>
                $companyId,

            'asset_layout_id' =>
                $layoutId,

            'asset_layout_version_id' =>
                $layoutVersion->id,

            'name' =>
                $name,

            'status' =>
                $status,

            'owner_user_id' =>
                $ownerUserId,

            'assigned_user_id' =>
                $assignedUserId,

            'data_source' =>
                $dataSource,

            'warranty_provider' =>
                $this->nullableString(
                    $data['warranty_provider']
                    ?? null
                ),

            'warranty_start_date' =>
                $data['warranty_start_date']
                ?? null,

            'warranty_expiration_date' =>
                $data['warranty_expiration_date']
                ?? null,

            'lifecycle_status' =>
                $lifecycleStatus,

            'notes' =>
                $this->nullableString(
                    $data['notes']
                    ?? null
                ),

            'created_by' =>
                $actor->id,

            'updated_by' =>
                $actor->id,
        ];

        return DB::transaction(
            function () use (
                $tenantId,
                $payload,
                $layoutFields,
                $fieldValues,
                $hasTags,
                $tagIds,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $asset = $this
                    ->assetRepository
                    ->create(
                        $payload
                    );

                $this
                    ->assetFieldValueService
                    ->createValues(
                        tenantId: $tenantId,
                        asset: $asset,
                        fields: $layoutFields,
                        values: $fieldValues,
                        userId: (string) $actor->id
                    );

                if ($hasTags) {
                    $this
                        ->assetTagService
                        ->syncForAsset(
                            tenantId: $tenantId,
                            asset: $asset,
                            tagIds: $tagIds,
                            actor: $actor
                        );
                }

                $createdAsset = $this
                    ->assetRepository
                    ->findByTenantAndId(
                        $tenantId,
                        $asset->id
                    );

                if (!$createdAsset) {
                    throw new DomainException(
                        'Asset was created but could not be reloaded.'
                    );
                }

                $changes = [
                    'name' => [
                        'from' => null,
                        'to' =>
                            $createdAsset->name,
                    ],

                    'company_id' => [
                        'from' => null,
                        'to' =>
                            $createdAsset->company_id,
                    ],

                    'asset_layout_id' => [
                        'from' => null,
                        'to' =>
                            $createdAsset->asset_layout_id,
                    ],

                    'status' => [
                        'from' => null,
                        'to' =>
                            $createdAsset->status,
                    ],

                    'owner_user_id' => [
                        'from' => null,
                        'to' =>
                            $createdAsset->owner_user_id,
                    ],

                    'assigned_user_id' => [
                        'from' => null,
                        'to' =>
                            $createdAsset->assigned_user_id,
                    ],

                    'data_source' => [
                        'from' => null,
                        'to' =>
                            $createdAsset->data_source,
                    ],

                    'lifecycle_status' => [
                        'from' => null,
                        'to' =>
                            $createdAsset->lifecycle_status,
                    ],
                ];

                if ($hasTags) {
                    $changes['tag_ids'] = [
                        'from' => [],
                        'to' => $this
                            ->assetTagIds(
                                $createdAsset
                            ),
                    ];
                }

                $this
                    ->auditEventService
                    ->record(
                        tenantId: $tenantId,
                        actor: $actor,
                        action: AuditEvent::ACTION_CREATED,
                        category: AuditEvent::CATEGORY_RESOURCE,
                        targetType: 'asset',
                        targetId:
                            (string) $createdAsset->id,
                        targetLabel:
                            $createdAsset->name,
                        description:
                            'Asset was created.',
                        changes: $changes,
                        metadata: [
                            'asset_layout_version_id' =>
                                $createdAsset
                                    ->asset_layout_version_id,

                            'warranty_provider' =>
                                $createdAsset
                                    ->warranty_provider,

                            'warranty_start_date' =>
                                $createdAsset
                                    ->warranty_start_date
                                    ?->format('Y-m-d'),

                            'warranty_expiration_date' =>
                                $createdAsset
                                    ->warranty_expiration_date
                                    ?->format('Y-m-d'),
                        ],
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );

                return $createdAsset;
            }
        );
    }

    public function update(
        string $tenantId,
        string $assetId,
        array $data,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Asset {
        $asset = $this
            ->assetRepository
            ->findByTenantAndId(
                $tenantId,
                $assetId
            );

        if (!$asset) {
            throw new DomainException(
                'Asset not found.'
            );
        }

        $this
            ->companyAccessService
            ->requireEdit(
                $tenantId,
                $actor,
                $asset->company_id
            );

        if (
            array_key_exists(
                'company_id',
                $data
            ) &&
            (string) $data['company_id'] !==
                (string) $asset->company_id
        ) {
            throw ValidationException::withMessages([
                'company_id' => [
                    'An asset cannot be moved to another company through this update.',
                ],
            ]);
        }

        if (
            array_key_exists(
                'asset_layout_id',
                $data
            ) &&
            (string) $data['asset_layout_id'] !==
                (string) $asset->asset_layout_id
        ) {
            throw ValidationException::withMessages([
                'asset_layout_id' => [
                    'An asset cannot change its Asset Layout through this update.',
                ],
            ]);
        }

        $before = [
            'name' =>
                $asset->name,

            'status' =>
                $asset->status,

            'owner_user_id' =>
                $asset->owner_user_id,

            'assigned_user_id' =>
                $asset->assigned_user_id,

            'data_source' =>
                $asset->data_source,

            'lifecycle_status' =>
                $asset->lifecycle_status,

            'warranty_provider' =>
                $asset->warranty_provider,

            'warranty_start_date' =>
                $asset
                    ->warranty_start_date
                    ?->format('Y-m-d'),

            'warranty_expiration_date' =>
                $asset
                    ->warranty_expiration_date
                    ?->format('Y-m-d'),

            'notes' =>
                $asset->notes,

            'tag_ids' =>
                $this->assetTagIds(
                    $asset
                ),
        ];

        $updateData = [];

        if (
            array_key_exists(
                'name',
                $data
            )
        ) {
            $name = trim(
                (string) $data['name']
            );

            if ($name === '') {
                throw ValidationException::withMessages([
                    'name' => [
                        'Asset name cannot be empty.',
                    ],
                ]);
            }

            $updateData['name'] =
                $name;
        }

        if (
            array_key_exists(
                'status',
                $data
            )
        ) {
            $this->validateStatus(
                $data['status']
            );

            $updateData['status'] =
                $data['status'];
        }

        if (
            array_key_exists(
                'owner_user_id',
                $data
            )
        ) {
            $updateData['owner_user_id'] =
                $this->validateTenantUser(
                    $tenantId,
                    $data['owner_user_id'],
                    'owner_user_id'
                );
        }

        if (
            array_key_exists(
                'assigned_user_id',
                $data
            )
        ) {
            $updateData['assigned_user_id'] =
                $this->validateTenantUser(
                    $tenantId,
                    $data['assigned_user_id'],
                    'assigned_user_id'
                );
        }

        if (
            array_key_exists(
                'data_source',
                $data
            )
        ) {
            $this->validateDataSource(
                $data['data_source']
            );

            $updateData['data_source'] =
                $data['data_source'];
        }

        if (
            array_key_exists(
                'lifecycle_status',
                $data
            )
        ) {
            $this->validateLifecycleStatus(
                $data['lifecycle_status']
            );

            $updateData['lifecycle_status'] =
                $data['lifecycle_status'];
        }

        if (
            array_key_exists(
                'warranty_provider',
                $data
            )
        ) {
            $updateData['warranty_provider'] =
                $this->nullableString(
                    $data['warranty_provider']
                );
        }

        if (
            array_key_exists(
                'notes',
                $data
            )
        ) {
            $updateData['notes'] =
                $this->nullableString(
                    $data['notes']
                );
        }

        $warrantyStartDate =
            array_key_exists(
                'warranty_start_date',
                $data
            )
                ? $data['warranty_start_date']
                : $asset
                    ->warranty_start_date
                    ?->format('Y-m-d');

        $warrantyExpirationDate =
            array_key_exists(
                'warranty_expiration_date',
                $data
            )
                ? $data['warranty_expiration_date']
                : $asset
                    ->warranty_expiration_date
                    ?->format('Y-m-d');

        $this->validateWarrantyDates(
            $warrantyStartDate,
            $warrantyExpirationDate
        );

        if (
            array_key_exists(
                'warranty_start_date',
                $data
            )
        ) {
            $updateData['warranty_start_date'] =
                $data['warranty_start_date'];
        }

        if (
            array_key_exists(
                'warranty_expiration_date',
                $data
            )
        ) {
            $updateData['warranty_expiration_date'] =
                $data['warranty_expiration_date'];
        }

        $hasDynamicFields =
            array_key_exists(
                'fields',
                $data
            );

        $fieldValues =
            $hasDynamicFields
                ? $data['fields']
                : [];

        if (
            $hasDynamicFields &&
            !is_array($fieldValues)
        ) {
            throw ValidationException::withMessages([
                'fields' => [
                    'Asset fields must be an object or array.',
                ],
            ]);
        }

        $layoutFields =
            $hasDynamicFields
                ? $this
                    ->assetLayoutFieldRepository
                    ->getAllByLayout(
                        $tenantId,
                        $asset->asset_layout_id
                    )
                : null;

        $hasTags = array_key_exists(
            'tag_ids',
            $data
        );

        $tagIds = $hasTags
            ? $this
                ->assetTagService
                ->validateTagIds(
                    $tenantId,
                    $data['tag_ids']
                )
            : [];

        $updateData['updated_by'] =
            $actor->id;

        return DB::transaction(
            function () use (
                $tenantId,
                $asset,
                $before,
                $updateData,
                $hasDynamicFields,
                $layoutFields,
                $fieldValues,
                $hasTags,
                $tagIds,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $asset = $this
                    ->assetRepository
                    ->update(
                        $asset,
                        $updateData
                    );

                if (
                    $hasDynamicFields &&
                    $layoutFields
                ) {
                    $this
                        ->assetFieldValueService
                        ->updateValues(
                            tenantId: $tenantId,
                            asset: $asset,
                            fields: $layoutFields,
                            values: $fieldValues,
                            userId: (string) $actor->id
                        );
                }

                if ($hasTags) {
                    $this
                        ->assetTagService
                        ->syncForAsset(
                            tenantId: $tenantId,
                            asset: $asset,
                            tagIds: $tagIds,
                            actor: $actor
                        );
                }

                $updatedAsset = $this
                    ->assetRepository
                    ->findByTenantAndId(
                        $tenantId,
                        $asset->id
                    );

                if (!$updatedAsset) {
                    throw new DomainException(
                        'Asset was updated but could not be reloaded.'
                    );
                }

                $after = [
                    'name' =>
                        $updatedAsset->name,

                    'status' =>
                        $updatedAsset->status,

                    'owner_user_id' =>
                        $updatedAsset
                            ->owner_user_id,

                    'assigned_user_id' =>
                        $updatedAsset
                            ->assigned_user_id,

                    'data_source' =>
                        $updatedAsset
                            ->data_source,

                    'lifecycle_status' =>
                        $updatedAsset
                            ->lifecycle_status,

                    'warranty_provider' =>
                        $updatedAsset
                            ->warranty_provider,

                    'warranty_start_date' =>
                        $updatedAsset
                            ->warranty_start_date
                            ?->format('Y-m-d'),

                    'warranty_expiration_date' =>
                        $updatedAsset
                            ->warranty_expiration_date
                            ?->format('Y-m-d'),

                    'notes' =>
                        $updatedAsset->notes,

                    'tag_ids' =>
                        $this->assetTagIds(
                            $updatedAsset
                        ),
                ];

                $changes = [];

                foreach (
                    $before
                    as $field => $oldValue
                ) {
                    $newValue =
                        $after[$field]
                        ?? null;

                    if ($oldValue !== $newValue) {
                        $changes[$field] = [
                            'from' =>
                                $oldValue,

                            'to' =>
                                $newValue,
                        ];
                    }
                }

                if (
                    !empty($changes) ||
                    $hasDynamicFields
                ) {
                    $this
                        ->auditEventService
                        ->record(
                            tenantId: $tenantId,
                            actor: $actor,
                            action: AuditEvent::ACTION_UPDATED,
                            category: AuditEvent::CATEGORY_RESOURCE,
                            targetType: 'asset',
                            targetId:
                                (string) $updatedAsset->id,
                            targetLabel:
                                $updatedAsset->name,
                            description:
                                'Asset was updated.',
                            changes:
                                !empty($changes)
                                    ? $changes
                                    : null,
                            metadata: [
                                'company_id' =>
                                    $updatedAsset->company_id,

                                'asset_layout_id' =>
                                    $updatedAsset->asset_layout_id,

                                'asset_layout_version_id' =>
                                    $updatedAsset
                                        ->asset_layout_version_id,

                                'dynamic_fields_updated' =>
                                    $hasDynamicFields,

                                'tags_updated' =>
                                    $hasTags,
                            ],
                            ipAddress: $ipAddress,
                            userAgent: $userAgent,
                            requestMethod: $requestMethod,
                            requestPath: $requestPath
                        );
                }

                return $updatedAsset;
            }
        );
    }

    public function archive(
        string $tenantId,
        string $assetId,
        User $actor,
        ?string $reason = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): void {
        $asset = $this
            ->assetRepository
            ->findByTenantAndId(
                $tenantId,
                $assetId
            );

        if (!$asset) {
            throw new DomainException(
                'Asset not found.'
            );
        }

        $this
            ->companyAccessService
            ->requireManage(
                $tenantId,
                $actor,
                $asset->company_id
            );

        DB::transaction(
            function () use (
                $tenantId,
                $asset,
                $actor,
                $reason,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $archived = $this
                    ->assetRepository
                    ->archive(
                        $asset
                    );

                if (!$archived) {
                    throw new DomainException(
                        'Unable to archive the asset.'
                    );
                }

                $this
                    ->archiveService
                    ->registerArchivedResource(
                        tenantId: $tenantId,
                        resourceType: 'asset',
                        resourceId:
                            (string) $asset->id,
                        resourceLabel:
                            $asset->name,
                        actor: $actor,
                        reason: $reason,
                        metadata: [
                            'name' =>
                                $asset->name,

                            'company_id' =>
                                $asset->company_id,

                            'asset_layout_id' =>
                                $asset->asset_layout_id,

                            'asset_layout_version_id' =>
                                $asset
                                    ->asset_layout_version_id,

                            'status' =>
                                $asset->status,

                            'owner_user_id' =>
                                $asset->owner_user_id,

                            'assigned_user_id' =>
                                $asset->assigned_user_id,

                            'data_source' =>
                                $asset->data_source,

                            'lifecycle_status' =>
                                $asset->lifecycle_status,

                            'tag_ids' =>
                                $this->assetTagIds(
                                    $asset
                                ),

                            'warranty_provider' =>
                                $asset
                                    ->warranty_provider,

                            'warranty_start_date' =>
                                $asset
                                    ->warranty_start_date
                                    ?->format('Y-m-d'),

                            'warranty_expiration_date' =>
                                $asset
                                    ->warranty_expiration_date
                                    ?->format('Y-m-d'),

                            'created_by' =>
                                $asset->created_by,

                            'created_at' =>
                                $asset
                                    ->created_at
                                    ?->toISOString(),
                        ],
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );
            }
        );
    }

    public function restore(
        string $tenantId,
        string $assetId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Asset {
        $asset = $this
            ->assetRepository
            ->findByTenantAndIdWithTrashed(
                $tenantId,
                $assetId
            );

        if (!$asset) {
            throw new DomainException(
                'Archived asset not found.'
            );
        }

        if (!$asset->trashed()) {
            throw new DomainException(
                'Asset is not archived.'
            );
        }

        $this
            ->companyAccessService
            ->requireManage(
                $tenantId,
                $actor,
                $asset->company_id
            );

        $archiveEntry = $this
            ->archiveService
            ->getArchivedByResource(
                $tenantId,
                'asset',
                $assetId
            );

        if (!$archiveEntry) {
            throw new DomainException(
                'Asset archive record not found.'
            );
        }

        return DB::transaction(
            function () use (
                $tenantId,
                $assetId,
                $asset,
                $archiveEntry,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $restored = $this
                    ->assetRepository
                    ->restore(
                        $asset
                    );

                if (!$restored) {
                    throw new DomainException(
                        'Unable to restore the asset.'
                    );
                }

                $this
                    ->archiveService
                    ->markRestored(
                        tenantId: $tenantId,
                        archiveEntryId:
                            $archiveEntry->id,
                        actor: $actor,
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );

                $restoredAsset = $this
                    ->assetRepository
                    ->findByTenantAndId(
                        $tenantId,
                        $assetId
                    );

                if (!$restoredAsset) {
                    throw new DomainException(
                        'Asset was restored but could not be reloaded.'
                    );
                }

                return $restoredAsset;
            }
        );
    }

    private function validateStatus(
        mixed $status
    ): void {
        if (
            !in_array(
                $status,
                Asset::statuses(),
                true
            )
        ) {
            throw ValidationException::withMessages([
                'status' => [
                    'The selected asset status is invalid.',
                ],
            ]);
        }
    }

    private function validateLifecycleStatus(
        mixed $status
    ): void {
        if (
            !in_array(
                $status,
                Asset::lifecycleStatuses(),
                true
            )
        ) {
            throw ValidationException::withMessages([
                'lifecycle_status' => [
                    'The selected lifecycle status is invalid.',
                ],
            ]);
        }
    }

    private function validateDataSource(
        mixed $dataSource
    ): void {
        if (
            !in_array(
                $dataSource,
                Asset::dataSources(),
                true
            )
        ) {
            throw ValidationException::withMessages([
                'data_source' => [
                    'The selected asset data source is invalid.',
                ],
            ]);
        }
    }

    private function validateTenantUser(
        string $tenantId,
        mixed $userId,
        string $field
    ): ?string {
        if (
            $userId === null ||
            $userId === ''
        ) {
            return null;
        }

        if (
            is_array($userId) ||
            is_object($userId)
        ) {
            throw ValidationException::withMessages([
                $field => [
                    'The selected user is invalid.',
                ],
            ]);
        }

        $userId = trim(
            (string) $userId
        );

        if ($userId === '') {
            return null;
        }

        $membership = $this
            ->tenantUserRepository
            ->findByTenantAndUser(
                $tenantId,
                $userId
            );

        if (
            !$membership ||
            !$membership->isActive()
        ) {
            throw ValidationException::withMessages([
                $field => [
                    'The selected user does not have active access to this tenant.',
                ],
            ]);
        }

        return $userId;
    }

    private function validateWarrantyDates(
        mixed $startDate,
        mixed $expirationDate
    ): void {
        if (
            $startDate === null ||
            $startDate === ''
        ) {
            $startDate = null;
        }

        if (
            $expirationDate === null ||
            $expirationDate === ''
        ) {
            $expirationDate = null;
        }

        if ($startDate !== null) {
            $this->validateDateFormat(
                'warranty_start_date',
                $startDate
            );
        }

        if ($expirationDate !== null) {
            $this->validateDateFormat(
                'warranty_expiration_date',
                $expirationDate
            );
        }

        if (
            $startDate !== null &&
            $expirationDate !== null &&
            $expirationDate < $startDate
        ) {
            throw ValidationException::withMessages([
                'warranty_expiration_date' => [
                    'Warranty expiration date must be on or after the warranty start date.',
                ],
            ]);
        }
    }

    private function validateDateFormat(
        string $field,
        mixed $value
    ): void {
        if (
            is_array($value) ||
            is_object($value)
        ) {
            throw ValidationException::withMessages([
                $field => [
                    'The date must use the YYYY-MM-DD format.',
                ],
            ]);
        }

        $value = trim(
            (string) $value
        );

        $date =
            \DateTimeImmutable::createFromFormat(
                '!Y-m-d',
                $value
            );

        $errors =
            \DateTimeImmutable::getLastErrors();

        if (
            !$date ||
            (
                is_array($errors) &&
                (
                    $errors['warning_count'] > 0 ||
                    $errors['error_count'] > 0
                )
            ) ||
            $date->format('Y-m-d') !== $value
        ) {
            throw ValidationException::withMessages([
                $field => [
                    'The date must use the YYYY-MM-DD format.',
                ],
            ]);
        }
    }

    private function nullableString(
        mixed $value
    ): ?string {
        if ($value === null) {
            return null;
        }

        if (
            is_array($value) ||
            is_object($value)
        ) {
            return null;
        }

        $value = trim(
            (string) $value
        );

        return $value !== ''
            ? $value
            : null;
    }

    private function assetTagIds(
        Asset $asset
    ): array {
        if (!$asset->relationLoaded('tags')) {
            $asset->load(
                'tags:id,name,slug'
            );
        }

        return $asset
            ->tags
            ->pluck('id')
            ->map(
                fn ($id) =>
                    (string) $id
            )
            ->sort()
            ->values()
            ->all();
    }
}
