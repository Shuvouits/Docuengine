<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\Company\GlobalWorkspaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalWorkspaceController extends Controller
{
    public function __construct(
        protected GlobalWorkspaceService $globalWorkspaceService
    ) {
    }

    public function index(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $actor = $request->user('api');

        $workspace = $this
            ->globalWorkspaceService
            ->getWorkspace(
                $tenantId,
                $actor
            );

        return response()->json([
            'message' =>
                'Global workspace retrieved successfully.',

            'data' =>
                $workspace,
        ]);
    }
}
