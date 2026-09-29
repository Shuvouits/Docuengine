<?php

namespace App\Repositories;

use App\Models\Asset;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class AssetRepository
{
    public function queryForTenant(
        string $tenantId
    ): Builder {
        return Asset::query()
            ->forTenant($tenantId);
    }

    public function paginateForTenant(
        string $tenantId,
        array $filters = [],
        int $perPage = 20
    ): LengthAwarePaginator {
        $query = $this
            ->queryForTenant($tenantId)
            ->with(
                $this->listRelations()
            );

        $this->applyFilters(
            $query,
            $filters
        );

        $perPage = max(
            1,
            min($perPage, 100)
        );

        return $query->paginate(
            $perPage
        );
    }

    public function findByTenantAndId(
        string $tenantId,
        string $assetId
    ): ?Asset {
        return $this
            ->queryForTenant($tenantId)
            ->with(
                $this->detailRelations()
            )
            ->where(
                'id',
                $assetId
            )
            ->first();
    }

    public function findByTenantAndIdWithTrashed(
        string $tenantId,
        string $assetId
    ): ?Asset {
        return $this
            ->queryForTenant($tenantId)
            ->withTrashed()
            ->with(
                $this->detailRelations()
            )
            ->where(
                'id',
                $assetId
            )
            ->first();
    }

    public function findManyByTenantAndIds(
        string $tenantId,
        array $assetIds,
        ?array $companyIds = null,
        bool $withTrashed = false
    ): Collection {
        $assetIds = array_values(
            array_unique(
                array_filter($assetIds)
            )
        );

        if (empty($assetIds)) {
            return new Collection();
        }

        $query = $this
            ->queryForTenant($tenantId)
            ->with(
                $this->listRelations()
            )
            ->whereIn(
                'id',
                $assetIds
            );

        if ($withTrashed) {
            $query->withTrashed();
        }

        $this->applyCompanyScope(
            $query,
            $companyIds
        );

        return $query->get();
    }

    public function getForExport(
        string $tenantId,
        array $filters = [],
        int $maxRows = 10000
    ): Collection {
        $query = $this
            ->queryForTenant($tenantId)
            ->with(
                $this->detailRelations()
            );

        $this->applyFilters(
            $query,
            $filters
        );

        $maxRows = max(
            1,
            min($maxRows, 10000)
        );

        return $query
            ->limit($maxRows)
            ->get();
    }

    public function summaryForTenant(
        string $tenantId,
        ?array $companyIds = null
    ): array {
        $baseQuery = $this
            ->queryForTenant($tenantId);

        $this->applyCompanyScope(
            $baseQuery,
            $companyIds
        );

        $today = now()
            ->toDateString();

        return [
            'total' => (clone $baseQuery)
                ->count(),

            'active' => (clone $baseQuery)
                ->where(
                    'status',
                    Asset::STATUS_ACTIVE
                )
                ->count(),

            'inactive' => (clone $baseQuery)
                ->where(
                    'status',
                    Asset::STATUS_INACTIVE
                )
                ->count(),

            'owned' => (clone $baseQuery)
                ->whereNotNull(
                    'owner_user_id'
                )
                ->count(),

            'unowned' => (clone $baseQuery)
                ->whereNull(
                    'owner_user_id'
                )
                ->count(),

            'assigned' => (clone $baseQuery)
                ->whereNotNull(
                    'assigned_user_id'
                )
                ->count(),

            'unassigned' => (clone $baseQuery)
                ->whereNull(
                    'assigned_user_id'
                )
                ->count(),

            'manual' => (clone $baseQuery)
                ->where(
                    'data_source',
                    Asset::DATA_SOURCE_MANUAL
                )
                ->count(),

            'integration' => (clone $baseQuery)
                ->where(
                    'data_source',
                    Asset::DATA_SOURCE_INTEGRATION
                )
                ->count(),

            'mixed' => (clone $baseQuery)
                ->where(
                    'data_source',
                    Asset::DATA_SOURCE_MIXED
                )
                ->count(),

            'warranty_active' => (clone $baseQuery)
                ->whereNotNull(
                    'warranty_expiration_date'
                )
                ->whereDate(
                    'warranty_expiration_date',
                    '>=',
                    $today
                )
                ->count(),

            'warranty_expired' => (clone $baseQuery)
                ->whereNotNull(
                    'warranty_expiration_date'
                )
                ->whereDate(
                    'warranty_expiration_date',
                    '<',
                    $today
                )
                ->count(),

            'warranty_none' => (clone $baseQuery)
                ->whereNull(
                    'warranty_expiration_date'
                )
                ->count(),

            'lifecycle' => [
                Asset::LIFECYCLE_ACTIVE =>
                    (clone $baseQuery)
                        ->where(
                            'lifecycle_status',
                            Asset::LIFECYCLE_ACTIVE
                        )
                        ->count(),

                Asset::LIFECYCLE_IN_STOCK =>
                    (clone $baseQuery)
                        ->where(
                            'lifecycle_status',
                            Asset::LIFECYCLE_IN_STOCK
                        )
                        ->count(),

                Asset::LIFECYCLE_ASSIGNED =>
                    (clone $baseQuery)
                        ->where(
                            'lifecycle_status',
                            Asset::LIFECYCLE_ASSIGNED
                        )
                        ->count(),

                Asset::LIFECYCLE_MAINTENANCE =>
                    (clone $baseQuery)
                        ->where(
                            'lifecycle_status',
                            Asset::LIFECYCLE_MAINTENANCE
                        )
                        ->count(),

                Asset::LIFECYCLE_RETIRED =>
                    (clone $baseQuery)
                        ->where(
                            'lifecycle_status',
                            Asset::LIFECYCLE_RETIRED
                        )
                        ->count(),

                Asset::LIFECYCLE_DECOMMISSIONED =>
                    (clone $baseQuery)
                        ->where(
                            'lifecycle_status',
                            Asset::LIFECYCLE_DECOMMISSIONED
                        )
                        ->count(),
            ],
        ];
    }

    public function countByCompany(
        string $tenantId,
        ?array $companyIds = null
    ): array {
        $query = $this
            ->queryForTenant($tenantId);

        $this->applyCompanyScope(
            $query,
            $companyIds
        );

        return $query
            ->select('company_id')
            ->selectRaw(
                'COUNT(*) as total'
            )
            ->groupBy('company_id')
            ->get()
            ->mapWithKeys(
                fn (Asset $asset) => [
                    (string) $asset->company_id =>
                        (int) $asset->total,
                ]
            )
            ->all();
    }

    public function countByLayout(
        string $tenantId,
        ?array $companyIds = null
    ): array {
        $query = $this
            ->queryForTenant($tenantId);

        $this->applyCompanyScope(
            $query,
            $companyIds
        );

        return $query
            ->select('asset_layout_id')
            ->selectRaw(
                'COUNT(*) as total'
            )
            ->groupBy('asset_layout_id')
            ->get()
            ->mapWithKeys(
                fn (Asset $asset) => [
                    (string) $asset->asset_layout_id =>
                        (int) $asset->total,
                ]
            )
            ->all();
    }

    public function recentCreated(
        string $tenantId,
        ?array $companyIds = null,
        int $limit = 10
    ): Collection {
        $query = $this
            ->queryForTenant($tenantId)
            ->with(
                $this->listRelations()
            );

        $this->applyCompanyScope(
            $query,
            $companyIds
        );

        $limit = max(
            1,
            min($limit, 50)
        );

        return $query
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }

    public function recentUpdated(
        string $tenantId,
        ?array $companyIds = null,
        int $limit = 10
    ): Collection {
        $query = $this
            ->queryForTenant($tenantId)
            ->with(
                $this->listRelations()
            );

        $this->applyCompanyScope(
            $query,
            $companyIds
        );

        $limit = max(
            1,
            min($limit, 50)
        );

        return $query
            ->latest('updated_at')
            ->limit($limit)
            ->get();
    }

    public function create(
        array $data
    ): Asset {
        return Asset::query()
            ->create($data);
    }

    public function update(
        Asset $asset,
        array $data
    ): Asset {
        $asset->fill($data);

        $asset->updated_at = now();

        $asset->save();

        return $asset->refresh();
    }

    public function archive(
        Asset $asset
    ): bool {
        return (bool) $asset->delete();
    }

    public function restore(
        Asset $asset
    ): bool {
        return (bool) $asset->restore();
    }

    private function applyFilters(
        Builder $query,
        array $filters
    ): void {
        if (
            array_key_exists(
                'company_ids',
                $filters
            )
        ) {
            $companyIds = is_array(
                $filters['company_ids']
            )
                ? $filters['company_ids']
                : [];

            $this->applyCompanyScope(
                $query,
                $companyIds
            );
        }

        if (
            filter_var(
                $filters['archived'] ?? false,
                FILTER_VALIDATE_BOOLEAN
            )
        ) {
            $query->onlyTrashed();
        }

        $search = trim(
            (string) (
                $filters['search']
                ?? ''
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
                        )
                        ->orWhereHas(
                            'fieldValues',
                            function (
                                Builder $fieldQuery
                            ) use ($search) {
                                $fieldQuery->where(
                                    'value_text',
                                    'like',
                                    "%{$search}%"
                                );
                            }
                        )
                        ->orWhereHas(
                            'tags',
                            function (
                                Builder $tagQuery
                            ) use ($search) {
                                $tagQuery->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                );
                            }
                        );
                }
            );
        }

        if (!empty($filters['company_id'])) {
            $query->where(
                'company_id',
                $filters['company_id']
            );
        }

        if (!empty($filters['asset_layout_id'])) {
            $query->where(
                'asset_layout_id',
                $filters['asset_layout_id']
            );
        }

        if (!empty($filters['status'])) {
            $query->where(
                'status',
                $filters['status']
            );
        }

        if (!empty($filters['owner_user_id'])) {
            $query->where(
                'owner_user_id',
                $filters['owner_user_id']
            );
        }

        if (!empty($filters['assigned_user_id'])) {
            $query->where(
                'assigned_user_id',
                $filters['assigned_user_id']
            );
        }

        if (!empty($filters['data_source'])) {
            $query->where(
                'data_source',
                $filters['data_source']
            );
        }

        if (!empty($filters['lifecycle_status'])) {
            $query->where(
                'lifecycle_status',
                $filters['lifecycle_status']
            );
        }

        $tagIds =
            $filters['tag_ids']
            ?? [];

        if (
            is_array($tagIds) &&
            !empty($tagIds)
        ) {
            $tagIds = array_values(
                array_unique(
                    array_filter($tagIds)
                )
            );

            $query->whereHas(
                'tags',
                function (
                    Builder $tagQuery
                ) use ($tagIds) {
                    $tagQuery->whereIn(
                        'asset_tags.id',
                        $tagIds
                    );
                }
            );
        }

        $warrantyStatus =
            $filters['warranty_status']
            ?? null;

        if ($warrantyStatus === 'expired') {
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

        if ($warrantyStatus === 'active') {
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

        if ($warrantyStatus === 'none') {
            $query->whereNull(
                'warranty_expiration_date'
            );
        }

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
            $filters['sort_by']
            ?? 'updated_at';

        if (
            !in_array(
                $sortBy,
                $allowedSorts,
                true
            )
        ) {
            $sortBy = 'updated_at';
        }

        $sortDirection = strtolower(
            (string) (
                $filters['sort_direction']
                ?? 'desc'
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
            $sortDirection = 'desc';
        }

        $query->orderBy(
            $sortBy,
            $sortDirection
        );
    }

    private function applyCompanyScope(
        Builder $query,
        ?array $companyIds
    ): void {
        if ($companyIds === null) {
            return;
        }

        $companyIds = array_values(
            array_unique(
                array_filter($companyIds)
            )
        );

        if (empty($companyIds)) {
            $query->whereRaw(
                '1 = 0'
            );

            return;
        }

        $query->whereIn(
            'company_id',
            $companyIds
        );
    }

    private function listRelations(): array
    {
        return [
            'company:id,name',
            'layout:id,name,slug,current_version',
            'layoutVersion:id,asset_layout_id,version_number',
            'owner:id,name,email',
            'assignedUser:id,name,email',
            'tags:id,name,slug',
        ];
    }

    private function detailRelations(): array
    {
        return [
            'company:id,name',
            'layout',
            'layoutVersion',
            'fieldValues.layoutField',
            'owner:id,name,email',
            'assignedUser:id,name,email',
            'creator:id,name,email',
            'updater:id,name,email',
            'tags:id,name,slug',
        ];
    }
}
