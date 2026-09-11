<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\SecurityGroup;
use App\Models\SecurityGroupUser;
use App\Services\Security\SecurityGroupService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecurityGroupController extends Controller
{
    public function __construct(
        private SecurityGroupService $securityGroupService
    ) {
    }

    public function index(
        string $tenantId
    ): JsonResponse {
        $groups = $this
            ->securityGroupService
            ->getAll($tenantId);

        return response()->json([
            'message' => 'Security groups retrieved successfully.',

            'data' => [
                'security_groups' => $groups
                    ->map(
                        fn (SecurityGroup $group) =>
                            $this->formatGroup($group)
                    )
                    ->values(),

                'count' => $groups->count(),
            ],
        ]);
    }

    public function show(
        string $tenantId,
        string $groupId
    ): JsonResponse {
        $group = $this
            ->securityGroupService
            ->getById(
                $tenantId,
                $groupId
            );

        if (!$group) {
            return response()->json([
                'message' => 'Security group not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Security group retrieved successfully.',

            'data' => [
                'security_group' =>
                    $this->formatGroup($group),
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
                'max:150',
            ],

            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        try {
            $group = $this
                ->securityGroupService
                ->create(
                    $tenantId,
                    $request->user()->id,
                    $validated
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Security group created successfully.',

            'data' => [
                'security_group' =>
                    $this->formatGroup($group),
            ],
        ], 201);
    }

    public function update(
        Request $request,
        string $tenantId,
        string $groupId
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        try {
            $group = $this
                ->securityGroupService
                ->update(
                    $tenantId,
                    $groupId,
                    $validated
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Security group updated successfully.',

            'data' => [
                'security_group' =>
                    $this->formatGroup($group),
            ],
        ]);
    }

    public function destroy(
        string $tenantId,
        string $groupId
    ): JsonResponse {
        try {
            $this
                ->securityGroupService
                ->delete(
                    $tenantId,
                    $groupId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Security group deleted successfully.',
        ]);
    }

    public function users(
        string $tenantId,
        string $groupId
    ): JsonResponse {
        try {
            $memberships = $this
                ->securityGroupService
                ->getUsers(
                    $tenantId,
                    $groupId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Security group users retrieved successfully.',

            'data' => [
                'users' => $memberships
                    ->map(
                        fn (SecurityGroupUser $membership) =>
                            $this->formatMembership($membership)
                    )
                    ->values(),

                'count' => $memberships->count(),
            ],
        ]);
    }

    public function addUser(
        string $tenantId,
        string $groupId,
        string $userId
    ): JsonResponse {
        try {
            $group = $this
                ->securityGroupService
                ->addUser(
                    $tenantId,
                    $groupId,
                    $userId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'User assigned to security group successfully.',

            'data' => [
                'security_group' =>
                    $this->formatGroup($group),
            ],
        ]);
    }

    public function removeUser(
        string $tenantId,
        string $groupId,
        string $userId
    ): JsonResponse {
        try {
            $group = $this
                ->securityGroupService
                ->removeUser(
                    $tenantId,
                    $groupId,
                    $userId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'User removed from security group successfully.',

            'data' => [
                'security_group' =>
                    $this->formatGroup($group),
            ],
        ]);
    }

    private function formatGroup(
        SecurityGroup $group
    ): array {
        return [
            'id' => $group->id,
            'tenant_id' => $group->tenant_id,
            'name' => $group->name,
            'description' => $group->description,
            'is_system' => $group->is_system,

            'created_by' => $group->creator
                ? [
                    'id' => $group->creator->id,
                    'name' => $group->creator->name,
                    'email' => $group->creator->email,
                ]
                : null,

            'users' => $group->users
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'status' => $user->status,
                    ];
                })
                ->values(),

            'users_count' =>
                $group->users_count
                ?? $group->users->count(),

            'created_at' => $group->created_at,
            'updated_at' => $group->updated_at,
        ];
    }

    private function formatMembership(
        SecurityGroupUser $membership
    ): array {
        return [
            'membership_id' => $membership->id,

            'user' => [
                'id' => $membership->user?->id,
                'name' => $membership->user?->name,
                'email' => $membership->user?->email,
                'status' => $membership->user?->status,
            ],

            'created_at' =>
                $membership->created_at,
        ];
    }
}
