<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Tenant\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {
    }

    public function index(): JsonResponse
    {
        $tenants = $this->tenantService->getAll();

        return response()->json([
            'message' => 'Tenants retrieved successfully.',
            'data' => $tenants,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $tenant = $this->tenantService->getById($id);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Tenant retrieved successfully.',
            'data' => $tenant,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                'unique:tenants,slug',
            ],

            'locale' => [
                'sometimes',
                'string',
                'max:10',
            ],

            'timezone' => [
                'sometimes',
                'string',
                'max:100',
            ],
        ]);

        $tenant = $this->tenantService->create($validated);

        return response()->json([
            'message' => 'Tenant created successfully.',
            'data' => $tenant,
        ], 201);
    }

    public function update(
        Request $request,
        string $id
    ): JsonResponse {
        $tenant = $this->tenantService->getById($id);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'string',
                'max:255',
            ],

            'slug' => [
                'sometimes',
                'string',
                'max:255',
                'alpha_dash',
                'unique:tenants,slug,' . $tenant->id,
            ],

            'locale' => [
                'sometimes',
                'string',
                'max:10',
            ],

            'timezone' => [
                'sometimes',
                'string',
                'max:100',
            ],
        ]);

        $tenant = $this->tenantService->update(
            $tenant,
            $validated
        );

        return response()->json([
            'message' => 'Tenant updated successfully.',
            'data' => $tenant,
        ]);
    }

    public function activate(string $id): JsonResponse
    {
        $tenant = $this->tenantService->getById($id);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $tenant = $this->tenantService->activate($tenant);

        return response()->json([
            'message' => 'Tenant activated successfully.',
            'data' => $tenant,
        ]);
    }

    public function deactivate(string $id): JsonResponse
    {
        $tenant = $this->tenantService->getById($id);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $tenant = $this->tenantService->deactivate($tenant);

        return response()->json([
            'message' => 'Tenant deactivated successfully.',
            'data' => $tenant,
        ]);
    }

    public function suspend(
        Request $request,
        string $id
    ): JsonResponse {
        $tenant = $this->tenantService->getById($id);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'reason' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $tenant = $this->tenantService->suspend(
            $tenant,
            $validated['reason'] ?? null
        );

        return response()->json([
            'message' => 'Tenant suspended successfully.',
            'data' => $tenant,
        ]);
    }

    public function archive(string $id): JsonResponse
    {
        $tenant = $this->tenantService->getById($id);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $tenant = $this->tenantService->archive($tenant);

        return response()->json([
            'message' => 'Tenant archived successfully.',
            'data' => $tenant,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $tenant = $this->tenantService->getById($id);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $this->tenantService->delete($tenant);

        return response()->json([
            'message' => 'Tenant deleted successfully.',
        ]);
    }
}
