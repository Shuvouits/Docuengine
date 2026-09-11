<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\Security\TenantRoleService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class TenantRoleController extends Controller
{
    public function __construct(
        private TenantRoleService $tenantRoleService
    ) {
    }

    public function index(
        string $tenantId
    ): JsonResponse {
        $roles = $this
            ->tenantRoleService
            ->getAll($tenantId);

        return response()->json([
            'message' => 'Tenant roles retrieved successfully.',

            'data' => [
                'roles' => $roles
                    ->map(
                        fn (Role $role) =>
                            $this->formatRole($role)
                    )
                    ->values(),

                'count' => $roles->count(),
            ],
        ]);
    }

    public function show(
        string $tenantId,
        int $roleId
    ): JsonResponse {
        $role = $this
            ->tenantRoleService
            ->getById(
                $tenantId,
                $roleId
            );

        if (!$role) {
            return response()->json([
                'message' => 'Tenant role not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Tenant role retrieved successfully.',

            'data' => [
                'role' => $this->formatRole($role),
            ],
        ]);
    }

    public function permissions(): JsonResponse
    {
        $permissions = $this
            ->tenantRoleService
            ->getPermissions();

        return response()->json([
            'message' => 'Permissions retrieved successfully.',

            'data' => [
                'permissions' => $permissions
                    ->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];
                    })
                    ->values(),

                'count' => $permissions->count(),
            ],
        ]);
    }

    public function store(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'permissions' => [
                'nullable',
                'array',
            ],

            'permissions.*' => [
                'string',
                'distinct',
            ],
        ]);

        try {
            $role = $this
                ->tenantRoleService
                ->create(
                    $tenantId,
                    [
                        'name' => $validated['name'],

                        'permissions' =>
                            $validated['permissions'] ?? [],
                    ]
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tenant role created successfully.',

            'data' => [
                'role' => $this->formatRole($role),
            ],
        ], 201);
    }

    public function update(
        Request $request,
        string $tenantId,
        int $roleId
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'permissions' => [
                'sometimes',
                'array',
            ],

            'permissions.*' => [
                'string',
                'distinct',
            ],
        ]);

        try {
            $role = $this
                ->tenantRoleService
                ->update(
                    $tenantId,
                    $roleId,
                    $validated
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tenant role updated successfully.',

            'data' => [
                'role' => $this->formatRole($role),
            ],
        ]);
    }

    public function destroy(
        string $tenantId,
        int $roleId
    ): JsonResponse {
        try {
            $this
                ->tenantRoleService
                ->delete(
                    $tenantId,
                    $roleId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tenant role deleted successfully.',
        ]);
    }

    private function formatRole(
        Role $role
    ): array {
        return [
            'id' => $role->id,

            'name' => $role->name,

            'guard_name' => $role->guard_name,

            'is_system' => $this
                ->isSystemRole($role),

            'permissions' => $role
                ->permissions
                ->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                    ];
                })
                ->values(),

            'permission_count' =>
                $role->permissions->count(),

            'created_at' =>
                $role->created_at,

            'updated_at' =>
                $role->updated_at,
        ];
    }

    private function isSystemRole(
        Role $role
    ): bool {
        return in_array(
            $role->name,
            config(
                'rbac.protected_roles',
                [
                    'MSP Admin',
                    'Editor',
                    'Author',
                    'Read-only Technician',
                    'Portal Member',
                ]
            ),
            true
        );
    }
}
