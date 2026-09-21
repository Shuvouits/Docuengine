<?php

namespace App\Repositories;

use App\Models\AssetLayoutField;
use Illuminate\Database\Eloquent\Collection;

class AssetLayoutFieldRepository
{
    public function getAllByLayout(
        string $tenantId,
        string $layoutId
    ): Collection {
        return AssetLayoutField::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->with('optionList.items')
            ->orderBy('sort_order')
            ->get();
    }

    public function getAllBySection(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): Collection {
        return AssetLayoutField::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->where('section_id', $sectionId)
            ->with('optionList.items')
            ->orderBy('sort_order')
            ->get();
    }

    public function findById(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $fieldId
    ): ?AssetLayoutField {
        return AssetLayoutField::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->where('section_id', $sectionId)
            ->where('id', $fieldId)
            ->with('optionList.items')
            ->first();
    }

    public function findByFieldKey(
        string $tenantId,
        string $layoutId,
        string $fieldKey
    ): ?AssetLayoutField {
        return AssetLayoutField::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->where('field_key', $fieldKey)
            ->first();
    }

    public function create(
        array $data
    ): AssetLayoutField {
        return AssetLayoutField::create($data);
    }

    public function update(
        AssetLayoutField $field,
        array $data
    ): AssetLayoutField {
        $field->update($data);

        return $field->fresh([
            'optionList.items',
        ]);
    }

    public function delete(
        AssetLayoutField $field
    ): bool {
        return (bool) $field->delete();
    }

    public function restore(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $fieldId
    ): ?AssetLayoutField {
        $field = AssetLayoutField::query()
            ->withTrashed()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->where('section_id', $sectionId)
            ->where('id', $fieldId)
            ->first();

        if (!$field) {
            return null;
        }

        $field->restore();

        return $field->fresh([
            'optionList.items',
        ]);
    }

    public function getNextSortOrder(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): int {
        $maxSortOrder = AssetLayoutField::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->where('section_id', $sectionId)
            ->max('sort_order');

        return ((int) $maxSortOrder) + 1;
    }
}