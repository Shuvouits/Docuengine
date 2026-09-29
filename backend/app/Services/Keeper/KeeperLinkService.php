<?php

namespace App\Services\Keeper;

use App\Models\AuditEvent;
use App\Models\KeeperLink;
use App\Models\User;
use App\Repositories\CompanyRepository;
use App\Repositories\KeeperLinkRepository;
use App\Services\Audit\AuditEventService;
use App\Services\Company\CompanyAccessService;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class KeeperLinkService
{
    private const EMPTY_UUID =
        '00000000-0000-0000-0000-000000000000';

    public function __construct(
        private readonly KeeperLinkRepository $keeperLinkRepository,
        private readonly CompanyRepository $companyRepository,
        private readonly CompanyAccessService $companyAccessService,
        private readonly AuditEventService $auditEventService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | List Keeper Links
    |--------------------------------------------------------------------------
    */

    public function getAll(
        string $tenantId,
        array $filters,
        User $actor
    ): LengthAwarePaginator {
        if (
            !empty(
                $filters['company_id']
            )
        ) {
            $companyId = trim(
                (string)
                    $filters['company_id']
            );

            $this->requireCompany(
                $tenantId,
                $companyId
            );

            $this
                ->companyAccessService
                ->requireView(
                    $tenantId,
                    $actor,
                    $companyId
                );
        }

        $allowedCompanyIds = $this
            ->companyAccessService
            ->allowedCompanyIds(
                $tenantId,
                $actor
            );

        /*
        |--------------------------------------------------------------------------
        | Restricted users only see Keeper Links belonging
        | to companies inside their allowed company scope.
        |
        | Tenant-wide Keeper Links with company_id = null are therefore
        | hidden from company-restricted users.
        |--------------------------------------------------------------------------
        */

        if ($allowedCompanyIds !== null) {
            $filters['company_ids'] =
                $allowedCompanyIds;
        }

        $perPage = (int) (
            $filters['per_page']
            ?? 25
        );

        $perPage = max(
            1,
            min($perPage, 100)
        );

        return $this
            ->keeperLinkRepository
            ->paginateForTenant(
                $tenantId,
                $filters,
                $perPage
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Keeper Link Details
    |--------------------------------------------------------------------------
    */

    public function getById(
        string $tenantId,
        string $keeperLinkId,
        User $actor
    ): KeeperLink {
        $keeperLink = $this
            ->requireKeeperLink(
                $tenantId,
                $keeperLinkId
            );

        $this->requireViewAccess(
            $tenantId,
            $keeperLink,
            $actor
        );

        return $keeperLink;
    }

    /*
    |--------------------------------------------------------------------------
    | Create Keeper Link
    |--------------------------------------------------------------------------
    */

    public function create(
        string $tenantId,
        array $data,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): KeeperLink {
        $name = $this->requiredString(
            'name',
            $data['name'] ?? null,
            255
        );

        $companyId = $this->nullableString(
            $data['company_id']
            ?? null
        );

        if ($companyId !== null) {
            $this->requireCompany(
                $tenantId,
                $companyId
            );

            $this
                ->companyAccessService
                ->requireEdit(
                    $tenantId,
                    $actor,
                    $companyId
                );
        } else {
            $this->requireTenantWideAccess(
                $tenantId,
                $actor
            );
        }

        $usernameHint = $this
            ->nullableLimitedString(
                'username_hint',
                $data['username_hint']
                ?? null,
                255
            );

        $keeperUid = $this
            ->nullableLimitedString(
                'keeper_uid',
                $data['keeper_uid']
                ?? null,
                255
            );

        $recordUrl = $this
            ->validateRecordUrl(
                $data['record_url']
                ?? null
            );

        $notes = $this->nullableString(
            $data['notes']
            ?? null
        );

        return DB::transaction(
            function () use (
                $tenantId,
                $companyId,
                $name,
                $usernameHint,
                $keeperUid,
                $recordUrl,
                $notes,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $keeperLink = $this
                    ->keeperLinkRepository
                    ->create([
                        'tenant_id' =>
                            $tenantId,

                        'company_id' =>
                            $companyId,

                        'name' =>
                            $name,

                        'username_hint' =>
                            $usernameHint,

                        'keeper_uid' =>
                            $keeperUid,

                        'record_url' =>
                            $recordUrl,

                        'notes' =>
                            $notes,

                        'created_by' =>
                            $actor->id,

                        'updated_by' =>
                            $actor->id,
                    ]);

                $this
                    ->auditEventService
                    ->record(
                        tenantId: $tenantId,
                        actor: $actor,
                        action:
                            AuditEvent::ACTION_CREATED,
                        category:
                            AuditEvent::CATEGORY_RESOURCE,
                        targetType:
                            'keeper_link',
                        targetId:
                            (string) $keeperLink->id,
                        targetLabel:
                            $keeperLink->name,
                        description:
                            'Keeper link was created.',
                        changes: [
                            'name' => [
                                'from' => null,
                                'to' =>
                                    $keeperLink->name,
                            ],

                            'company_id' => [
                                'from' => null,
                                'to' =>
                                    $keeperLink
                                        ->company_id,
                            ],
                        ],
                        metadata: [
                            'has_username_hint' =>
                                $keeperLink
                                    ->hasUsernameHint(),

                            'has_keeper_uid' =>
                                $keeperLink
                                    ->hasKeeperUid(),

                            'has_record_url' =>
                                $keeperLink
                                    ->hasRecordUrl(),
                        ],
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod:
                            $requestMethod,
                        requestPath:
                            $requestPath
                    );

                return $keeperLink;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Keeper Link
    |--------------------------------------------------------------------------
    */

    public function update(
        string $tenantId,
        string $keeperLinkId,
        array $data,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): KeeperLink {
        $keeperLink = $this
            ->requireKeeperLink(
                $tenantId,
                $keeperLinkId
            );

        $this->requireEditAccess(
            $tenantId,
            $keeperLink,
            $actor
        );

        $before = [
            'name' =>
                $keeperLink->name,

            'company_id' =>
                $keeperLink->company_id,

            'username_hint' =>
                $keeperLink->username_hint,

            'keeper_uid' =>
                $keeperLink->keeper_uid,

            'record_url' =>
                $keeperLink->record_url,

            'notes' =>
                $keeperLink->notes,
        ];

        $updateData = [
            'updated_by' =>
                $actor->id,
        ];

        /*
        |--------------------------------------------------------------------------
        | Name
        |--------------------------------------------------------------------------
        */

        if (
            array_key_exists(
                'name',
                $data
            )
        ) {
            $updateData['name'] =
                $this->requiredString(
                    'name',
                    $data['name'],
                    255
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Username Hint
        |--------------------------------------------------------------------------
        */

        if (
            array_key_exists(
                'username_hint',
                $data
            )
        ) {
            $updateData['username_hint'] =
                $this
                    ->nullableLimitedString(
                        'username_hint',
                        $data[
                            'username_hint'
                        ],
                        255
                    );
        }

        /*
        |--------------------------------------------------------------------------
        | Keeper UID
        |--------------------------------------------------------------------------
        */

        if (
            array_key_exists(
                'keeper_uid',
                $data
            )
        ) {
            $updateData['keeper_uid'] =
                $this
                    ->nullableLimitedString(
                        'keeper_uid',
                        $data[
                            'keeper_uid'
                        ],
                        255
                    );
        }

        /*
        |--------------------------------------------------------------------------
        | Keeper Record URL
        |--------------------------------------------------------------------------
        */

        if (
            array_key_exists(
                'record_url',
                $data
            )
        ) {
            $updateData['record_url'] =
                $this->validateRecordUrl(
                    $data['record_url']
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Notes
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | Company Relationship
        |--------------------------------------------------------------------------
        |
        | company_id = null means "leave unchanged".
        |
        | To detach:
        | company_id_clear = true
        |
        | We also support the empty UUID for compatibility with
        | the original Keeper API behavior.
        |--------------------------------------------------------------------------
        */

        $clearCompany = filter_var(
            $data['company_id_clear']
                ?? false,
            FILTER_VALIDATE_BOOLEAN
        );

        if ($clearCompany) {
            $this->requireTenantWideAccess(
                $tenantId,
                $actor
            );

            $updateData['company_id'] =
                null;
        } elseif (
            array_key_exists(
                'company_id',
                $data
            )
        ) {
            $requestedCompanyId =
                $data['company_id'];

            if (
                is_string(
                    $requestedCompanyId
                )
            ) {
                $requestedCompanyId =
                    trim(
                        $requestedCompanyId
                    );
            }

            if (
                $requestedCompanyId ===
                    self::EMPTY_UUID
            ) {
                $this
                    ->requireTenantWideAccess(
                        $tenantId,
                        $actor
                    );

                $updateData['company_id'] =
                    null;
            } elseif (
                $requestedCompanyId !==
                    null &&
                $requestedCompanyId !== ''
            ) {
                $newCompanyId =
                    (string)
                        $requestedCompanyId;

                $this->requireCompany(
                    $tenantId,
                    $newCompanyId
                );

                $this
                    ->companyAccessService
                    ->requireEdit(
                        $tenantId,
                        $actor,
                        $newCompanyId
                    );

                $updateData['company_id'] =
                    $newCompanyId;
            }
        }

        return DB::transaction(
            function () use (
                $tenantId,
                $keeperLink,
                $updateData,
                $before,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $updatedKeeperLink = $this
                    ->keeperLinkRepository
                    ->update(
                        $keeperLink,
                        $updateData
                    );

                $after = [
                    'name' =>
                        $updatedKeeperLink
                            ->name,

                    'company_id' =>
                        $updatedKeeperLink
                            ->company_id,

                    'username_hint' =>
                        $updatedKeeperLink
                            ->username_hint,

                    'keeper_uid' =>
                        $updatedKeeperLink
                            ->keeper_uid,

                    'record_url' =>
                        $updatedKeeperLink
                            ->record_url,

                    'notes' =>
                        $updatedKeeperLink
                            ->notes,
                ];

                $changes =
                    $this->buildSafeChanges(
                        $before,
                        $after
                    );

                if (!empty($changes)) {
                    $this
                        ->auditEventService
                        ->record(
                            tenantId:
                                $tenantId,
                            actor:
                                $actor,
                            action:
                                AuditEvent::ACTION_UPDATED,
                            category:
                                AuditEvent::CATEGORY_RESOURCE,
                            targetType:
                                'keeper_link',
                            targetId:
                                (string)
                                    $updatedKeeperLink
                                        ->id,
                            targetLabel:
                                $updatedKeeperLink
                                    ->name,
                            description:
                                'Keeper link was updated.',
                            changes:
                                $changes,
                            metadata: [
                                'has_username_hint' =>
                                    $updatedKeeperLink
                                        ->hasUsernameHint(),

                                'has_keeper_uid' =>
                                    $updatedKeeperLink
                                        ->hasKeeperUid(),

                                'has_record_url' =>
                                    $updatedKeeperLink
                                        ->hasRecordUrl(),
                            ],
                            ipAddress:
                                $ipAddress,
                            userAgent:
                                $userAgent,
                            requestMethod:
                                $requestMethod,
                            requestPath:
                                $requestPath
                        );
                }

                return $updatedKeeperLink;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Keeper Link
    |--------------------------------------------------------------------------
    */

    public function delete(
        string $tenantId,
        string $keeperLinkId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): void {
        $keeperLink = $this
            ->requireKeeperLink(
                $tenantId,
                $keeperLinkId
            );

        $this->requireEditAccess(
            $tenantId,
            $keeperLink,
            $actor
        );

        $id = (string)
            $keeperLink->id;

        $name =
            $keeperLink->name;

        $companyId =
            $keeperLink->company_id;

        DB::transaction(
            function () use (
                $tenantId,
                $keeperLink,
                $id,
                $name,
                $companyId,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $deleted = $this
                    ->keeperLinkRepository
                    ->delete(
                        $keeperLink
                    );

                if (!$deleted) {
                    throw new DomainException(
                        'Unable to delete the Keeper link.'
                    );
                }

                $this
                    ->auditEventService
                    ->record(
                        tenantId:
                            $tenantId,
                        actor:
                            $actor,
                        action:
                            AuditEvent::ACTION_DELETED,
                        category:
                            AuditEvent::CATEGORY_RESOURCE,
                        targetType:
                            'keeper_link',
                        targetId:
                            $id,
                        targetLabel:
                            $name,
                        description:
                            'Keeper link was deleted.',
                        changes:
                            null,
                        metadata: [
                            'company_id' =>
                                $companyId,
                        ],
                        ipAddress:
                            $ipAddress,
                        userAgent:
                            $userAgent,
                        requestMethod:
                            $requestMethod,
                        requestPath:
                            $requestPath
                    );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Reveal Keeper Record URL
    |--------------------------------------------------------------------------
    */

    public function reveal(
        string $tenantId,
        string $keeperLinkId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): string {
        $keeperLink = $this->getById(
            $tenantId,
            $keeperLinkId,
            $actor
        );

        if (!$keeperLink->hasRecordUrl()) {
            throw new DomainException(
                'Keeper record URL is not available.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Never write the Keeper URL itself to the audit log.
        |--------------------------------------------------------------------------
        */

        $this
            ->auditEventService
            ->record(
                tenantId:
                    $tenantId,
                actor:
                    $actor,
                action:
                    AuditEvent::ACTION_VIEWED,
                category:
                    AuditEvent::CATEGORY_RESOURCE,
                targetType:
                    'keeper_link',
                targetId:
                    (string)
                        $keeperLink->id,
                targetLabel:
                    $keeperLink->name,
                description:
                    'Keeper link was revealed.',
                changes:
                    null,
                metadata: [
                    'company_id' =>
                        $keeperLink
                            ->company_id,

                    'reveal' =>
                        true,
                ],
                ipAddress:
                    $ipAddress,
                userAgent:
                    $userAgent,
                requestMethod:
                    $requestMethod,
                requestPath:
                    $requestPath
            );

        return (string)
            $keeperLink->record_url;
    }

    /*
    |--------------------------------------------------------------------------
    | Require Keeper Link
    |--------------------------------------------------------------------------
    */

    private function requireKeeperLink(
        string $tenantId,
        string $keeperLinkId
    ): KeeperLink {
        $keeperLink = $this
            ->keeperLinkRepository
            ->findByTenantAndId(
                $tenantId,
                $keeperLinkId
            );

        if (!$keeperLink) {
            throw new DomainException(
                'Keeper link not found.'
            );
        }

        return $keeperLink;
    }

    /*
    |--------------------------------------------------------------------------
    | Require Company
    |--------------------------------------------------------------------------
    */

    private function requireCompany(
        string $tenantId,
        string $companyId
    ): void {
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
    }

    /*
    |--------------------------------------------------------------------------
    | View Access
    |--------------------------------------------------------------------------
    */

    private function requireViewAccess(
        string $tenantId,
        KeeperLink $keeperLink,
        User $actor
    ): void {
        if (
            $keeperLink->company_id !==
            null
        ) {
            $this
                ->companyAccessService
                ->requireView(
                    $tenantId,
                    $actor,
                    $keeperLink
                        ->company_id
                );

            return;
        }

        $this->requireTenantWideAccess(
            $tenantId,
            $actor
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Edit Access
    |--------------------------------------------------------------------------
    */

    private function requireEditAccess(
        string $tenantId,
        KeeperLink $keeperLink,
        User $actor
    ): void {
        if (
            $keeperLink->company_id !==
            null
        ) {
            $this
                ->companyAccessService
                ->requireEdit(
                    $tenantId,
                    $actor,
                    $keeperLink
                        ->company_id
                );

            return;
        }

        $this->requireTenantWideAccess(
            $tenantId,
            $actor
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant-wide Keeper Link Access
    |--------------------------------------------------------------------------
    */

    private function requireTenantWideAccess(
        string $tenantId,
        User $actor
    ): void {
        $allowedCompanyIds = $this
            ->companyAccessService
            ->allowedCompanyIds(
                $tenantId,
                $actor
            );

        if ($allowedCompanyIds !== null) {
            throw new DomainException(
                'Tenant-wide Keeper links are not available within a restricted company scope.'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Validation Helpers
    |--------------------------------------------------------------------------
    */

    private function requiredString(
        string $field,
        mixed $value,
        int $maxLength
    ): string {
        if (!is_string($value)) {
            throw ValidationException::withMessages([
                $field => [
                    ucfirst($field) .
                    ' is required.',
                ],
            ]);
        }

        $value = trim($value);

        if ($value === '') {
            throw ValidationException::withMessages([
                $field => [
                    ucfirst($field) .
                    ' is required.',
                ],
            ]);
        }

        if (
            mb_strlen($value) >
            $maxLength
        ) {
            throw ValidationException::withMessages([
                $field => [
                    ucfirst($field) .
                    ' may not be greater than ' .
                    $maxLength .
                    ' characters.',
                ],
            ]);
        }

        return $value;
    }

    private function nullableLimitedString(
        string $field,
        mixed $value,
        int $maxLength
    ): ?string {
        $value =
            $this->nullableString(
                $value
            );

        if ($value === null) {
            return null;
        }

        if (
            mb_strlen($value) >
            $maxLength
        ) {
            throw ValidationException::withMessages([
                $field => [
                    ucfirst($field) .
                    ' may not be greater than ' .
                    $maxLength .
                    ' characters.',
                ],
            ]);
        }

        return $value;
    }

    private function nullableString(
        mixed $value
    ): ?string {
        if ($value === null) {
            return null;
        }

        if (!is_string($value)) {
            $value = (string) $value;
        }

        $value = trim($value);

        return $value !== ''
            ? $value
            : null;
    }

    private function validateRecordUrl(
        mixed $value
    ): ?string {
        $url =
            $this->nullableString(
                $value
            );

        if ($url === null) {
            return null;
        }

        if (
            filter_var(
                $url,
                FILTER_VALIDATE_URL
            ) === false
        ) {
            throw ValidationException::withMessages([
                'record_url' => [
                    'Keeper record URL must be a valid URL.',
                ],
            ]);
        }

        return $url;
    }

    /*
    |--------------------------------------------------------------------------
    | Safe Audit Changes
    |--------------------------------------------------------------------------
    |
    | Keeper URL and notes are intentionally never copied
    | into the audit record.
    |--------------------------------------------------------------------------
    */

    private function buildSafeChanges(
        array $before,
        array $after
    ): array {
        $changes = [];

        foreach (
            [
                'name',
                'company_id',
                'username_hint',
            ]
            as $field
        ) {
            if (
                ($before[$field] ?? null) !==
                ($after[$field] ?? null)
            ) {
                $changes[$field] = [
                    'from' =>
                        $before[$field]
                        ?? null,

                    'to' =>
                        $after[$field]
                        ?? null,
                ];
            }
        }

        if (
            ($before['keeper_uid']
                ?? null) !==
            ($after['keeper_uid']
                ?? null)
        ) {
            $changes['keeper_uid'] = [
                'from' =>
                    empty(
                        $before['keeper_uid']
                    )
                        ? null
                        : '[stored]',

                'to' =>
                    empty(
                        $after['keeper_uid']
                    )
                        ? null
                        : '[stored]',
            ];
        }

        if (
            ($before['record_url']
                ?? null) !==
            ($after['record_url']
                ?? null)
        ) {
            $changes['record_url'] = [
                'from' =>
                    empty(
                        $before['record_url']
                    )
                        ? null
                        : '[stored]',

                'to' =>
                    empty(
                        $after['record_url']
                    )
                        ? null
                        : '[stored]',
            ];
        }

        if (
            ($before['notes']
                ?? null) !==
            ($after['notes']
                ?? null)
        ) {
            $changes['notes'] = [
                'from' =>
                    empty(
                        $before['notes']
                    )
                        ? null
                        : '[stored]',

                'to' =>
                    empty(
                        $after['notes']
                    )
                        ? null
                        : '[stored]',
            ];
        }

        return $changes;
    }
}
