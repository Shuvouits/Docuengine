<?php

namespace App\Repositories;

use App\Models\AssetKeeperLink;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class AssetKeeperLinkRepository
{
    public function queryForTenant(
        string $tenantId
    ): Builder {
        return AssetKeeperLink::query()
            ->forTenant($tenantId);
    }

    public function getForAsset(
        string $tenantId,
        string $assetId
    ): Collection {
        return $this
            ->queryForTenant($tenantId)
            ->forAsset($assetId)
            ->with([
                'keeperLink.company',
                'creator:id,name,email',
            ])
            ->latest('created_at')
            ->get();
    }

    public function findByTenantAssetAndId(
        string $tenantId,
        string $assetId,
        string $relationshipId
    ): ?AssetKeeperLink {
        return $this
            ->queryForTenant($tenantId)
            ->forAsset($assetId)
            ->with([
                'keeperLink.company',
                'creator:id,name,email',
            ])
            ->where(
                'id',
                $relationshipId
            )
            ->first();
    }

    public function findByAssetAndKeeperLink(
        string $tenantId,
        string $assetId,
        string $keeperLinkId
    ): ?AssetKeeperLink {
        return $this
            ->queryForTenant($tenantId)
            ->forAsset($assetId)
            ->forKeeperLink($keeperLinkId)
            ->first();
    }

    public function existsForAssetAndKeeperLink(
        string $tenantId,
        string $assetId,
        string $keeperLinkId
    ): bool {
        return $this
            ->queryForTenant($tenantId)
            ->forAsset($assetId)
            ->forKeeperLink($keeperLinkId)
            ->exists();
    }

    public function create(
        array $data
    ): AssetKeeperLink {
        $relationship = AssetKeeperLink::create(
            $data
        );

        return $relationship->load([
            'keeperLink.company',
            'creator:id,name,email',
        ]);
    }

    public function delete(
        AssetKeeperLink $relationship
    ): bool {
        return (bool) $relationship->delete();
    }

    public function deleteByAsset(
        string $tenantId,
        string $assetId
    ): int {
        return $this
            ->queryForTenant($tenantId)
            ->forAsset($assetId)
            ->delete();
    }

    public function countForAsset(
        string $tenantId,
        string $assetId
    ): int {
        return $this
            ->queryForTenant($tenantId)
            ->forAsset($assetId)
            ->count();
    }
}
