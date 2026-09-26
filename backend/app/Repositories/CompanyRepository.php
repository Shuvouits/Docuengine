<?php

namespace App\Repositories;

use App\Models\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class CompanyRepository
{
    /*
    |--------------------------------------------------------------------------
    | Base Tenant Query
    |--------------------------------------------------------------------------
    */

    public function queryForTenant(
        string $tenantId
    ): Builder {
        return Company::query()
            ->forTenant($tenantId);
    }

    /*
    |--------------------------------------------------------------------------
    | Company List
    |--------------------------------------------------------------------------
    */

    public function paginateForTenant(
        string $tenantId,
        array $filters = [],
        int $perPage = 20
    ): LengthAwarePaginator {
        $query = $this->queryForTenant(
            $tenantId
        );



        /*
|--------------------------------------------------------------------------
| Security Group Company Scope
|--------------------------------------------------------------------------
*/

        if (
            array_key_exists(
                'company_ids',
                $filters
            )
        ) {
            $companyIds =
                $filters['company_ids'];

            if (
                !is_array(
                    $companyIds
                ) ||
                empty($companyIds)
            ) {
                $query->whereRaw(
                    '1 = 0'
                );
            } else {
                $query->whereIn(
                    'id',
                    $companyIds
                );
            }
        }



        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) ($filters['search'] ?? '')
        );

        if ($search !== '') {
            $query->where(function (
                Builder $builder
            ) use ($search) {
                $builder
                    ->where(
                        'name',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'legal_name',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'slug',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'primary_contact_name',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'primary_contact_email',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'primary_contact_phone',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'city',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'state_region',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'country',
                        'like',
                        "%{$search}%"
                    );
            });
        }



        /*
|--------------------------------------------------------------------------
| Status Filter
|--------------------------------------------------------------------------
*/

        $status = $filters['status'] ?? null;

        if (
            $status ===
            Company::STATUS_ARCHIVED
        ) {
            $query->withTrashed();
        }

        if (
            $status &&
            in_array(
                $status,
                Company::statuses(),
                true
            )
        ) {
            $query->where(
                'status',
                $status
            );
        }

        /*
|--------------------------------------------------------------------------
| Archive Visibility
|--------------------------------------------------------------------------
*/

        $includeArchived = filter_var(
            $filters['include_archived'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        );

        if ($includeArchived) {
            $query->withTrashed();
        }




        /*
        |--------------------------------------------------------------------------
        | Archive Visibility
        |--------------------------------------------------------------------------
        */

        $includeArchived = filter_var(
            $filters['include_archived'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        );

        if ($includeArchived) {
            $query->withTrashed();
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        $sortBy = $filters['sort_by'] ?? 'name';

        $allowedSortColumns = [
            'name',
            'status',
            'city',
            'created_at',
            'updated_at',
        ];

        if (
            !in_array(
                $sortBy,
                $allowedSortColumns,
                true
            )
        ) {
            $sortBy = 'name';
        }

        $sortDirection = strtolower(
            (string) (
                $filters['sort_direction'] ??
                'asc'
            )
        );

        if (
            !in_array(
                $sortDirection,
                ['asc', 'desc'],
                true
            )
        ) {
            $sortDirection = 'asc';
        }

        return $query
            ->orderBy(
                $sortBy,
                $sortDirection
            )
            ->paginate(
                max(
                    1,
                    min(
                        $perPage,
                        100
                    )
                )
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Company
    |--------------------------------------------------------------------------
    */

    public function findByTenantAndId(
        string $tenantId,
        string $companyId
    ): ?Company {
        return $this
            ->queryForTenant($tenantId)
            ->where(
                'id',
                $companyId
            )
            ->first();
    }

    public function findByTenantAndIdWithTrashed(
        string $tenantId,
        string $companyId
    ): ?Company {
        return Company::query()
            ->withTrashed()
            ->forTenant($tenantId)
            ->where(
                'id',
                $companyId
            )
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Slug
    |--------------------------------------------------------------------------
    */

    public function findByTenantAndSlug(
        string $tenantId,
        string $slug
    ): ?Company {
        return $this
            ->queryForTenant($tenantId)
            ->where(
                'slug',
                $slug
            )
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Slug Exists
    |--------------------------------------------------------------------------
    */

    public function slugExists(
        string $tenantId,
        string $slug,
        ?string $excludeCompanyId = null
    ): bool {
        $query = Company::query()
            ->withTrashed()
            ->forTenant($tenantId)
            ->where(
                'slug',
                $slug
            );

        if ($excludeCompanyId) {
            $query->where(
                'id',
                '!=',
                $excludeCompanyId
            );
        }

        return $query->exists();
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    public function create(
        array $data
    ): Company {
        return Company::query()
            ->create($data);
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    public function update(
        Company $company,
        array $data
    ): Company {
        $company->update($data);

        return $company->fresh();
    }

    /*
    |--------------------------------------------------------------------------
    | Archive
    |--------------------------------------------------------------------------
    */

    public function archive(
        Company $company,
        ?string $archivedBy = null
    ): Company {
        $company->update([
            'status' =>
            Company::STATUS_ARCHIVED,

            'archived_at' =>
            now(),

            'archived_by' =>
            $archivedBy,

            'updated_by' =>
            $archivedBy,
        ]);

        $company->delete();

        return $company;
    }

    /*
    |--------------------------------------------------------------------------
    | Restore
    |--------------------------------------------------------------------------
    */

    public function restore(
        Company $company,
        ?string $restoredBy = null
    ): Company {
        if ($company->trashed()) {
            $company->restore();
        }

        $company->update([
            'status' =>
            Company::STATUS_ACTIVE,

            'archived_at' =>
            null,

            'archived_by' =>
            null,

            'updated_by' =>
            $restoredBy,
        ]);

        return $company->fresh();
    }


    public function countByStatus(
        string $tenantId,
        ?array $companyIds = null
    ): array {
        $baseQuery = Company::query()
            ->withTrashed()
            ->forTenant(
                $tenantId
            );

        if ($companyIds !== null) {
            if (empty($companyIds)) {
                $baseQuery->whereRaw(
                    '1 = 0'
                );
            } else {
                $baseQuery->whereIn(
                    'id',
                    $companyIds
                );
            }
        }

        return [
            'total' => (clone $baseQuery)
                ->count(),

            'active' => (clone $baseQuery)
                ->where(
                    'status',
                    Company::STATUS_ACTIVE
                )
                ->count(),

            'inactive' => (clone $baseQuery)
                ->where(
                    'status',
                    Company::STATUS_INACTIVE
                )
                ->count(),

            'archived' => (clone $baseQuery)
                ->where(
                    'status',
                    Company::STATUS_ARCHIVED
                )
                ->count(),
        ];
    }





    public function allAvailableForTenant(
        string $tenantId,
        ?array $companyIds = null
    ) {
        $query = Company::query()
            ->forTenant(
                $tenantId
            )
            ->where(
                'status',
                '!=',
                Company::STATUS_ARCHIVED
            );

        if ($companyIds !== null) {
            if (empty($companyIds)) {
                $query->whereRaw(
                    '1 = 0'
                );
            } else {
                $query->whereIn(
                    'id',
                    $companyIds
                );
            }
        }

        return $query
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'slug',
                'status',
                'city',
                'state_region',
                'country',
            ]);
    }


    /*
|--------------------------------------------------------------------------
| Company Workspace
|--------------------------------------------------------------------------
*/

    public function findForWorkspace(
        string $tenantId,
        string $companyId
    ): ?Company {
        return Company::query()
            ->forTenant($tenantId)
            ->withCount([
                'assetLayoutActivations',
            ])
            ->where(
                'id',
                $companyId
            )
            ->first();
    }

    /*
|--------------------------------------------------------------------------
| Global Workspace Overview
|--------------------------------------------------------------------------
*/

    public function globalWorkspaceCompanies(
        string $tenantId,
        ?array $companyIds = null
    ) {
        $query = Company::query()
            ->forTenant(
                $tenantId
            )
            ->where(
                'status',
                '!=',
                Company::STATUS_ARCHIVED
            )
            ->withCount([
                'assetLayoutActivations',
            ]);

        if ($companyIds !== null) {
            if (empty($companyIds)) {
                $query->whereRaw(
                    '1 = 0'
                );
            } else {
                $query->whereIn(
                    'id',
                    $companyIds
                );
            }
        }

        return $query
            ->orderBy('name')
            ->get();
    }
}
