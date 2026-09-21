<?php

namespace App\Repositories;

use App\Models\AssetLayout;
use Illuminate\Database\Eloquent\Collection;

class AssetLayoutRepository
{
    /*
    |--------------------------------------------------------------------------
    | Get All Layouts For Tenant
    |--------------------------------------------------------------------------
    */

    public function getAllByTenant(
        string $tenantId
    ): Collection {
        return AssetLayout::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'sections',
                'fields',
            ])
            ->orderBy('name')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Find Layout By ID
    |--------------------------------------------------------------------------
    */

   public function findById(
    string $tenantId,
    string $layoutId
): ?AssetLayout {
    return AssetLayout::query()
        ->where('tenant_id', $tenantId)
        ->where('id', $layoutId)
        ->with([
            'sections.fields',
            'fields',
            'versions',
            'activations',
        ])
        ->first();
}



    /*
    |--------------------------------------------------------------------------
    | Find Layout By Slug
    |--------------------------------------------------------------------------
    */

    public function findBySlug(
        string $tenantId,
        string $slug
    ): ?AssetLayout {
        return AssetLayout::query()
            ->where('tenant_id', $tenantId)
            ->where('slug', $slug)
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Create Layout
    |--------------------------------------------------------------------------
    */

    public function create(
        array $data
    ): AssetLayout {
        return AssetLayout::create($data);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Layout
    |--------------------------------------------------------------------------
    */

    public function update(
        AssetLayout $layout,
        array $data
    ): AssetLayout {
        $layout->update($data);

        return $layout->fresh();
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Layout
    |--------------------------------------------------------------------------
    */

    public function delete(
        AssetLayout $layout
    ): bool {
        return (bool) $layout->delete();
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Layout
    |--------------------------------------------------------------------------
    */

    public function restore(
        string $tenantId,
        string $layoutId
    ): ?AssetLayout {
        $layout = AssetLayout::query()
            ->withTrashed()
            ->where('tenant_id', $tenantId)
            ->where('id', $layoutId)
            ->first();

        if (!$layout) {
            return null;
        }

        $layout->restore();

        return $layout->fresh();
    }


    public function findForValidation(string $tenantId, string $layoutId): ?AssetLayout
{
    return AssetLayout::query()
        ->where('tenant_id', $tenantId)
        ->where('id', $layoutId)
        ->with([
            'sections' => function ($query) {
                $query->orderBy('sort_order');
            },
            'sections.fields' => function ($query) {
                $query->orderBy('sort_order');
            },
            'sections.fields.optionList.items' => function ($query) {
                $query->orderBy('sort_order');
            },
        ])
        ->first();
}



public function findForBuilder(string $tenantId, string $layoutId): ?AssetLayout
{
    return AssetLayout::query()
        ->where('tenant_id', $tenantId)
        ->where('id', $layoutId)
        ->with([
            'sections' => function ($query) {
                $query->orderBy('sort_order');
            },
            'sections.fields' => function ($query) {
                $query->orderBy('sort_order');
            },
            'sections.fields.optionList.items' => function ($query) {
                $query->orderBy('sort_order');
            },
        ])
        ->first();
}



public function updateCurrentVersion(
    string $tenantId,
    string $layoutId,
    int $versionNumber
): bool {
    return AssetLayout::query()
        ->where('tenant_id', $tenantId)
        ->where('id', $layoutId)
        ->update([
            'current_version' => $versionNumber,
        ]) > 0;
}





}
