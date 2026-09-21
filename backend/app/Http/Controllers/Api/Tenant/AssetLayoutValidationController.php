<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\AssetLayout\AssetLayoutValidationService;
use Illuminate\Http\JsonResponse;

class AssetLayoutValidationController extends Controller
{
    public function __construct(
        protected AssetLayoutValidationService $validationService
    ) {
    }

    public function validateLayout(
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        $result = $this->validationService->validate(
            $tenantId,
            $layoutId
        );

        if (
            !$result['valid']
            && collect($result['errors'])->contains(
                fn (array $error) => ($error['code'] ?? null) === 'layout_not_found'
            )
        ) {
            return response()->json([
                'message' => 'Asset layout not found.',
                'data' => $result,
            ], 404);
        }

        return response()->json([
            'message' => $result['valid']
                ? 'Asset layout validation passed.'
                : 'Asset layout validation failed.',
            'data' => $result,
        ]);
    }
}