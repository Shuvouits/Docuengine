<?php

namespace App\Repositories;

use App\Models\OptionList;
use Illuminate\Database\Eloquent\Collection;

class OptionListRepository
{
    public function getAllByTenant(string $tenantId): Collection
    {
        return OptionList::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'items' => function ($query) {
                    $query->orderBy('sort_order');
                },
            ])
            ->orderBy('name')
            ->get();
    }

    public function findById(
        string $tenantId,
        string $optionListId
    ): ?OptionList {
        return OptionList::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $optionListId)
            ->with([
                'items' => function ($query) {
                    $query->orderBy('sort_order');
                },
            ])
            ->first();
    }

    public function findBySlug(
        string $tenantId,
        string $slug
    ): ?OptionList {
        return OptionList::query()
            ->where('tenant_id', $tenantId)
            ->where('slug', $slug)
            ->first();
    }

    public function create(array $data): OptionList
    {
        return OptionList::create($data);
    }

    public function update(
        OptionList $optionList,
        array $data
    ): OptionList {
        $optionList->update($data);

        return $optionList->fresh();
    }

    public function delete(OptionList $optionList): bool
    {
        return (bool) $optionList->delete();
    }

    public function restore(
        string $tenantId,
        string $optionListId
    ): ?OptionList {
        $optionList = OptionList::query()
            ->withTrashed()
            ->where('tenant_id', $tenantId)
            ->where('id', $optionListId)
            ->first();

        if (!$optionList) {
            return null;
        }

        $optionList->restore();

        return $optionList->fresh();
    }
}
