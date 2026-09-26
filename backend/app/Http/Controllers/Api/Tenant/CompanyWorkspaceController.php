<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\Company\CompanyWorkspaceService;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyWorkspaceController extends Controller
{
    public function __construct(
        protected CompanyWorkspaceService $companyWorkspaceService
    ) {
    }

    public function show(
        Request $request,
        string $tenantId,
        string $companyId
    ): JsonResponse {
        $actor = $request->user('api');

        try {
            $workspace = $this
                ->companyWorkspaceService
                ->getWorkspace(
                    $tenantId,
                    $companyId,
                    $actor
                );
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage()
                    ?: 'You do not have access to this company.',
            ], 403);
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 404);
        }

        return response()->json([
            'message' =>
                'Company workspace retrieved successfully.',

            'data' =>
                $workspace,
        ]);
    }
}
