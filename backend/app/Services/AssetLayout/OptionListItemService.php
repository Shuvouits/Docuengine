<?php

namespace App\Services\AssetLayout;

use App\Models\OptionListItem;
use App\Repositories\OptionListItemRepository;
use App\Repositories\OptionListRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;

class OptionListItemService
{
    public function __construct(
        private readonly OptionListRepository $optionListRepository,
        private readonly OptionListItemRepository $optionListItemRepository
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Get All Items
    |--------------------------------------------------------------------------
    */

    public function getAll(
        string $tenantId,
        string $optionListId
    ): Collection {
        $this->ensureOptionListExists(
            $tenantId,
            $optionListId
        );

        return $this->optionListItemRepository
            ->getAllByOptionList(
                $tenantId,
                $optionListId
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Get One Item
    |--------------------------------------------------------------------------
    */

    public function getById(
        string $tenantId,
        string $optionListId,
        string $itemId
    ): OptionListItem {
        $this->ensureOptionListExists(
            $tenantId,
            $optionListId
        );

        $item = $this->optionListItemRepository->findById(
            $tenantId,
            $optionListId,
            $itemId
        );

        if (!$item) {
            throw (new ModelNotFoundException())
                ->setModel(
                    OptionListItem::class,
                    [$itemId]
                );
        }

        return $item;
    }

    /*
    |--------------------------------------------------------------------------
    | Create Item
    |--------------------------------------------------------------------------
    */

    public function create(
        string $tenantId,
        string $optionListId,
        string $userId,
        array $data
    ): OptionListItem {
        $this->ensureOptionListExists(
            $tenantId,
            $optionListId
        );

        $value = $this->generateUniqueValue(
            $tenantId,
            $optionListId,
            $data['value'] ?? $data['label']
        );

        return $this->optionListItemRepository->create([
            'tenant_id' => $tenantId,
            'option_list_id' => $optionListId,
            'label' => $data['label'],
            'value' => $value,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Item
    |--------------------------------------------------------------------------
    */

    public function update(
        string $tenantId,
        string $optionListId,
        string $itemId,
        string $userId,
        array $data
    ): OptionListItem {
        $item = $this->getById(
            $tenantId,
            $optionListId,
            $itemId
        );

        $updateData = [];

        if (array_key_exists('label', $data)) {
            $updateData['label'] = $data['label'];
        }

        if (array_key_exists('sort_order', $data)) {
            $updateData['sort_order'] = $data['sort_order'];
        }

        if (array_key_exists('is_active', $data)) {
            $updateData['is_active'] = $data['is_active'];
        }

        $updateData['updated_by'] = $userId;

        return $this->optionListItemRepository->update(
            $item,
            $updateData
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Item
    |--------------------------------------------------------------------------
    */

    public function delete(
        string $tenantId,
        string $optionListId,
        string $itemId
    ): void {
        $item = $this->getById(
            $tenantId,
            $optionListId,
            $itemId
        );

        $this->optionListItemRepository->delete($item);
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Item
    |--------------------------------------------------------------------------
    */

    public function restore(
        string $tenantId,
        string $optionListId,
        string $itemId
    ): OptionListItem {
        $this->ensureOptionListExists(
            $tenantId,
            $optionListId
        );

        $item = $this->optionListItemRepository->restore(
            $tenantId,
            $optionListId,
            $itemId
        );

        if (!$item) {
            throw (new ModelNotFoundException())
                ->setModel(
                    OptionListItem::class,
                    [$itemId]
                );
        }

        return $item;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function ensureOptionListExists(
        string $tenantId,
        string $optionListId
    ): void {
        $optionList = $this->optionListRepository->findById(
            $tenantId,
            $optionListId
        );

        if (!$optionList) {
            throw (new ModelNotFoundException())
                ->setModel(
                    \App\Models\OptionList::class,
                    [$optionListId]
                );
        }
    }

    private function generateUniqueValue(
        string $tenantId,
        string $optionListId,
        string $value
    ): string {
        $baseValue = Str::slug($value, '_');

        if ($baseValue === '') {
            $baseValue = 'option';
        }

        $generatedValue = $baseValue;
        $counter = 2;

        while (
            $this->optionListItemRepository->findByValue(
                $tenantId,
                $optionListId,
                $generatedValue
            )
        ) {
            $generatedValue = $baseValue . '_' . $counter;
            $counter++;
        }

        return $generatedValue;
    }
}
