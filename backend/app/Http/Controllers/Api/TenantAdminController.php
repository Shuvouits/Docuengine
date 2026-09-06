<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Tenant\TenantAdminService;
use App\Services\Tenant\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantAdminController extends Controller
{
    public function __construct(
        protected TenantService $tenantService,
        protected TenantAdminService $tenantAdminService
    ) {
    }

    public function store(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $tenant = $this->tenantService->getById($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        if (!$tenant->isActive()) {
            return response()->json([
                'message' => 'Tenant is not active.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
                'max:255',
            ],
        ]);

        $result = $this->tenantAdminService->assignAdmin(
            $tenant,
            $validated
        );

        return response()->json([
            'message' => 'Tenant administrator assigned successfully.',
            'data' => [
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                ],

                'user' => $result['user'],

                'membership' => $result['membership'],
            ],
        ], 201);
    }
}
