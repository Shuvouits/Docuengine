<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantUser;
use App\Services\Tenant\TenantUserService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TenantUserController extends Controller
{
    public function __construct(
        protected TenantUserService $tenantUserService
    ) {}

    public function index(string $tenantId): JsonResponse
    {
        $memberships = $this->tenantUserService
            ->getAll($tenantId)
            ->map(
                fn(TenantUser $membership) =>
                $this->formatMembership($membership)
            );

        return response()->json([
            'message' => 'Tenant users retrieved successfully.',
            'data' => [
                'users' => $memberships,
                'count' => $memberships->count(),
            ],
        ]);
    }

    public function show(
        string $tenantId,
        string $userId
    ): JsonResponse {
        $membership = $this->tenantUserService
            ->getById(
                $tenantId,
                $userId
            );

        if (!$membership || !$membership->user) {
            return response()->json([
                'message' => 'Tenant user not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Tenant user retrieved successfully.',
            'data' => $this->formatMembershipDetail(
                $membership
            ),
        ]);
    }

    public function roleOptions(
        string $tenantId
    ): JsonResponse {
        $roles = $this->tenantUserService
            ->getRoleOptions($tenantId);

        return response()->json([
            'message' => 'Tenant role options retrieved successfully.',
            'data' => [
                'roles' => $roles,
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
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],

            'role' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        try {
            $result = $this->tenantUserService
                ->create(
                    $tenantId,
                    $validated
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tenant user created successfully.',
            'data' => $this->formatCreatedOrUpdated(
                $result['user'],
                $result['membership']
            ),
        ], 201);
    }

    public function update(
        Request $request,
        string $tenantId,
        string $userId
    ): JsonResponse {
        $membership = $this->tenantUserService
            ->getById(
                $tenantId,
                $userId
            );

        if (!$membership || !$membership->user) {
            return response()->json([
                'message' => 'Tenant user not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($membership->user_id),
            ],

            'role' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
        ]);

        try {
            $result = $this->tenantUserService
                ->update(
                    $membership,
                    $tenantId,
                    $validated
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tenant user updated successfully.',
            'data' => $this->formatCreatedOrUpdated(
                $result['user'],
                $result['membership']
            ),
        ]);
    }




    public function suspend(
        Request $request,
        string $tenantId,
        string $userId
    ): JsonResponse {
        $membership = $this
            ->tenantUserService
            ->getById(
                $tenantId,
                $userId
            );

        if (!$membership || !$membership->user) {
            return response()->json([
                'message' => 'Tenant user not found.',
            ], 404);
        }

        try {
            $membership = $this
                ->tenantUserService
                ->suspend(
                    $membership,
                    $request->user()->id,
                    $request->ip(),
                    $request->userAgent()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tenant user suspended successfully.',
            'data' => $this->formatLifecycle(
                $membership
            ),
        ]);
    }




    public function activate(
        Request $request,
        string $tenantId,
        string $userId
    ): JsonResponse {
        $membership = $this->tenantUserService
            ->getById(
                $tenantId,
                $userId
            );

        if (!$membership || !$membership->user) {
            return response()->json([
                'message' => 'Tenant user not found.',
            ], 404);
        }

        try {
            $membership = $this->tenantUserService
                ->activate(
                    $membership,
                    $request->user()->id,
                    $request->ip(),
                    $request->userAgent()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tenant user activated successfully.',
            'data' => $this->formatLifecycle(
                $membership
            ),
        ]);
    }







    private function formatMembership(
        TenantUser $membership
    ): array {
        $user = $membership->user;

        if ($user) {
            $user->unsetRelation('roles');
            $user->unsetRelation('permissions');
        }

        return [
            'membership_id' => $membership->id,

            'user' => [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
                'status' => $user?->status,

                'roles' => $user
                    ? $user->getRoleNames()
                    ->values()
                    ->all()
                    : [],
            ],

            'membership' => [
                'role' => $membership->role,
                'status' => $membership->status,
                'joined_at' => $membership->joined_at,
            ],

            'created_at' => $membership->created_at,
        ];
    }

    private function formatMembershipDetail(
        TenantUser $membership
    ): array {
        $user = $membership->user;

        $user->unsetRelation('roles');
        $user->unsetRelation('permissions');

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'email_verified_at' =>
                $user->email_verified_at,

                'roles' => $user
                    ->getRoleNames()
                    ->values()
                    ->all(),

                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],

            'membership' => [
                'id' => $membership->id,
                'role' => $membership->role,
                'status' => $membership->status,
                'joined_at' => $membership->joined_at,
                'created_at' => $membership->created_at,
            ],
        ];
    }

    private function formatCreatedOrUpdated(
        $user,
        TenantUser $membership
    ): array {
        $user->unsetRelation('roles');
        $user->unsetRelation('permissions');

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,

                'roles' => $user
                    ->getRoleNames()
                    ->values()
                    ->all(),
            ],

            'membership' => [
                'id' => $membership->id,
                'role' => $membership->role,
                'status' => $membership->status,
                'joined_at' => $membership->joined_at,
            ],
        ];
    }

    private function formatLifecycle(
        TenantUser $membership
    ): array {
        $user = $membership->user;

        return [
            'user' => [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
                'status' => $user?->status,
            ],

            'membership' => [
                'id' => $membership->id,
                'role' => $membership->role,
                'status' => $membership->status,
                'joined_at' => $membership->joined_at,
            ],
        ];
    }
}
