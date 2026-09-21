<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssetLayout\StoreAssetLayoutVersionRequest;
use App\Services\AssetLayout\AssetLayoutVersionService;
use Illuminate\Http\JsonResponse;

class AssetLayoutVersionController extends Controller
{
    public function __construct(
        protected AssetLayoutVersionService $versionService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Create Version
    |--------------------------------------------------------------------------
    */

    public function store(
        StoreAssetLayoutVersionRequest $request,
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        $actor = $request->user('api');

        if (!$actor) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $result = $this->versionService->createVersion(
            tenantId: $tenantId,
            layoutId: $layoutId,
            changeSummary: $request->validated('change_summary'),
            actor: $actor,
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
            requestMethod: $request->method(),
            requestPath: $request->path()
        );

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], 404);
        }

        $version = $result['version'];

        return response()->json([
            'message' => $result['message'],
            'data' => [
                'version' => [
                    'id' => $version->id,
                    'tenant_id' => $version->tenant_id,
                    'asset_layout_id' => $version->asset_layout_id,
                    'version_number' => $version->version_number,
                    'schema_snapshot' => $version->schema_snapshot,
                    'change_summary' => $version->change_summary,
                    'created_by' => $version->created_by,
                    'created_at' => $version->created_at,
                ],
            ],
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Version History
    |--------------------------------------------------------------------------
    */

    public function index(
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        $result = $this->versionService->getVersionHistory(
            $tenantId,
            $layoutId
        );

        return response()->json([
            'message' => 'Asset layout versions retrieved successfully.',
            'data' => [
                'versions' => $result['versions'],
                'count' => $result['count'],
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show Version
    |--------------------------------------------------------------------------
    */

    public function show(
        string $tenantId,
        string $layoutId,
        string $versionId
    ): JsonResponse {
        $result = $this->versionService->getVersion(
            $tenantId,
            $layoutId,
            $versionId
        );

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], 404);
        }

        $version = $result['version'];

        return response()->json([
            'message' => $result['message'],
            'data' => [
                'version' => [
                    'id' => $version->id,
                    'tenant_id' => $version->tenant_id,
                    'asset_layout_id' => $version->asset_layout_id,
                    'version_number' => $version->version_number,
                    'schema_snapshot' => $version->schema_snapshot,
                    'change_summary' => $version->change_summary,
                    'created_by' => $version->created_by,
                    'created_at' => $version->created_at,
                ],
            ],
        ]);
    }
}
