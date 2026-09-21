<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssetLayout\StoreAssetLayoutSectionRequest;
use App\Http\Requests\AssetLayout\UpdateAssetLayoutSectionRequest;
use App\Models\AssetLayoutSection;
use App\Services\AssetLayout\AssetLayoutSectionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AssetLayoutSectionController extends Controller
{
    public function __construct(
        private AssetLayoutSectionService $assetLayoutSectionService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | List Sections
    |--------------------------------------------------------------------------
    */

    public function index(
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        try {
            $sections = $this
                ->assetLayoutSectionService
                ->getAll(
                    $tenantId,
                    $layoutId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout sections retrieved successfully.',

            'data' => [
                'sections' => $sections
                    ->map(
                        fn (AssetLayoutSection $section) =>
                            $this->formatSection($section)
                    )
                    ->values(),

                'count' => $sections->count(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show Section
    |--------------------------------------------------------------------------
    */

    public function show(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): JsonResponse {
        try {
            $section = $this
                ->assetLayoutSectionService
                ->getById(
                    $tenantId,
                    $layoutId,
                    $sectionId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout section not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout section retrieved successfully.',

            'data' => [
                'section' =>
                    $this->formatSection($section),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Section
    |--------------------------------------------------------------------------
    */

    public function store(
        StoreAssetLayoutSectionRequest $request,
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        try {
            $section = $this
                ->assetLayoutSectionService
                ->create(
                    tenantId: $tenantId,
                    layoutId: $layoutId,
                    userId: $request->user('api')->id,
                    data: $request->validated()
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout not found.',
            ], 404);
        }

        $section->load('fields');

        return response()->json([
            'message' => 'Asset layout section created successfully.',

            'data' => [
                'section' =>
                    $this->formatSection($section),
            ],
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Section
    |--------------------------------------------------------------------------
    */

    public function update(
        UpdateAssetLayoutSectionRequest $request,
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): JsonResponse {
        try {
            $section = $this
                ->assetLayoutSectionService
                ->update(
                    tenantId: $tenantId,
                    layoutId: $layoutId,
                    sectionId: $sectionId,
                    userId: $request->user('api')->id,
                    data: $request->validated()
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout section not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout section updated successfully.',

            'data' => [
                'section' =>
                    $this->formatSection($section),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Section
    |--------------------------------------------------------------------------
    */

    public function destroy(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): JsonResponse {
        try {
            $this
                ->assetLayoutSectionService
                ->delete(
                    $tenantId,
                    $layoutId,
                    $sectionId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout section not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout section archived successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Section
    |--------------------------------------------------------------------------
    */

    public function restore(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): JsonResponse {
        try {
            $section = $this
                ->assetLayoutSectionService
                ->restore(
                    $tenantId,
                    $layoutId,
                    $sectionId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Archived asset layout section not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout section restored successfully.',

            'data' => [
                'section' =>
                    $this->formatSection($section),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Formatter
    |--------------------------------------------------------------------------
    */

    private function formatSection(
        AssetLayoutSection $section
    ): array {
        return [
            'id' => $section->id,
            'tenant_id' => $section->tenant_id,
            'asset_layout_id' => $section->asset_layout_id,

            'name' => $section->name,
            'description' => $section->description,

            'sort_order' => $section->sort_order,
            'columns' => $section->columns,

            'is_collapsible' => $section->is_collapsible,
            'is_collapsed_by_default' =>
                $section->is_collapsed_by_default,
            'is_visible' => $section->is_visible,

            'fields_count' =>
                $section->relationLoaded('fields')
                    ? $section->fields->count()
                    : 0,

            'created_by' => $section->created_by,
            'updated_by' => $section->updated_by,

            'created_at' => $section->created_at,
            'updated_at' => $section->updated_at,
        ];
    }
}