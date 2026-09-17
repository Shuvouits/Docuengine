<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Tenant\TenantInvitationService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantInvitationController extends Controller
{
    public function __construct(
        protected TenantInvitationService $tenantInvitationService
    ) {
    }

    public function index(
        string $tenantId
    ): JsonResponse {
        $invitations = $this
            ->tenantInvitationService
            ->getAll($tenantId)
            ->map(function ($invitation) {
                return [
                    'id' => $invitation->id,

                    'name' => $invitation->name,
                    'email' => $invitation->email,

                    'role' => [
                        'id' => $invitation->role?->id,
                        'name' => $invitation->role?->name,
                    ],

                    'status' => $invitation->status,

                    'expires_at' => $invitation->expires_at,
                    'accepted_at' => $invitation->accepted_at,
                    'revoked_at' => $invitation->revoked_at,

                    'invited_by' => [
                        'id' => $invitation->invitedBy?->id,
                        'name' => $invitation->invitedBy?->name,
                        'email' => $invitation->invitedBy?->email,
                    ],

                    'created_at' => $invitation->created_at,
                ];
            });

        return response()->json([
            'message' => 'Tenant invitations retrieved successfully.',

            'data' => [
                'invitations' => $invitations,
                'count' => $invitations->count(),
            ],
        ]);
    }

    public function store(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'role' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $actor = $request->user('api');

        try {
            $result = $this
                ->tenantInvitationService
                ->create(
                    tenantId: $tenantId,
                    data: $validated,
                    invitedBy: $actor->id,
                    actor: $actor,
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $invitation = $result['invitation'];

        return response()->json([
            'message' => 'Tenant invitation created successfully.',

            'data' => [
                'invitation' => [
                    'id' => $invitation->id,
                    'tenant_id' => $invitation->tenant_id,
                    'name' => $invitation->name,
                    'email' => $invitation->email,

                    'role' => [
                        'id' => $invitation->role?->id,
                        'name' => $invitation->role?->name,
                    ],

                    'status' => $invitation->status,
                    'expires_at' => $invitation->expires_at,

                    'invited_by' => [
                        'id' => $invitation->invitedBy?->id,
                        'name' => $invitation->invitedBy?->name,
                        'email' => $invitation->invitedBy?->email,
                    ],

                    'created_at' => $invitation->created_at,
                ],

                'invitation_token' => $result['token'],
            ],
        ], 201);
    }

    public function show(
        string $tenantId,
        string $invitationId
    ): JsonResponse {
        $invitation = $this
            ->tenantInvitationService
            ->getById(
                $tenantId,
                $invitationId
            );

        if (!$invitation) {
            return response()->json([
                'message' => 'Tenant invitation not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Tenant invitation retrieved successfully.',

            'data' => [
                'invitation' => [
                    'id' => $invitation->id,
                    'tenant_id' => $invitation->tenant_id,

                    'name' => $invitation->name,
                    'email' => $invitation->email,

                    'role' => [
                        'id' => $invitation->role?->id,
                        'name' => $invitation->role?->name,
                    ],

                    'status' => $invitation->status,

                    'expires_at' => $invitation->expires_at,
                    'accepted_at' => $invitation->accepted_at,
                    'revoked_at' => $invitation->revoked_at,

                    'invited_by' => [
                        'id' => $invitation->invitedBy?->id,
                        'name' => $invitation->invitedBy?->name,
                        'email' => $invitation->invitedBy?->email,
                    ],

                    'created_at' => $invitation->created_at,
                    'updated_at' => $invitation->updated_at,
                ],
            ],
        ]);
    }

    public function revoke(
        Request $request,
        string $tenantId,
        string $invitationId
    ): JsonResponse {
        $invitation = $this
            ->tenantInvitationService
            ->getById(
                $tenantId,
                $invitationId
            );

        if (!$invitation) {
            return response()->json([
                'message' => 'Tenant invitation not found.',
            ], 404);
        }

        try {
            $invitation = $this
                ->tenantInvitationService
                ->revoke(
                    invitation: $invitation,
                    actor: $request->user('api'),
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tenant invitation revoked successfully.',

            'data' => [
                'invitation' => [
                    'id' => $invitation->id,
                    'tenant_id' => $invitation->tenant_id,
                    'name' => $invitation->name,
                    'email' => $invitation->email,

                    'role' => [
                        'id' => $invitation->role?->id,
                        'name' => $invitation->role?->name,
                    ],

                    'status' => $invitation->status,
                    'expires_at' => $invitation->expires_at,
                    'accepted_at' => $invitation->accepted_at,
                    'revoked_at' => $invitation->revoked_at,

                    'updated_at' => $invitation->updated_at,
                ],
            ],
        ]);
    }

    public function resend(
        Request $request,
        string $tenantId,
        string $invitationId
    ): JsonResponse {
        $invitation = $this
            ->tenantInvitationService
            ->getById(
                $tenantId,
                $invitationId
            );

        if (!$invitation) {
            return response()->json([
                'message' => 'Tenant invitation not found.',
            ], 404);
        }

        try {
            $result = $this
                ->tenantInvitationService
                ->resend(
                    invitation: $invitation,
                    actor: $request->user('api'),
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $invitation = $result['invitation'];

        return response()->json([
            'message' => 'Tenant invitation resent successfully.',

            'data' => [
                'invitation' => [
                    'id' => $invitation->id,
                    'tenant_id' => $invitation->tenant_id,

                    'name' => $invitation->name,
                    'email' => $invitation->email,

                    'role' => [
                        'id' => $invitation->role?->id,
                        'name' => $invitation->role?->name,
                    ],

                    'status' => $invitation->status,

                    'expires_at' => $invitation->expires_at,
                    'accepted_at' => $invitation->accepted_at,
                    'revoked_at' => $invitation->revoked_at,

                    'updated_at' => $invitation->updated_at,
                ],

                'invitation_token' => $result['token'],
            ],
        ]);
    }

    public function validateInvitation(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'token' => [
                'required',
                'string',
            ],
        ]);

        try {
            $invitation = $this
                ->tenantInvitationService
                ->validateToken(
                    $validated['token']
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Invitation is valid.',

            'data' => [
                'invitation' => [
                    'id' => $invitation->id,

                    'name' => $invitation->name,
                    'email' => $invitation->email,

                    'tenant' => [
                        'id' => $invitation->tenant?->id,
                        'name' => $invitation->tenant?->name,
                        'slug' => $invitation->tenant?->slug,
                    ],

                    'role' => [
                        'id' => $invitation->role?->id,
                        'name' => $invitation->role?->name,
                    ],

                    'status' => $invitation->status,
                    'expires_at' => $invitation->expires_at,
                ],
            ],
        ]);
    }

    public function accept(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'token' => [
                'required',
                'string',
            ],

            'name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        try {
            $result = $this
                ->tenantInvitationService
                ->accept(
                    plainToken: $validated['token'],
                    data: $validated,
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        $user = $result['user'];
        $membership = $result['membership'];
        $invitation = $result['invitation'];

        $user->unsetRelation('roles');
        $user->unsetRelation('permissions');

        return response()->json([
            'message' =>
                'Invitation accepted successfully.',

            'data' => [
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
                    'status' =>
                        $membership->status,
                    'joined_at' =>
                        $membership->joined_at,
                ],

                'invitation' => [
                    'id' => $invitation->id,
                    'status' =>
                        $invitation->status,
                    'accepted_at' =>
                        $invitation->accepted_at,
                ],
            ],
        ], 201);
    }
}