<?php

namespace App\Repositories;

use App\Models\AssetRelationship;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class AssetRelationshipRepository
{
    public function queryForTenant(
        string $tenantId
    ): Builder {
        return AssetRelationship::query()
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
                'sourceAsset.company',
                'relatedAsset.company',
                'creator:id,name,email',
            ])
            ->latest('created_at')
            ->get();
    }

    public function getOutgoingForAsset(
        string $tenantId,
        string $assetId
    ): Collection {
        return $this
            ->queryForTenant($tenantId)
            ->forSourceAsset($assetId)
            ->with([
                'relatedAsset.company',
                'creator:id,name,email',
            ])
            ->latest('created_at')
            ->get();
    }

    public function getIncomingForAsset(
        string $tenantId,
        string $assetId
    ): Collection {
        return $this
            ->queryForTenant($tenantId)
            ->forRelatedAsset($assetId)
            ->with([
                'sourceAsset.company',
                'creator:id,name,email',
            ])
            ->latest('created_at')
            ->get();
    }

    public function findByTenantAssetAndId(
        string $tenantId,
        string $assetId,
        string $relationshipId
    ): ?AssetRelationship {
        return $this
            ->queryForTenant($tenantId)
            ->forAsset($assetId)
            ->with([
                'sourceAsset.company',
                'relatedAsset.company',
                'creator:id,name,email',
            ])
            ->where(
                'id',
                $relationshipId
            )
            ->first();
    }

    public function findExact(
        string $tenantId,
        string $sourceAssetId,
        string $relatedAssetId,
        string $relationshipType
    ): ?AssetRelationship {
        return $this
            ->queryForTenant($tenantId)
            ->where(
                'source_asset_id',
                $sourceAssetId
            )
            ->where(
                'related_asset_id',
                $relatedAssetId
            )
            ->where(
                'relationship_type',
                $relationshipType
            )
            ->first();
    }

    public function existsExact(
        string $tenantId,
        string $sourceAssetId,
        string $relatedAssetId,
        string $relationshipType
    ): bool {
        return $this
            ->queryForTenant($tenantId)
            ->where(
                'source_asset_id',
                $sourceAssetId
            )
            ->where(
                'related_asset_id',
                $relatedAssetId
            )
            ->where(
                'relationship_type',
                $relationshipType
            )
            ->exists();
    }

    public function create(
        array $data
    ): AssetRelationship {
        $relationship = AssetRelationship::query()
            ->create($data);

        return $relationship->load([
            'sourceAsset.company',
            'relatedAsset.company',
            'creator:id,name,email',
        ]);
    }

    public function delete(
        AssetRelationship $relationship
    ): bool {
        return (bool) $relationship->delete();
    }

    public function deleteForAsset(
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
