<?php

namespace App\Services\Asset;

use App\Models\Asset;
use App\Models\AssetRelationship;
use App\Models\AuditEvent;
use App\Models\User;
use App\Repositories\AssetRelationshipRepository;
use App\Repositories\AssetRepository;
use App\Services\Audit\AuditEventService;
use App\Services\Company\CompanyAccessService;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssetRelationshipService
{
    public function __construct(
        private readonly AssetRelationshipRepository $assetRelationshipRepository,
        private readonly AssetRepository $assetRepository,
        private readonly CompanyAccessService $companyAccessService,
        private readonly AuditEventService $auditEventService
    ) {
    }

    public function getAll(
        string $tenantId,
        string $assetId,
        User $actor
    ): Collection {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this->companyAccessService->requireView(
            $tenantId,
            $actor,
            $asset->company_id
        );

        return $this
            ->assetRelationshipRepository
            ->getForAsset(
                $tenantId,
                $assetId
            );
    }

    public function create(
        string $tenantId,
        string $assetId,
        array $data,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): AssetRelationship {
        $sourceAsset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this->companyAccessService->requireEdit(
            $tenantId,
            $actor,
            $sourceAsset->company_id
        );

        $relatedAssetId = trim(
            (string) (
                $data['related_asset_id']
                ?? ''
            )
        );

        if ($relatedAssetId === '') {
            throw ValidationException::withMessages([
                'related_asset_id' => [
                    'Related asset is required.',
                ],
            ]);
        }

        if (
            (string) $sourceAsset->id ===
            $relatedAssetId
        ) {
            throw ValidationException::withMessages([
                'related_asset_id' => [
                    'An asset cannot be related to itself.',
                ],
            ]);
        }

        $relatedAsset = $this->requireRelatedAsset(
            $tenantId,
            $relatedAssetId
        );

        $this->companyAccessService->requireEdit(
            $tenantId,
            $actor,
            $relatedAsset->company_id
        );

        $this->validateCompanyCompatibility(
            $sourceAsset,
            $relatedAsset
        );

        $relationshipType =
            $this->normalizeRelationshipType(
                $data['relationship_type']
                ?? AssetRelationship::TYPE_RELATED_TO
            );

        $label = $this->nullableString(
            $data['label'] ?? null
        );

        $notes = $this->nullableString(
            $data['notes'] ?? null
        );

        $this->validateLabel(
            $label
        );

        $this->ensureRelationshipDoesNotExist(
            $tenantId,
            $sourceAsset->id,
            $relatedAsset->id,
            $relationshipType
        );

        return DB::transaction(
            function () use (
                $tenantId,
                $sourceAsset,
                $relatedAsset,
                $relationshipType,
                $label,
                $notes,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $relationship = $this
                    ->assetRelationshipRepository
                    ->create([
                        'tenant_id' =>
                            $tenantId,

                        'source_asset_id' =>
                            $sourceAsset->id,

                        'related_asset_id' =>
                            $relatedAsset->id,

                        'relationship_type' =>
                            $relationshipType,

                        'label' =>
                            $label,

                        'notes' =>
                            $notes,

                        'created_by' =>
                            $actor->id,
                    ]);

                $this->touchAsset(
                    $sourceAsset,
                    $actor
                );

                $this->touchAsset(
                    $relatedAsset,
                    $actor
                );

                $this->auditEventService->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action:
                        AuditEvent::ACTION_UPDATED,
                    category:
                        AuditEvent::CATEGORY_RESOURCE,
                    targetType: 'asset',
                    targetId:
                        (string) $sourceAsset->id,
                    targetLabel:
                        $sourceAsset->name,
                    description:
                        'Asset relationship was created.',
                    changes: [
                        'related_asset_id' => [
                            'from' => null,
                            'to' =>
                                $relatedAsset->id,
                        ],

                        'relationship_type' => [
                            'from' => null,
                            'to' =>
                                $relationshipType,
                        ],
                    ],
                    metadata: [
                        'relationship_id' =>
                            $relationship->id,

                        'source_asset_id' =>
                            $sourceAsset->id,

                        'source_asset_name' =>
                            $sourceAsset->name,

                        'related_asset_id' =>
                            $relatedAsset->id,

                        'related_asset_name' =>
                            $relatedAsset->name,

                        'relationship_type' =>
                            $relationshipType,

                        'label' =>
                            $label,

                        'has_notes' =>
                            $notes !== null,

                        'company_id' =>
                            $sourceAsset->company_id,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod:
                        $requestMethod,
                    requestPath:
                        $requestPath
                );

                return $relationship;
            }
        );
    }

    public function delete(
        string $tenantId,
        string $assetId,
        string $relationshipId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): void {
        $contextAsset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this->companyAccessService->requireEdit(
            $tenantId,
            $actor,
            $contextAsset->company_id
        );

        $relationship = $this
            ->assetRelationshipRepository
            ->findByTenantAssetAndId(
                $tenantId,
                $assetId,
                $relationshipId
            );

        if (!$relationship) {
            throw new DomainException(
                'Asset relationship not found.'
            );
        }

        $sourceAsset =
            $relationship->sourceAsset;

        $relatedAsset =
            $relationship->relatedAsset;

        if (
            !$sourceAsset ||
            !$relatedAsset
        ) {
            throw new DomainException(
                'Related asset information could not be loaded.'
            );
        }

        $this->companyAccessService->requireEdit(
            $tenantId,
            $actor,
            $sourceAsset->company_id
        );

        $this->companyAccessService->requireEdit(
            $tenantId,
            $actor,
            $relatedAsset->company_id
        );

        DB::transaction(
            function () use (
                $tenantId,
                $contextAsset,
                $relationship,
                $sourceAsset,
                $relatedAsset,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $relationshipId =
                    $relationship->id;

                $relationshipType =
                    $relationship->relationship_type;

                $label =
                    $relationship->label;

                $this
                    ->assetRelationshipRepository
                    ->delete(
                        $relationship
                    );

                $this->touchAsset(
                    $sourceAsset,
                    $actor
                );

                $this->touchAsset(
                    $relatedAsset,
                    $actor
                );

                $this->auditEventService->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action:
                        AuditEvent::ACTION_UPDATED,
                    category:
                        AuditEvent::CATEGORY_RESOURCE,
                    targetType: 'asset',
                    targetId:
                        (string) $contextAsset->id,
                    targetLabel:
                        $contextAsset->name,
                    description:
                        'Asset relationship was removed.',
                    changes: [
                        'relationship_id' => [
                            'from' =>
                                $relationshipId,
                            'to' => null,
                        ],
                    ],
                    metadata: [
                        'relationship_id' =>
                            $relationshipId,

                        'source_asset_id' =>
                            $sourceAsset->id,

                        'source_asset_name' =>
                            $sourceAsset->name,

                        'related_asset_id' =>
                            $relatedAsset->id,

                        'related_asset_name' =>
                            $relatedAsset->name,

                        'relationship_type' =>
                            $relationshipType,

                        'label' =>
                            $label,

                        'company_id' =>
                            $contextAsset->company_id,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod:
                        $requestMethod,
                    requestPath:
                        $requestPath
                );
            }
        );
    }

    private function requireAsset(
        string $tenantId,
        string $assetId
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

        return $asset;
    }

    private function requireRelatedAsset(
        string $tenantId,
        string $assetId
    ): Asset {
        $asset = $this
            ->assetRepository
            ->findByTenantAndId(
                $tenantId,
                $assetId
            );

        if (!$asset) {
            throw ValidationException::withMessages([
                'related_asset_id' => [
                    'The selected related asset was not found.',
                ],
            ]);
        }

        return $asset;
    }

    private function validateCompanyCompatibility(
        Asset $sourceAsset,
        Asset $relatedAsset
    ): void {
        if (
            (string) $sourceAsset->company_id !==
            (string) $relatedAsset->company_id
        ) {
            throw ValidationException::withMessages([
                'related_asset_id' => [
                    'The related asset must belong to the same company.',
                ],
            ]);
        }
    }

    private function normalizeRelationshipType(
        mixed $value
    ): string {
        $relationshipType = strtolower(
            trim(
                (string) $value
            )
        );

        if (
            !in_array(
                $relationshipType,
                AssetRelationship::relationshipTypes(),
                true
            )
        ) {
            throw ValidationException::withMessages([
                'relationship_type' => [
                    'The selected relationship type is invalid.',
                ],
            ]);
        }

        return $relationshipType;
    }

    private function ensureRelationshipDoesNotExist(
        string $tenantId,
        string $sourceAssetId,
        string $relatedAssetId,
        string $relationshipType
    ): void {
        $exists = $this
            ->assetRelationshipRepository
            ->existsExact(
                $tenantId,
                $sourceAssetId,
                $relatedAssetId,
                $relationshipType
            );

        if ($exists) {
            throw ValidationException::withMessages([
                'related_asset_id' => [
                    'This asset relationship already exists.',
                ],
            ]);
        }

        if (
            $this->isSymmetricRelationship(
                $relationshipType
            )
        ) {
            $reverseExists = $this
                ->assetRelationshipRepository
                ->existsExact(
                    $tenantId,
                    $relatedAssetId,
                    $sourceAssetId,
                    $relationshipType
                );

            if ($reverseExists) {
                throw ValidationException::withMessages([
                    'related_asset_id' => [
                        'This asset relationship already exists.',
                    ],
                ]);
            }
        }
    }

    private function isSymmetricRelationship(
        string $relationshipType
    ): bool {
        return in_array(
            $relationshipType,
            [
                AssetRelationship::TYPE_RELATED_TO,
                AssetRelationship::TYPE_CONNECTED_TO,
            ],
            true
        );
    }

    private function validateLabel(
        ?string $label
    ): void {
        if (
            $label !== null &&
            mb_strlen($label) > 255
        ) {
            throw ValidationException::withMessages([
                'label' => [
                    'The label may not be greater than 255 characters.',
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

        $value = trim(
            (string) $value
        );

        return $value === ''
            ? null
            : $value;
    }

    private function touchAsset(
        Asset $asset,
        User $actor
    ): void {
        $this
            ->assetRepository
            ->update(
                $asset,
                [
                    'updated_by' =>
                        $actor->id,
                ]
            );
    }
}
