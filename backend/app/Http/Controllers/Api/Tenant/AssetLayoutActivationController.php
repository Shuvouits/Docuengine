<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssetLayout\StoreAssetLayoutActivationRequest;
use App\Services\AssetLayout\AssetLayoutActivationService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;

class AssetLayoutActivationController extends Controller
{
    public function __construct(
        protected AssetLayoutActivationService $activationService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Activate
    |--------------------------------------------------------------------------
    */

    public function activate(
        StoreAssetLayoutActivationRequest $request,
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        $actor = auth('api')->user();

        if (!$actor) {
            return response()->json([
                'message' =>
                    'Unauthenticated.',
            ], 401);
        }

        try {
            $result = $this
                ->activationService
                ->activate(
                    tenantId:
                        $tenantId,

                    layoutId:
                        $layoutId,

                    companyId:
                        $request->validated(
                            'company_id'
                        ),

                    actor:
                        $actor,

                    ipAddress:
                        $request->ip(),

                    userAgent:
                        $request->userAgent(),

                    requestMethod:
                        $request->method(),

                    requestPath:
                        $request->path()
                );
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 403);
        }

        if (!$result['success']) {
            $status = match (
                $result['message']
            ) {
                'Company not found.',
                'Asset layout not found.' =>
                    404,

                default =>
                    422,
            };

            return response()->json([
                'message' =>
                    $result['message'],

                'errors' =>
                    $result['validation_errors']
                    ?? null,
            ], $status);
        }

        return response()->json([
            'message' =>
                $result['message'],

            'data' => [
                'activation' =>
                    $result['activation'],
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Deactivate
    |--------------------------------------------------------------------------
    */

    public function deactivate(
        StoreAssetLayoutActivationRequest $request,
        string $tenantId,
        string $layoutId
    ): JsonResponse {
        $actor = auth('api')->user();

        if (!$actor) {
            return response()->json([
                'message' =>
                    'Unauthenticated.',
            ], 401);
        }

        try {
            $result = $this
                ->activationService
                ->deactivate(
                    tenantId:
                        $tenantId,

                    layoutId:
                        $layoutId,

                    companyId:
                        $request->validated(
                            'company_id'
                        ),

                    actor:
                        $actor,

                    ipAddress:
                        $request->ip(),

                    userAgent:
                        $request->userAgent(),

                    requestMethod:
                        $request->method(),

                    requestPath:
                        $request->path()
                );
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 403);
        }

        if (!$result['success']) {
            $status = match (
                $result['message']
            ) {
                'Company not found.',
                'Asset layout activation not found.' =>
                    404,

                default =>
                    422,
            };

            return response()->json([
                'message' =>
                    $result['message'],
            ], $status);
        }

        return response()->json([
            'message' =>
                $result['message'],

            'data' => [
                'activation' =>
                    $result['activation'],
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Company Activations
    |--------------------------------------------------------------------------
    */

    public function companyIndex(
        string $tenantId,
        string $companyId
    ): JsonResponse {
        $actor = auth('api')->user();

        if (!$actor) {
            return response()->json([
                'message' =>
                    'Unauthenticated.',
            ], 401);
        }

        try {
            $result = $this
                ->activationService
                ->getCompanyActivations(
                    $tenantId,
                    $companyId,
                    $actor
                );
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 403);
        }

        if (!$result['success']) {
            return response()->json([
                'message' =>
                    $result['message'],
            ], 404);
        }

        return response()->json([
            'message' =>
                $result['message'],

            'data' => [
                'activations' =>
                    $result['activations'],

                'count' =>
                    $result['count'],
            ],
        ]);
    }
}
