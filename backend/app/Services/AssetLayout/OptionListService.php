<?php

namespace App\Services\AssetLayout;

use App\Models\OptionList;
use App\Repositories\OptionListRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;

class OptionListService
{
    public function __construct(
        private readonly OptionListRepository $optionListRepository
    ) {
    }

    public function getAll(string $tenantId): Collection
    {
        return $this->optionListRepository
            ->getAllByTenant($tenantId);
    }

    public function getById(
        string $tenantId,
        string $optionListId
    ): OptionList {
        $optionList = $this->optionListRepository->findById(
            $tenantId,
            $optionListId
        );

        if (!$optionList) {
            throw (new ModelNotFoundException())
                ->setModel(
                    OptionList::class,
                    [$optionListId]
                );
        }

        return $optionList;
    }

    public function create(
        string $tenantId,
        string $userId,
        array $data
    ): OptionList {
        $slug = $this->generateUniqueSlug(
            $tenantId,
            $data['name']
        );

        return $this->optionListRepository->create([
            'tenant_id' => $tenantId,
            'name' => $data['name'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);
    }

    public function update(
        string $tenantId,
        string $optionListId,
        string $userId,
        array $data
    ): OptionList {
        $optionList = $this->getById(
            $tenantId,
            $optionListId
        );

        $updateData = [];

        if (array_key_exists('name', $data)) {
            $updateData['name'] = $data['name'];
        }

        if (array_key_exists('description', $data)) {
            $updateData['description'] = $data['description'];
        }

        if (array_key_exists('is_active', $data)) {
            $updateData['is_active'] = $data['is_active'];
        }

        $updateData['updated_by'] = $userId;

        return $this->optionListRepository->update(
            $optionList,
            $updateData
        );
    }

    public function delete(
        string $tenantId,
        string $optionListId
    ): void {
        $optionList = $this->getById(
            $tenantId,
            $optionListId
        );

        $this->optionListRepository->delete($optionList);
    }

    public function restore(
        string $tenantId,
        string $optionListId
    ): OptionList {
        $optionList = $this->optionListRepository->restore(
            $tenantId,
            $optionListId
        );

        if (!$optionList) {
            throw (new ModelNotFoundException())
                ->setModel(
                    OptionList::class,
                    [$optionListId]
                );
        }

        return $optionList;
    }

    private function generateUniqueSlug(
        string $tenantId,
        string $name
    ): string {
        $baseSlug = Str::slug($name);

        if ($baseSlug === '') {
            $baseSlug = 'option-list';
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
            $this->optionListRepository->findBySlug(
                $tenantId,
                $slug
            )
        ) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
