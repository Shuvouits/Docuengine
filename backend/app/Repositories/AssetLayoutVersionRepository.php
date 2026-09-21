<?php

namespace App\Repositories;

use App\Models\AssetLayoutVersion;
use Illuminate\Database\Eloquent\Collection;

class AssetLayoutVersionRepository
{
    public function getAllByLayout(
        string $tenantId,
        string $layoutId
    ): Collection {
        return AssetLayoutVersion::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->orderByDesc('version_number')
            ->get();
    }

    public function findById(
        string $tenantId,
        string $layoutId,
        string $versionId
    ): ?AssetLayoutVersion {
        return AssetLayoutVersion::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->where('id', $versionId)
            ->first();
    }

    public function findByVersionNumber(
        string $tenantId,
        string $layoutId,
        int $versionNumber
    ): ?AssetLayoutVersion {
        return AssetLayoutVersion::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->where('version_number', $versionNumber)
            ->first();
    }

    public function getLatestVersionNumber(
        string $tenantId,
        string $layoutId
    ): int {
        return (int) AssetLayoutVersion::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->max('version_number');
    }

    public function create(array $data): AssetLayoutVersion
    {
        return AssetLayoutVersion::create($data);
    }

    public function getNextVersionNumber(
    string $tenantId,
    string $layoutId
): int {
    $latestVersionNumber = $this->getLatestVersionNumber(
        $tenantId,
        $layoutId
    );

    return $latestVersionNumber + 1;
}




}