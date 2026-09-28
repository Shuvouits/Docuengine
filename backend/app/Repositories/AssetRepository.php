<?php

namespace App\Repositories;

use App\Models\Asset;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class AssetRepository
{
    /*
    |--------------------------------------------------------------------------
    | Base Tenant Query
    |--------------------------------------------------------------------------
    */

    public function queryForTenant(
        string $tenantId
    ): Builder {
        return Asset::query()
            ->forTenant($tenantId);
    }

    /*
    |--------------------------------------------------------------------------
    | Asset List
    |--------------------------------------------------------------------------
    */

    public function paginateForTenant(
        string $tenantId,
        array $filters = [],
        int $perPage = 20
    ): LengthAwarePaginator {
        $query = $this
            ->queryForTenant(
                $tenantId
            )
            ->with([
                'company:id,name',
                'layout:id,name,slug,current_version',
                'layoutVersion:id,asset_layout_id,version_number',
                'owner:id,name,email',
                'assignedUser:id,name,email',
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
                $query->whereRaw(
                    '1 = 0'
                );
            } else {
                $query->whereIn(
                    'company_id',
                    $companyIds
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Archived Assets
        |--------------------------------------------------------------------------
        */

        if (
            filter_var(
                $filters['archived'] ?? false,
                FILTER_VALIDATE_BOOLEAN
            )
        ) {
            $query->onlyTrashed();
        }

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) (
                $filters['search'] ?? ''
            )
        );

        if ($search !== '') {
            $query->where(
                function (
                    Builder $builder
                ) use ($search) {
                    $builder
                        ->where(
                            'name',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'notes',
                            'like',
                            "%{$search}%"
                        );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Company Filter
        |--------------------------------------------------------------------------
        */

        $companyId =
            $filters['company_id'] ??
            null;

        if ($companyId) {
            $query->where(
                'company_id',
                $companyId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Asset Layout Filter
        |--------------------------------------------------------------------------
        */

        $layoutId =
            $filters['asset_layout_id'] ??
            null;

        if ($layoutId) {
            $query->where(
                'asset_layout_id',
                $layoutId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Status Filter
        |--------------------------------------------------------------------------
        */

        $status =
            $filters['status'] ??
            null;

        if ($status) {
            $query->where(
                'status',
                $status
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Owner Filter
        |--------------------------------------------------------------------------
        */

        $ownerUserId =
            $filters['owner_user_id'] ??
            null;

        if ($ownerUserId) {
            $query->where(
                'owner_user_id',
                $ownerUserId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Assigned User Filter
        |--------------------------------------------------------------------------
        */

        $assignedUserId =
            $filters['assigned_user_id'] ??
            null;

        if ($assignedUserId) {
            $query->where(
                'assigned_user_id',
                $assignedUserId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Data Source Filter
        |--------------------------------------------------------------------------
        */

        $dataSource =
            $filters['data_source'] ??
            null;

        if ($dataSource) {
            $query->where(
                'data_source',
                $dataSource
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Lifecycle Filter
        |--------------------------------------------------------------------------
        */

        $lifecycleStatus =
            $filters['lifecycle_status'] ??
            null;

        if ($lifecycleStatus) {
            $query->where(
                'lifecycle_status',
                $lifecycleStatus
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Warranty Filter
        |--------------------------------------------------------------------------
        */

        $warrantyStatus =
            $filters['warranty_status'] ??
            null;

        if (
            $warrantyStatus ===
            'expired'
        ) {
            $query
                ->whereNotNull(
                    'warranty_expiration_date'
                )
                ->whereDate(
                    'warranty_expiration_date',
                    '<',
                    now()->toDateString()
                );
        }

        if (
            $warrantyStatus ===
            'active'
        ) {
            $query
                ->whereNotNull(
                    'warranty_expiration_date'
                )
                ->whereDate(
                    'warranty_expiration_date',
                    '>=',
                    now()->toDateString()
                );
        }

        if (
            $warrantyStatus ===
            'none'
        ) {
            $query->whereNull(
                'warranty_expiration_date'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        $allowedSorts = [
            'name',
            'status',
            'data_source',
            'lifecycle_status',
            'warranty_expiration_date',
            'created_at',
            'updated_at',
        ];

        $sortBy =
            $filters['sort_by'] ??
            'updated_at';

        if (
            !in_array(
                $sortBy,
                $allowedSorts,
                true
            )
        ) {
            $sortBy =
                'updated_at';
        }

        $sortDirection =
            strtolower(
                (string) (
                    $filters['sort_direction'] ??
                    'desc'
                )
            );

        if (
            !in_array(
                $sortDirection,
                [
                    'asc',
                    'desc',
                ],
                true
            )
        ) {
            $sortDirection =
                'desc';
        }

        return $query
            ->orderBy(
                $sortBy,
                $sortDirection
            )
            ->paginate(
                $perPage
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Asset
    |--------------------------------------------------------------------------
    */

    public function findByTenantAndId(
        string $tenantId,
        string $assetId
    ): ?Asset {
        return $this
            ->queryForTenant(
                $tenantId
            )
            ->with([
                'company:id,name',
                'layout',
                'layoutVersion',
                'fieldValues.layoutField',
                'owner:id,name,email',
                'assignedUser:id,name,email',
                'creator:id,name,email',
                'updater:id,name,email',
            ])
            ->where(
                'id',
                $assetId
            )
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Find Asset With Trashed
    |--------------------------------------------------------------------------
    */

    public function findByTenantAndIdWithTrashed(
        string $tenantId,
        string $assetId
    ): ?Asset {
        return $this
            ->queryForTenant(
                $tenantId
            )
            ->withTrashed()
            ->with([
                'company:id,name',
                'layout',
                'layoutVersion',
                'fieldValues.layoutField',
                'owner:id,name,email',
                'assignedUser:id,name,email',
            ])
            ->where(
                'id',
                $assetId
            )
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Create Asset
    |--------------------------------------------------------------------------
    */

    public function create(
        array $data
    ): Asset {
        return Asset::query()
            ->create(
                $data
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Asset
    |--------------------------------------------------------------------------
    */

    public function update(
        Asset $asset,
        array $data
    ): Asset {
        $asset->fill(
            $data
        );

        $asset->save();

        return $asset
            ->refresh();
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Asset
    |--------------------------------------------------------------------------
    */

    public function archive(
        Asset $asset
    ): bool {
        return (bool)
            $asset->delete();
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Asset
    |--------------------------------------------------------------------------
    */

    public function restore(
        Asset $asset
    ): bool {
        return (bool)
            $asset->restore();
    }
}
