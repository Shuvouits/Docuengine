<?php

namespace App\Repositories;

use App\Models\OptionListItem;
use Illuminate\Database\Eloquent\Collection;

class OptionListItemRepository
{
    public function getAllByOptionList(
        string $tenantId,
        string $optionListId
    ): Collection {
        return OptionListItem::query()
            ->where('tenant_id', $tenantId)
            ->where('option_list_id', $optionListId)
            ->orderBy('sort_order')
            ->orderBy('label')
            ->get();
    }

    public function findById(
        string $tenantId,
        string $optionListId,
        string $itemId
    ): ?OptionListItem {
        return OptionListItem::query()
            ->where('tenant_id', $tenantId)
            ->where('option_list_id', $optionListId)
            ->where('id', $itemId)
            ->first();
    }

    public function findByValue(
        string $tenantId,
        string $optionListId,
        string $value
    ): ?OptionListItem {
        return OptionListItem::query()
            ->where('tenant_id', $tenantId)
            ->where('option_list_id', $optionListId)
            ->where('value', $value)
            ->first();
    }

    public function create(array $data): OptionListItem
    {
        return OptionListItem::create($data);
    }

    public function update(
        OptionListItem $item,
        array $data
    ): OptionListItem {
        $item->update($data);

        return $item->fresh();
    }

    public function delete(OptionListItem $item): bool
    {
        return (bool) $item->delete();
    }

    public function restore(
        string $tenantId,
        string $optionListId,
        string $itemId
    ): ?OptionListItem {
        $item = OptionListItem::query()
            ->withTrashed()
            ->where('tenant_id', $tenantId)
            ->where('option_list_id', $optionListId)
            ->where('id', $itemId)
            ->first();

        if (!$item) {
            return null;
        }

        $item->restore();

        return $item->fresh();
    }
}