<?php

namespace App\Services\Tenant;

use App\Models\AuditEvent;
use App\Models\TenantInvitation;
use App\Models\TenantUser;
use App\Models\User;
use App\Repositories\TenantInvitationRepository;
use App\Repositories\TenantUserRepository;
use App\Services\Audit\AuditEventService;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

class TenantInvitationService
{
    public function __construct(
        protected TenantInvitationRepository $invitationRepository,
        protected TenantUserRepository $tenantUserRepository,
        protected AuditEventService $auditEventService
    ) {
    }

    public function getAll(string $tenantId): Collection
    {
        return $this
            ->invitationRepository
            ->allByTenant($tenantId);
    }

    public function getById(
        string $tenantId,
        string $invitationId
    ): ?TenantInvitation {
        return $this
            ->invitationRepository
            ->findByTenantAndId(
                $tenantId,
                $invitationId
            );
    }

    public function create(
        string $tenantId,
        array $data,
        string $invitedBy,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): array {
        $email = strtolower(
            trim($data['email'])
        );

        $existingMembership = $this
            ->tenantUserRepository
            ->findByTenantAndEmail(
                $tenantId,
                $email
            );

        if ($existingMembership) {
            throw new DomainException(
                'This user is already a member of the tenant.'
            );
        }

        $existingInvitation = $this
            ->invitationRepository
            ->findPendingByTenantAndEmail(
                $tenantId,
                $email
            );

        if (
            $existingInvitation &&
            !$existingInvitation->isExpired()
        ) {
            throw new DomainException(
                'A pending invitation already exists for this email address.'
            );
        }

        $role = $this
            ->tenantUserRepository
            ->findRole(
                $tenantId,
                $data['role']
            );

        if (!$role) {
            throw new DomainException(
                'The selected role is not available for this tenant.'
            );
        }

        $plainToken = Str::random(64);

        $tokenHash = hash(
            'sha256',
            $plainToken
        );

        $expiresInHours = (int) config(
            'docuengine.invitations.expires_hours',
            72
        );

        $invitation = DB::transaction(
            function () use (
                $tenantId,
                $data,
                $email,
                $role,
                $tokenHash,
                $invitedBy,
                $expiresInHours,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $invitation = $this
                    ->invitationRepository
                    ->create([
                        'tenant_id' => $tenantId,
                        'name' => $data['name'] ?? null,
                        'email' => $email,
                        'role_id' => $role->id,
                        'token_hash' => $tokenHash,
                        'status' => TenantInvitation::STATUS_PENDING,
                        'expires_at' => now()->addHours(
                            $expiresInHours
                        ),
                        'invited_by' => $invitedBy,
                    ]);

                if ($actor) {
                    $this
                        ->auditEventService
                        ->record(
                            tenantId: $tenantId,
                            actor: $actor,
                            action: AuditEvent::ACTION_CREATED,
                            category: AuditEvent::CATEGORY_ACCESS,
                            targetType: 'tenant_invitation',
                            targetId: (string) $invitation->id,
                            targetLabel: $email,
                            description: 'Tenant invitation was created.',
                            changes: null,
                            metadata: [
                                'email' => $email,
                                'role' => $role->name,
                                'status' => TenantInvitation::STATUS_PENDING,
                            ],
                            ipAddress: $ipAddress,
                            userAgent: $userAgent,
                            requestMethod: $requestMethod,
                            requestPath: $requestPath
                        );
                }

                return $invitation;
            }
        );

        $invitation->load([
            'role:id,name,guard_name',
            'invitedBy:id,name,email',
        ]);

        return [
            'invitation' => $invitation,
            'token' => $plainToken,
        ];
    }

    public function revoke(
        TenantInvitation $invitation,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): TenantInvitation {
        if ($invitation->isAccepted()) {
            throw new DomainException(
                'An accepted invitation cannot be revoked.'
            );
        }

        if ($invitation->isRevoked()) {
            throw new DomainException(
                'This invitation is already revoked.'
            );
        }

        $oldStatus = $invitation->status;

        return DB::transaction(
            function () use (
                $invitation,
                $oldStatus,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $updatedInvitation = $this
                    ->invitationRepository
                    ->update(
                        $invitation,
                        [
                            'status' =>
                                TenantInvitation::STATUS_REVOKED,

                            'revoked_at' =>
                                now(),
                        ]
                    );

                if ($actor) {
                    $this
                        ->auditEventService
                        ->record(
                            tenantId: $updatedInvitation->tenant_id,
                            actor: $actor,
                            action: AuditEvent::ACTION_UPDATED,
                            category: AuditEvent::CATEGORY_ACCESS,
                            targetType: 'tenant_invitation',
                            targetId: (string) $updatedInvitation->id,
                            targetLabel: $updatedInvitation->email,
                            description: 'Tenant invitation was revoked.',
                            changes: [
                                'status' => [
                                    'from' => $oldStatus,
                                    'to' =>
                                        TenantInvitation::STATUS_REVOKED,
                                ],
                            ],
                            metadata: [
                                'email' =>
                                    $updatedInvitation->email,
                            ],
                            ipAddress: $ipAddress,
                            userAgent: $userAgent,
                            requestMethod: $requestMethod,
                            requestPath: $requestPath
                        );
                }

                return $updatedInvitation;
            }
        );
    }

    public function resend(
        TenantInvitation $invitation,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): array {
        if ($invitation->isAccepted()) {
            throw new DomainException(
                'An accepted invitation cannot be resent.'
            );
        }

        if ($invitation->isRevoked()) {
            throw new DomainException(
                'A revoked invitation cannot be resent.'
            );
        }

        $oldStatus = $invitation->status;

        $oldExpiresAt = $invitation->expires_at
            ? $invitation->expires_at->toISOString()
            : null;

        $plainToken = Str::random(64);

        $tokenHash = hash(
            'sha256',
            $plainToken
        );

        $expiresInHours = (int) config(
            'docuengine.invitations.expires_hours',
            72
        );

        $newExpiresAt = now()->addHours(
            $expiresInHours
        );

        $invitation = DB::transaction(
            function () use (
                $invitation,
                $tokenHash,
                $newExpiresAt,
                $oldStatus,
                $oldExpiresAt,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $updatedInvitation = $this
                    ->invitationRepository
                    ->update(
                        $invitation,
                        [
                            'token_hash' => $tokenHash,
                            'status' =>
                                TenantInvitation::STATUS_PENDING,
                            'expires_at' => $newExpiresAt,
                            'accepted_at' => null,
                            'revoked_at' => null,
                        ]
                    );

                if ($actor) {
                    $changes = [
                        'expires_at' => [
                            'from' => $oldExpiresAt,
                            'to' => $updatedInvitation->expires_at
                                ? $updatedInvitation
                                    ->expires_at
                                    ->toISOString()
                                : null,
                        ],
                    ];

                    if (
                        $oldStatus !==
                        TenantInvitation::STATUS_PENDING
                    ) {
                        $changes['status'] = [
                            'from' => $oldStatus,
                            'to' =>
                                TenantInvitation::STATUS_PENDING,
                        ];
                    }

                    $this
                        ->auditEventService
                        ->record(
                            tenantId: $updatedInvitation->tenant_id,
                            actor: $actor,
                            action: AuditEvent::ACTION_UPDATED,
                            category: AuditEvent::CATEGORY_ACCESS,
                            targetType: 'tenant_invitation',
                            targetId: (string) $updatedInvitation->id,
                            targetLabel: $updatedInvitation->email,
                            description: 'Tenant invitation was resent.',
                            changes: $changes,
                            metadata: [
                                'email' =>
                                    $updatedInvitation->email,
                            ],
                            ipAddress: $ipAddress,
                            userAgent: $userAgent,
                            requestMethod: $requestMethod,
                            requestPath: $requestPath
                        );
                }

                return $updatedInvitation;
            }
        );

        return [
            'invitation' => $invitation,
            'token' => $plainToken,
        ];
    }

    public function findByToken(
        string $plainToken
    ): ?TenantInvitation {
        $tokenHash = hash(
            'sha256',
            $plainToken
        );

        return $this
            ->invitationRepository
            ->findByTokenHash(
                $tokenHash
            );
    }

    public function validateToken(
        string $plainToken
    ): TenantInvitation {
        $invitation = $this->findByToken(
            $plainToken
        );

        if (!$invitation) {
            throw new DomainException(
                'Invitation token is invalid.'
            );
        }

        if ($invitation->isRevoked()) {
            throw new DomainException(
                'This invitation has been revoked.'
            );
        }

        if ($invitation->isAccepted()) {
            throw new DomainException(
                'This invitation has already been accepted.'
            );
        }

        if ($invitation->isExpired()) {
            if (
                $invitation->status !==
                TenantInvitation::STATUS_EXPIRED
            ) {
                $invitation = $this
                    ->invitationRepository
                    ->update(
                        $invitation,
                        [
                            'status' =>
                                TenantInvitation::STATUS_EXPIRED,
                        ]
                    );
            }

            throw new DomainException(
                'This invitation has expired.'
            );
        }

        if (!$invitation->isPending()) {
            throw new DomainException(
                'This invitation is no longer valid.'
            );
        }

        return $invitation;
    }

    public function accept(
        string $plainToken,
        array $data,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): array {
        $tokenHash = hash(
            'sha256',
            $plainToken
        );

        return DB::transaction(function () use (
            $tokenHash,
            $data,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $invitation = $this
                ->invitationRepository
                ->findByTokenHashForUpdate(
                    $tokenHash
                );

            if (!$invitation) {
                throw new DomainException(
                    'Invitation token is invalid.'
                );
            }

            $invitation->load([
                'tenant',
                'role:id,name,guard_name,tenant_id',
                'invitedBy:id,name,email',
            ]);

            if ($invitation->isRevoked()) {
                throw new DomainException(
                    'This invitation has been revoked.'
                );
            }

            if ($invitation->isAccepted()) {
                throw new DomainException(
                    'This invitation has already been accepted.'
                );
            }

            if ($invitation->isExpired()) {
                throw new DomainException(
                    'This invitation has expired.'
                );
            }

            if (!$invitation->isPending()) {
                throw new DomainException(
                    'This invitation is no longer valid.'
                );
            }

            $role = $this
                ->tenantUserRepository
                ->findRole(
                    $invitation->tenant_id,
                    $invitation->role->name
                );

            if (!$role) {
                throw new DomainException(
                    'The invitation role is no longer available.'
                );
            }

            $existingMembership = $this
                ->tenantUserRepository
                ->findByTenantAndEmail(
                    $invitation->tenant_id,
                    $invitation->email
                );

            if ($existingMembership) {
                throw new DomainException(
                    'This user is already a member of the tenant.'
                );
            }

            $user = $this
                ->tenantUserRepository
                ->findUserByEmail(
                    $invitation->email
                );

            if (!$user) {
                $name = trim(
                    $data['name']
                        ?? $invitation->name
                        ?? ''
                );

                if (!$name) {
                    throw new DomainException(
                        'Name is required to activate this account.'
                    );
                }

                if (empty($data['password'])) {
                    throw new DomainException(
                        'Password is required to activate this account.'
                    );
                }

                $user = $this
                    ->tenantUserRepository
                    ->createUser([
                        'name' => $name,

                        'email' => strtolower(
                            $invitation->email
                        ),

                        'password' =>
                            $data['password'],

                        'status' =>
                            User::STATUS_ACTIVE,

                        'is_platform_owner' =>
                            false,
                    ]);
            } else {
                if (!$user->isActive()) {
                    throw new DomainException(
                        'The existing user account is not active.'
                    );
                }
            }

            $legacyRole =
                $role->name === 'MSP Admin'
                    ? 'admin'
                    : 'member';

            $membership = $this
                ->tenantUserRepository
                ->createMembership([
                    'tenant_id' =>
                        $invitation->tenant_id,

                    'user_id' =>
                        $user->id,

                    'role' =>
                        $legacyRole,

                    'status' =>
                        TenantUser::STATUS_ACTIVE,

                    'joined_at' =>
                        now(),
                ]);

            $permissionRegistrar =
                app(PermissionRegistrar::class);

            $permissionRegistrar
                ->setPermissionsTeamId(
                    $invitation->tenant_id
                );

            try {
                $user->unsetRelation('roles');
                $user->unsetRelation('permissions');

                $user->syncRoles([
                    $role,
                ]);

                $user->unsetRelation('roles');
                $user->unsetRelation('permissions');
            } finally {
                $permissionRegistrar
                    ->setPermissionsTeamId(null);
            }

            $oldStatus = $invitation->status;

            $invitation = $this
                ->invitationRepository
                ->update(
                    $invitation,
                    [
                        'status' =>
                            TenantInvitation::STATUS_ACCEPTED,

                        'accepted_at' =>
                            now(),

                        'revoked_at' =>
                            null,
                    ]
                );

            $this
                ->auditEventService
                ->record(
                    tenantId: $invitation->tenant_id,
                    actor: $user,
                    action: AuditEvent::ACTION_UPDATED,
                    category: AuditEvent::CATEGORY_ACCESS,
                    targetType: 'tenant_invitation',
                    targetId: (string) $invitation->id,
                    targetLabel: $invitation->email,
                    description: 'Tenant invitation was accepted.',
                    changes: [
                        'status' => [
                            'from' => $oldStatus,
                            'to' =>
                                TenantInvitation::STATUS_ACCEPTED,
                        ],
                    ],
                    metadata: [
                        'accepted_user_id' => $user->id,
                        'assigned_role' => $role->name,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            return [
                'user' => $user,
                'membership' => $membership,
                'invitation' => $invitation,
                'assigned_role' => $role->name,
            ];
        });
    }
}