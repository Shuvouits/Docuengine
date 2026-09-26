<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\Company\CompanyContextService;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyContextController extends Controller
{
    public function __construct(
        protected CompanyContextService $companyContextService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Current Company Context
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        string $tenantId
    ): JsonResponse {
        try {
            $context = $this
                ->companyContextService
                ->getContext(
                    $tenantId,
                    $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Company context retrieved successfully.',

            'data' =>
                $context,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Switch Company
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'company_id' => [
                'present',
                'nullable',
                'uuid',
            ],
        ]);

        try {
            $context = $this
                ->companyContextService
                ->switchCompany(
                    $tenantId,
                    $request->user('api'),
                    $validated['company_id']
                );
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 403);
        } catch (DomainException $exception) {
            $status =
                $exception->getMessage()
                === 'Company not found.'
                    ? 404
                    : 422;

            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], $status);
        }

        return response()->json([
            'message' =>
                $validated['company_id'] === null
                    ? 'Switched to global workspace successfully.'
                    : 'Current company updated successfully.',

            'data' =>
                $context,
        ]);
    }
}
