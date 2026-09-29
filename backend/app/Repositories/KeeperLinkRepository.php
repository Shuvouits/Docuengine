<?php

namespace App\Repositories;

use App\Models\KeeperLink;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class KeeperLinkRepository
{
    public function queryForTenant(
        string $tenantId
    ): Builder {
        return KeeperLink::query()
            ->forTenant($tenantId);
    }

    public function paginateForTenant(
        string $tenantId,
        array $filters = [],
        int $perPage = 25
    ): LengthAwarePaginator {
        $query = $this
            ->queryForTenant($tenantId)
            ->with([
                'company:id,name',
                'creator:id,name,email',
                'updater:id,name,email',
            ]);

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
                !is_array($companyIds) ||
                empty($companyIds)
            ) {
                $query->whereRaw('1 = 0');
            } else {
                $query->whereIn(
                    'company_id',
                    $companyIds
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Company Filter
        |--------------------------------------------------------------------------
        */

        if (
            !empty(
                $filters['company_id']
            )
        ) {
            $query->where(
                'company_id',
                $filters['company_id']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) (
                $filters['search']
                ?? ''
            )
        );

        if ($search !== '') {
            $query->search($search);
        }

        $perPage = max(
            1,
            min($perPage, 100)
        );

        return $query
            ->latest('updated_at')
            ->paginate($perPage);
    }

    public function findByTenantAndId(
        string $tenantId,
        string $keeperLinkId
    ): ?KeeperLink {
        return $this
            ->queryForTenant($tenantId)
            ->with([
                'company:id,name',
                'creator:id,name,email',
                'updater:id,name,email',
            ])
            ->where(
                'id',
                $keeperLinkId
            )
            ->first();
    }

    public function findByTenantCompanyAndId(
        string $tenantId,
        string $companyId,
        string $keeperLinkId
    ): ?KeeperLink {
        return $this
            ->queryForTenant($tenantId)
            ->where(
                'company_id',
                $companyId
            )
            ->where(
                'id',
                $keeperLinkId
            )
            ->with([
                'company:id,name',
                'creator:id,name,email',
                'updater:id,name,email',
            ])
            ->first();
    }

    public function findManyByTenantAndIds(
        string $tenantId,
        array $keeperLinkIds
    ): Collection {
        $keeperLinkIds = array_values(
            array_unique(
                array_filter(
                    array_map(
                        fn ($id) =>
                            trim((string) $id),
                        $keeperLinkIds
                    )
                )
            )
        );

        if (empty($keeperLinkIds)) {
            return new Collection();
        }

        return $this
            ->queryForTenant($tenantId)
            ->whereIn(
                'id',
                $keeperLinkIds
            )
            ->get();
    }

    public function create(
        array $data
    ): KeeperLink {
        $keeperLink = KeeperLink::query()
            ->create($data);

        return $keeperLink->load([
            'company:id,name',
            'creator:id,name,email',
            'updater:id,name,email',
        ]);
    }

    public function update(
        KeeperLink $keeperLink,
        array $data
    ): KeeperLink {
        $keeperLink->fill($data);

        $keeperLink->save();

        return $keeperLink
            ->refresh()
            ->load([
                'company:id,name',
                'creator:id,name,email',
                'updater:id,name,email',
            ]);
    }

    public function delete(
        KeeperLink $keeperLink
    ): bool {
        return (bool)
            $keeperLink->delete();
    }

    public function paginateForCompany(
        string $tenantId,
        string $companyId,
        int $perPage = 25
    ): LengthAwarePaginator {
        $perPage = max(
            1,
            min($perPage, 100)
        );

        return $this
            ->queryForTenant($tenantId)
            ->where(
                'company_id',
                $companyId
            )
            ->with([
                'company:id,name',
                'creator:id,name,email',
                'updater:id,name,email',
            ])
            ->latest('updated_at')
            ->paginate($perPage);
    }

    public function countForCompany(
        string $tenantId,
        string $companyId
    ): int {
        return $this
            ->queryForTenant($tenantId)
            ->where(
                'company_id',
                $companyId
            )
            ->count();
    }
}
