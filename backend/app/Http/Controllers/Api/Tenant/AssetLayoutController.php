<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssetLayout\StoreAssetLayoutRequest;
use App\Http\Requests\AssetLayout\UpdateAssetLayoutRequest;
use App\Models\AssetLayout;
use App\Services\AssetLayout\AssetLayoutService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetLayoutController extends Controller
{
    public function __construct(
        private AssetLayoutService $assetLayoutService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | List Asset Layouts
    |--------------------------------------------------------------------------
    */

    public function index(
        string $tenantId
    ): JsonResponse {
        $layouts = $this->assetLayoutService
            ->getAll($tenantId);

        return response()->json([
            'message' => 'Asset layouts retrieved successfully.',
            'data' => [
                'asset_layouts' => $layouts
                    ->map(
                        fn (AssetLayout $layout) =>
                            $this->formatLayout($layout)
                    )
                    ->values(),

                'count' => $layouts->count(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show Asset Layout
    |--------------------------------------------------------------------------
    */

    public function show(
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        try {
            $layout = $this->assetLayoutService
                ->getById(
                    $tenantId,
                    $layoutId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout retrieved successfully.',
            'data' => [
                'asset_layout' =>
                    $this->formatLayout($layout),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Asset Layout
    |--------------------------------------------------------------------------
    */

    public function store(
        StoreAssetLayoutRequest $request,
        string $tenantId
    ): JsonResponse {
        $actor = $request->user('api');

        if (!$actor) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $layout = $this->assetLayoutService->create(
            tenantId: $tenantId,
            actor: $actor,
            data: $request->validated(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
            requestMethod: $request->method(),
            requestPath: $request->path()
        );

        $layout->load([
            'sections',
            'fields',
        ]);

        return response()->json([
            'message' => 'Asset layout created successfully.',
            'data' => [
                'asset_layout' =>
                    $this->formatLayout($layout),
            ],
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Asset Layout
    |--------------------------------------------------------------------------
    */

    public function update(
        UpdateAssetLayoutRequest $request,
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        $actor = $request->user('api');

        if (!$actor) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        try {
            $layout = $this->assetLayoutService->update(
                tenantId: $tenantId,
                layoutId: $layoutId,
                actor: $actor,
                data: $request->validated(),
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                requestMethod: $request->method(),
                requestPath: $request->path()
            );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout not found.',
            ], 404);
        }

        $layout->load([
            'sections',
            'fields',
        ]);

        return response()->json([
            'message' => 'Asset layout updated successfully.',
            'data' => [
                'asset_layout' =>
                    $this->formatLayout($layout),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Asset Layout
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        $actor = $request->user('api');

        if (!$actor) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        try {
            $this->assetLayoutService->delete(
                tenantId: $tenantId,
                layoutId: $layoutId,
                actor: $actor,
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                requestMethod: $request->method(),
                requestPath: $request->path()
            );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout archived successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Asset Layout
    |--------------------------------------------------------------------------
    */

    public function restore(
        Request $request,
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        $actor = $request->user('api');

        if (!$actor) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        try {
            $layout = $this->assetLayoutService->restore(
                tenantId: $tenantId,
                layoutId: $layoutId,
                actor: $actor,
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                requestMethod: $request->method(),
                requestPath: $request->path()
            );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Archived asset layout not found.',
            ], 404);
        }

        $layout->load([
            'sections',
            'fields',
        ]);

        return response()->json([
            'message' => 'Asset layout restored successfully.',
            'data' => [
                'asset_layout' =>
                    $this->formatLayout($layout),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Formatter
    |--------------------------------------------------------------------------
    */

    private function formatLayout(
        AssetLayout $layout
    ): array {
        return [
            'id' => $layout->id,
            'tenant_id' => $layout->tenant_id,
            'name' => $layout->name,
            'slug' => $layout->slug,
            'description' => $layout->description,
            'status' => $layout->status,
            'current_version' => $layout->current_version,
            'is_template' => $layout->is_template,
            'is_active' => $layout->is_active,

            'sections_count' =>
                $layout->relationLoaded('sections')
                    ? $layout->sections->count()
                    : 0,

            'fields_count' =>
                $layout->relationLoaded('fields')
                    ? $layout->fields->count()
                    : 0,

            'created_by' => $layout->created_by,
            'updated_by' => $layout->updated_by,
            'created_at' => $layout->created_at,
            'updated_at' => $layout->updated_at,
        ];
    }
}
