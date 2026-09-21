<?php

namespace App\Repositories;

use App\Models\AssetLayoutSection;
use Illuminate\Database\Eloquent\Collection;

class AssetLayoutSectionRepository
{
    public function getAllByLayout(
        string $tenantId,
        string $layoutId
    ): Collection {
        return AssetLayoutSection::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->with('fields')
            ->orderBy('sort_order')
            ->get();
    }

    public function findById(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): ?AssetLayoutSection {
        return AssetLayoutSection::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->where('id', $sectionId)
            ->with('fields')
            ->first();
    }

    public function create(
        array $data
    ): AssetLayoutSection {
        return AssetLayoutSection::create($data);
    }

    public function update(
        AssetLayoutSection $section,
        array $data
    ): AssetLayoutSection {
        $section->update($data);

        return $section->fresh('fields');
    }

    public function delete(
        AssetLayoutSection $section
    ): bool {
        return (bool) $section->delete();
    }

    public function restore(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): ?AssetLayoutSection {
        $section = AssetLayoutSection::query()
            ->withTrashed()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->where('id', $sectionId)
            ->first();

        if (!$section) {
            return null;
        }

        $section->restore();

        return $section->fresh('fields');
    }

    public function getNextSortOrder(
        string $tenantId,
        string $layoutId
    ): int {
        $maxSortOrder = AssetLayoutSection::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->max('sort_order');

        return ((int) $maxSortOrder) + 1;
    }
}