<?php

namespace App\Services\AssetLayout;

use App\Models\AssetLayoutSection;
use App\Repositories\AssetLayoutRepository;
use App\Repositories\AssetLayoutSectionRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AssetLayoutSectionService
{
    public function __construct(
        private readonly AssetLayoutRepository $assetLayoutRepository,
        private readonly AssetLayoutSectionRepository $assetLayoutSectionRepository
    ) {
    }

    public function getAll(
        string $tenantId,
        string $layoutId
    ): Collection {
        $this->ensureLayoutExists(
            $tenantId,
            $layoutId
        );

        return $this->assetLayoutSectionRepository
            ->getAllByLayout(
                $tenantId,
                $layoutId
            );
    }

    public function getById(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): AssetLayoutSection {
        $this->ensureLayoutExists(
            $tenantId,
            $layoutId
        );

        $section = $this->assetLayoutSectionRepository
            ->findById(
                $tenantId,
                $layoutId,
                $sectionId
            );

        if (!$section) {
            throw (new ModelNotFoundException())
                ->setModel(
                    AssetLayoutSection::class,
                    [$sectionId]
                );
        }

        return $section;
    }

    public function create(
        string $tenantId,
        string $layoutId,
        string $userId,
        array $data
    ): AssetLayoutSection {
        $this->ensureLayoutExists(
            $tenantId,
            $layoutId
        );

        $sortOrder = $data['sort_order']
            ?? $this->assetLayoutSectionRepository
                ->getNextSortOrder(
                    $tenantId,
                    $layoutId
                );

        return $this->assetLayoutSectionRepository
            ->create([
                'tenant_id' => $tenantId,
                'asset_layout_id' => $layoutId,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'sort_order' => $sortOrder,
                'columns' => $data['columns'] ?? 1,
                'is_collapsible' => $data['is_collapsible'] ?? false,
                'is_collapsed_by_default' =>
                    $data['is_collapsed_by_default'] ?? false,
                'is_visible' => $data['is_visible'] ?? true,
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);
    }

    public function update(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $userId,
        array $data
    ): AssetLayoutSection {
        $section = $this->getById(
            $tenantId,
            $layoutId,
            $sectionId
        );

        $updateData = [];

        if (array_key_exists('name', $data)) {
            $updateData['name'] = $data['name'];
        }

        if (array_key_exists('description', $data)) {
            $updateData['description'] = $data['description'];
        }

        if (array_key_exists('sort_order', $data)) {
            $updateData['sort_order'] = $data['sort_order'];
        }

        if (array_key_exists('columns', $data)) {
            $updateData['columns'] = $data['columns'];
        }

        if (array_key_exists('is_collapsible', $data)) {
            $updateData['is_collapsible'] = $data['is_collapsible'];
        }

        if (array_key_exists('is_collapsed_by_default', $data)) {
            $updateData['is_collapsed_by_default'] =
                $data['is_collapsed_by_default'];
        }

        if (array_key_exists('is_visible', $data)) {
            $updateData['is_visible'] = $data['is_visible'];
        }

        $updateData['updated_by'] = $userId;

        return $this->assetLayoutSectionRepository
            ->update(
                $section,
                $updateData
            );
    }

    public function delete(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): void {
        $section = $this->getById(
            $tenantId,
            $layoutId,
            $sectionId
        );

        $this->assetLayoutSectionRepository
            ->delete($section);
    }

    public function restore(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): AssetLayoutSection {
        $this->ensureLayoutExists(
            $tenantId,
            $layoutId
        );

        $section = $this->assetLayoutSectionRepository
            ->restore(
                $tenantId,
                $layoutId,
                $sectionId
            );

        if (!$section) {
            throw (new ModelNotFoundException())
                ->setModel(
                    AssetLayoutSection::class,
                    [$sectionId]
                );
        }

        return $section;
    }

    private function ensureLayoutExists(
        string $tenantId,
        string $layoutId
    ): void {
        $layout = $this->assetLayoutRepository
            ->findById(
                $tenantId,
                $layoutId
            );

        if (!$layout) {
            throw (new ModelNotFoundException())
                ->setModel(
                    \App\Models\AssetLayout::class,
                    [$layoutId]
                );
        }
    }
}