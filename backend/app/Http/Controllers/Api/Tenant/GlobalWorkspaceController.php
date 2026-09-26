<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\Company\GlobalWorkspaceService;
use Illuminate\Http\JsonResponse;

class GlobalWorkspaceController extends Controller
{
    public function __construct(
        protected GlobalWorkspaceService $globalWorkspaceService
    ) {
    }

    public function index(
        string $tenantId
    ): JsonResponse {
        $workspace = $this
            ->globalWorkspaceService
            ->getWorkspace(
                $tenantId
            );

        return response()->json([
            'message' =>
                'Global workspace retrieved successfully.',

            'data' =>
                $workspace,
        ]);
    }
}
