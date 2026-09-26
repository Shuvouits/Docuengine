<?php

namespace App\Services\Company;

use App\Models\AuditEvent;
use App\Models\Company;
use App\Models\User;
use App\Repositories\CompanyContextRepository;
use App\Repositories\CompanyRepository;
use App\Services\Archive\ArchiveService;
use App\Services\Audit\AuditEventService;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CompanyService
{
    public function __construct(
        protected CompanyRepository $companyRepository,
        protected ArchiveService $archiveService,
        protected AuditEventService $auditEventService,
        protected CompanyAccessService $companyAccessService,
        protected CompanyContextRepository $companyContextRepository
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Company List
    |--------------------------------------------------------------------------
    */

    public function getAll(
        string $tenantId,
        array $filters,
        User $actor
    ): LengthAwarePaginator {
        $companyIds = $this
            ->companyAccessService
            ->allowedCompanyIds(
                $tenantId,
                $actor
            );

        /*
        |--------------------------------------------------------------------------
        | Important
        |--------------------------------------------------------------------------
        |
        | null means unrestricted access.
        | [] means restricted, but no companies are available.
        |
        */

        if ($companyIds !== null) {
            $filters['company_ids'] =
                $companyIds;
        } else {
            unset(
                $filters['company_ids']
            );
        }

        $perPage = (int) (
            $filters['per_page'] ?? 20
        );

        return $this
            ->companyRepository
            ->paginateForTenant(
                $tenantId,
                $filters,
                $perPage
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Company Details
    |--------------------------------------------------------------------------
    */

    public function getById(
        string $tenantId,
        string $companyId,
        User $actor
    ): Company {
        $company = $this
            ->companyRepository
            ->findByTenantAndId(
                $tenantId,
                $companyId
            );

        if (!$company) {
            throw new DomainException(
                'Company not found.'
            );
        }

        $this
            ->companyAccessService
            ->requireView(
                $tenantId,
                $actor,
                $companyId
            );

        return $company;
    }

    /*
    |--------------------------------------------------------------------------
    | Create Company
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
    ): Company {
        $name = trim(
            (string) ($data['name'] ?? '')
        );

        if ($name === '') {
            throw new DomainException(
                'Company name is required.'
            );
        }

        $slug = $this->generateUniqueSlug(
            $tenantId,
            $data['slug'] ?? $name
        );

        $status = $data['status']
            ?? Company::STATUS_ACTIVE;

        if (
            !in_array(
                $status,
                [
                    Company::STATUS_ACTIVE,
                    Company::STATUS_INACTIVE,
                ],
                true
            )
        ) {
            throw new DomainException(
                'Invalid company status.'
            );
        }

        $payload = $this->preparePayload(
            $data
        );

        $payload['tenant_id'] = $tenantId;
        $payload['name'] = $name;
        $payload['slug'] = $slug;
        $payload['status'] = $status;
        $payload['created_by'] = $actor->id;
        $payload['updated_by'] = $actor->id;

        return DB::transaction(function () use (
            $tenantId,
            $payload,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $company = $this
                ->companyRepository
                ->create($payload);

            $createdCompany = $this
                ->companyRepository
                ->findByTenantAndId(
                    $tenantId,
                    $company->id
                );

            if (!$createdCompany) {
                throw new DomainException(
                    'Company was created but could not be reloaded.'
                );
            }

            $this
                ->auditEventService
                ->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_CREATED,
                    category: AuditEvent::CATEGORY_SYSTEM,
                    targetType: 'company',
                    targetId: (string) $createdCompany->id,
                    targetLabel: $createdCompany->name,
                    description: 'Company was created.',
                    changes: null,
                    metadata: [
                        'slug' =>
                        $createdCompany->slug,

                        'status' =>
                        $createdCompany->status,

                        'legal_name' =>
                        $createdCompany->legal_name,

                        'city' =>
                        $createdCompany->city,

                        'country' =>
                        $createdCompany->country,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            return $createdCompany;
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Update Company
    |--------------------------------------------------------------------------
    */

    public function update(
        string $tenantId,
        string $companyId,
        array $data,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Company {
        $company = $this
            ->companyRepository
            ->findByTenantAndId(
                $tenantId,
                $companyId
            );

        if (!$company) {
            throw new DomainException(
                'Company not found.'
            );
        }

        $this
            ->companyAccessService
            ->requireEdit(
                $tenantId,
                $actor,
                $companyId
            );

        if ($company->isArchived()) {
            throw new DomainException(
                'Archived companies cannot be modified.'
            );
        }

        $before = $this->snapshot(
            $company
        );

        $payload = $this->preparePayload(
            $data
        );

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
            $name = trim(
                (string) $data['name']
            );

            if ($name === '') {
                throw new DomainException(
                    'Company name is required.'
                );
            }

            $payload['name'] = $name;
        }

        /*
        |--------------------------------------------------------------------------
        | Slug
        |--------------------------------------------------------------------------
        */

        if (
            array_key_exists(
                'slug',
                $data
            )
        ) {
            $slugInput = trim(
                (string) $data['slug']
            );

            if ($slugInput === '') {
                throw new DomainException(
                    'Company slug cannot be empty.'
                );
            }

            $payload['slug'] =
                $this->generateUniqueSlug(
                    $tenantId,
                    $slugInput,
                    $company->id
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

        if (
            array_key_exists(
                'status',
                $data
            )
        ) {
            $status = $data['status'];

            if (
                !in_array(
                    $status,
                    [
                        Company::STATUS_ACTIVE,
                        Company::STATUS_INACTIVE,
                    ],
                    true
                )
            ) {
                throw new DomainException(
                    'Invalid company status.'
                );
            }

            $payload['status'] = $status;
        }

        $payload['updated_by'] =
            $actor->id;

        return DB::transaction(function () use (
            $tenantId,
            $company,
            $payload,
            $before,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $updatedCompany = $this
                ->companyRepository
                ->update(
                    $company,
                    $payload
                );

            $after = $this->snapshot(
                $updatedCompany
            );

            $changes = $this->buildChanges(
                $before,
                $after
            );

            if (!empty($changes)) {
                $this
                    ->auditEventService
                    ->record(
                        tenantId: $tenantId,
                        actor: $actor,
                        action: AuditEvent::ACTION_UPDATED,
                        category: AuditEvent::CATEGORY_SYSTEM,
                        targetType: 'company',
                        targetId: (string) $updatedCompany->id,
                        targetLabel: $updatedCompany->name,
                        description: 'Company was updated.',
                        changes: $changes,
                        metadata: null,
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );
            }

            return $updatedCompany;
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Company
    |--------------------------------------------------------------------------
    */

    public function archive(
        string $tenantId,
        string $companyId,
        User $actor,
        ?string $reason = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): void {
        $company = $this
            ->companyRepository
            ->findByTenantAndId(
                $tenantId,
                $companyId
            );

        if (!$company) {
            throw new DomainException(
                'Company not found.'
            );
        }

        $this
            ->companyAccessService
            ->requireManage(
                $tenantId,
                $actor,
                $companyId
            );

        if ($company->isArchived()) {
            throw new DomainException(
                'Company is already archived.'
            );
        }

        DB::transaction(function () use (
            $tenantId,
            $company,
            $actor,
            $reason,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $archivedCompany = $this
                ->companyRepository
                ->archive(
                    $company,
                    (string) $actor->id
                );

            $this
                ->companyContextRepository
                ->clearCompanySelections(
                    $tenantId,
                    $company->id
                );

            $this
                ->archiveService
                ->registerArchivedResource(
                    tenantId: $tenantId,
                    resourceType: 'company',
                    resourceId: (string) $company->id,
                    resourceLabel: $company->name,
                    actor: $actor,
                    reason: $reason,
                    metadata: [
                        'name' =>
                        $company->name,

                        'legal_name' =>
                        $company->legal_name,

                        'slug' =>
                        $company->slug,

                        'website' =>
                        $company->website,

                        'primary_contact_name' =>
                        $company->primary_contact_name,

                        'primary_contact_email' =>
                        $company->primary_contact_email,

                        'primary_contact_phone' =>
                        $company->primary_contact_phone,

                        'city' =>
                        $company->city,

                        'state_region' =>
                        $company->state_region,

                        'country' =>
                        $company->country,

                        'status' =>
                        $archivedCompany->status,

                        'created_by' =>
                        $company->created_by,

                        'created_at' =>
                        $company
                            ->created_at
                            ?->toISOString(),
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Company
    |--------------------------------------------------------------------------
    */

    public function restore(
        string $tenantId,
        string $companyId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Company {
        $company = $this
            ->companyRepository
            ->findByTenantAndIdWithTrashed(
                $tenantId,
                $companyId
            );

        if (!$company) {
            throw new DomainException(
                'Archived company not found.'
            );
        }

        $this
            ->companyAccessService
            ->requireManage(
                $tenantId,
                $actor,
                $companyId
            );

        if (
            !$company->trashed() ||
            !$company->isArchived()
        ) {
            throw new DomainException(
                'Company is not archived.'
            );
        }

        $archiveEntry = $this
            ->archiveService
            ->getArchivedByResource(
                $tenantId,
                'company',
                $companyId
            );

        if (!$archiveEntry) {
            throw new DomainException(
                'Company archive record not found.'
            );
        }

        return DB::transaction(function () use (
            $tenantId,
            $companyId,
            $company,
            $archiveEntry,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $this
                ->companyRepository
                ->restore(
                    $company,
                    (string) $actor->id
                );

            $this
                ->archiveService
                ->markRestored(
                    tenantId: $tenantId,
                    archiveEntryId: $archiveEntry->id,
                    actor: $actor,
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            $restoredCompany = $this
                ->companyRepository
                ->findByTenantAndId(
                    $tenantId,
                    $companyId
                );

            if (!$restoredCompany) {
                throw new DomainException(
                    'Company was restored but could not be reloaded.'
                );
            }

            return $restoredCompany;
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Company Status Counters
    |--------------------------------------------------------------------------
    */

    public function getStatusCounters(
        string $tenantId,
        User $actor
    ): array {
        $companyIds = $this
            ->companyAccessService
            ->allowedCompanyIds(
                $tenantId,
                $actor
            );

        return $this
            ->companyRepository
            ->countByStatus(
                $tenantId,
                $companyIds
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Company Switcher / Global Workspace
    |--------------------------------------------------------------------------
    */

    public function getAvailableCompanies(
        string $tenantId,
        User $actor
    ): Collection {
        $companyIds = $this
            ->companyAccessService
            ->allowedCompanyIds(
                $tenantId,
                $actor
            );

        return $this
            ->companyRepository
            ->allAvailableForTenant(
                $tenantId,
                $companyIds
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Unique Slug
    |--------------------------------------------------------------------------
    */

    private function generateUniqueSlug(
        string $tenantId,
        string $value,
        ?string $excludeCompanyId = null
    ): string {
        $baseSlug = Str::slug(
            trim($value)
        );

        if ($baseSlug === '') {
            $baseSlug = 'company';
        }

        $slug = $baseSlug;
        $suffix = 2;

        while (
            $this
            ->companyRepository
            ->slugExists(
                $tenantId,
                $slug,
                $excludeCompanyId
            )
        ) {
            $slug =
                $baseSlug
                . '-'
                . $suffix;

            $suffix++;
        }

        return $slug;
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare Writable Payload
    |--------------------------------------------------------------------------
    */

    private function preparePayload(
        array $data
    ): array {
        $fields = [
            'legal_name',
            'website',

            'primary_contact_name',
            'primary_contact_email',
            'primary_contact_phone',

            'address_line1',
            'address_line2',
            'city',
            'state_region',
            'postal_code',
            'country',

            'description',
            'notes',
        ];

        $payload = [];

        foreach ($fields as $field) {
            if (
                !array_key_exists(
                    $field,
                    $data
                )
            ) {
                continue;
            }

            $payload[$field] =
                $this->nullableText(
                    $data[$field]
                );
        }

        return $payload;
    }

    /*
    |--------------------------------------------------------------------------
    | Nullable Text Normalization
    |--------------------------------------------------------------------------
    */

    private function nullableText(
        mixed $value
    ): ?string {
        if ($value === null) {
            return null;
        }

        $value = trim(
            (string) $value
        );

        return $value !== ''
            ? $value
            : null;
    }

    /*
    |--------------------------------------------------------------------------
    | Company Snapshot
    |--------------------------------------------------------------------------
    */

    private function snapshot(
        Company $company
    ): array {
        return [
            'name' =>
            $company->name,

            'legal_name' =>
            $company->legal_name,

            'slug' =>
            $company->slug,

            'website' =>
            $company->website,

            'primary_contact_name' =>
            $company->primary_contact_name,

            'primary_contact_email' =>
            $company->primary_contact_email,

            'primary_contact_phone' =>
            $company->primary_contact_phone,

            'address_line1' =>
            $company->address_line1,

            'address_line2' =>
            $company->address_line2,

            'city' =>
            $company->city,

            'state_region' =>
            $company->state_region,

            'postal_code' =>
            $company->postal_code,

            'country' =>
            $company->country,

            'description' =>
            $company->description,

            'notes' =>
            $company->notes,

            'status' =>
            $company->status,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Build Audit Changes
    |--------------------------------------------------------------------------
    */

    private function buildChanges(
        array $before,
        array $after
    ): array {
        $changes = [];

        foreach ($after as $key => $value) {
            $beforeValue =
                $before[$key] ?? null;

            if ($beforeValue === $value) {
                continue;
            }

            $changes[$key] = [
                'from' => $beforeValue,
                'to' => $value,
            ];
        }

        return $changes;
    }
}
