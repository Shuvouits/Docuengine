<?php

namespace App\Repositories;

use App\Models\Asset;
use App\Models\AssetTag;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AssetTagRepository
{
    public function queryForTenant(
        string $tenantId
    ): Builder {
        return AssetTag::query()
            ->forTenant($tenantId);
    }

    public function getAllByTenant(
        string $tenantId
    ): Collection {
        return $this
            ->queryForTenant($tenantId)
            ->withCount('assets')
            ->orderBy('name')
            ->get();
    }

    public function findById(
        string $tenantId,
        string $tagId
    ): ?AssetTag {
        return $this
            ->queryForTenant($tenantId)
            ->where(
                'id',
                $tagId
            )
            ->first();
    }

    public function findBySlug(
        string $tenantId,
        string $slug
    ): ?AssetTag {
        return $this
            ->queryForTenant($tenantId)
            ->where(
                'slug',
                $slug
            )
            ->first();
    }

    public function findManyByIds(
        string $tenantId,
        array $tagIds
    ): Collection {
        $tagIds = array_values(
            array_unique(
                array_filter($tagIds)
            )
        );

        if (empty($tagIds)) {
            return new Collection();
        }

        return $this
            ->queryForTenant($tenantId)
            ->whereIn(
                'id',
                $tagIds
            )
            ->orderBy('name')
            ->get();
    }

    public function create(
        array $data
    ): AssetTag {
        return AssetTag::query()
            ->create($data);
    }

    public function update(
        AssetTag $tag,
        array $data
    ): AssetTag {
        $tag->fill($data);

        $tag->save();

        return $tag->refresh();
    }

    public function delete(
        AssetTag $tag
    ): bool {
        return (bool) $tag->delete();
    }

    public function slugExists(
        string $tenantId,
        string $slug,
        ?string $excludeTagId = null
    ): bool {
        $query = $this
            ->queryForTenant($tenantId)
            ->where(
                'slug',
                $slug
            );

        if ($excludeTagId !== null) {
            $query->where(
                'id',
                '!=',
                $excludeTagId
            );
        }

        return $query->exists();
    }

    public function getForAsset(
        string $tenantId,
        string $assetId
    ): Collection {
        return $this
            ->queryForTenant($tenantId)
            ->whereHas(
                'assets',
                function (
                    Builder $query
                ) use (
                    $tenantId,
                    $assetId
                ) {
                    $query
                        ->where(
                            'assets.tenant_id',
                            $tenantId
                        )
                        ->where(
                            'assets.id',
                            $assetId
                        );
                }
            )
            ->orderBy('name')
            ->get();
    }

    public function syncForAsset(
        string $tenantId,
        Asset $asset,
        array $tagIds,
        string $userId
    ): void {
        $tagIds = array_values(
            array_unique(
                array_filter($tagIds)
            )
        );

        DB::table(
            'asset_tag_assignments'
        )
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'asset_id',
                $asset->id
            )
            ->delete();

        if (empty($tagIds)) {
            return;
        }

        $now = now();

        $rows = [];

        foreach ($tagIds as $tagId) {
            $rows[] = [
                'id' =>
                    (string) str()->uuid(),

                'tenant_id' =>
                    $tenantId,

                'asset_id' =>
                    $asset->id,

                'asset_tag_id' =>
                    $tagId,

                'created_by' =>
                    $userId,

                'created_at' =>
                    $now,

                'updated_at' =>
                    $now,
            ];
        }

        DB::table(
            'asset_tag_assignments'
        )->insert($rows);
    }

    public function removeAllForAsset(
        string $tenantId,
        string $assetId
    ): int {
        return DB::table(
            'asset_tag_assignments'
        )
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'asset_id',
                $assetId
            )
            ->delete();
    }
}
