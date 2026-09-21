<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\AssetLayout\AssetLayoutBuilderService;
use Illuminate\Http\JsonResponse;

class AssetLayoutBuilderController extends Controller
{
    public function __construct(
        protected AssetLayoutBuilderService $builderService
    ) {
    }

    public function show(
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        $builder = $this->builderService->getBuilderData(
            $tenantId,
            $layoutId
        );

        if (!$builder) {
            return response()->json([
                'message' => 'Asset layout not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout builder retrieved successfully.',
            'data' => [
                'builder' => $builder,
            ],
        ]);
    }
}