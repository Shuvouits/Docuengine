<?php

namespace App\Services\Tenant;

use App\Models\AuditEvent;
use App\Models\SecurityEvent;
use App\Models\TenantUser;
use App\Models\User;
use App\Repositories\TenantUserRepository;
use App\Services\Audit\AuditEventService;
use App\Services\Security\SecurityEventService;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TenantUserService
{
    public function __construct(
        protected TenantUserRepository $tenantUserRepository,
        protected SecurityEventService $securityEventService,
        protected AuditEventService $auditEventService
    ) {
    }

    public function getAll(
        string $tenantId
    ): Collection {
        return $this
            ->tenantUserRepository
            ->allByTenant($tenantId);
    }

    public function getById(
        string $tenantId,
        string $userId
    ): ?TenantUser {
        return $this
            ->tenantUserRepository
            ->findByTenantAndUser(
                $tenantId,
                $userId
            );
    }

    public function getRoleOptions(
        string $tenantId
    ): Collection {
        return $this
            ->tenantUserRepository
            ->rolesByTenant($tenantId);
    }

    public function create(
        string $tenantId,
        array $data,
        ?User $authenticatedUser = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): array {
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

        return DB::transaction(function () use (
            $tenantId,
            $data,
            $role,
            $authenticatedUser,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $user = $this
                ->tenantUserRepository
                ->createUser([
                    'name' => $data['name'],
                    'email' => strtolower(
                        $data['email']
                    ),
                    'password' => $data['password'],
                    'status' => User::STATUS_ACTIVE,
                    'is_platform_owner' => false,
                ]);

            $legacyRole =
                $role->name === 'MSP Admin'
                    ? 'admin'
                    : 'member';

            $membership = $this
                ->tenantUserRepository
                ->createMembership([
                    'tenant_id' => $tenantId,
                    'user_id' => $user->id,
                    'role' => $legacyRole,
                    'status' => TenantUser::STATUS_ACTIVE,
                    'joined_at' => now(),
                ]);

            $user->assignRole($role);

            $user->unsetRelation('roles');
            $user->unsetRelation('permissions');

            /*
            |--------------------------------------------------------------------------
            | Audit Event
            |--------------------------------------------------------------------------
            |
            | Never store passwords or password hashes in audit metadata.
            |
            */

            $this
                ->auditEventService
                ->record(
                    tenantId: $tenantId,
                    actor: $authenticatedUser,
                    action: AuditEvent::ACTION_CREATED,
                    category: AuditEvent::CATEGORY_ACCESS,
                    targetType: 'user',
                    targetId: $user->id,
                    targetLabel: $user->name,
                    description: 'Tenant user was created.',
                    metadata: [
                        'membership_id' => $membership->id,
                        'email' => $user->email,
                        'role' => $role->name,
                        'membership_status' =>
                            $membership->status,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            return [
                'user' => $user,
                'membership' => $membership,
            ];
        });
    }

    public function update(
        TenantUser $membership,
        string $tenantId,
        array $data,
        ?User $authenticatedUser = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): array {
        $user = $membership->user;

        if (!$user) {
            throw new DomainException(
                'Tenant user not found.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Snapshot Before Changes
        |--------------------------------------------------------------------------
        */

        $originalName = $user->name;
        $originalEmail = $user->email;

        $user->unsetRelation('roles');
        $user->unsetRelation('permissions');

        $originalRole = $user
            ->getRoleNames()
            ->first();

        $role = null;

        if (array_key_exists('role', $data)) {
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
        }

        return DB::transaction(function () use (
            $user,
            $membership,
            $tenantId,
            $data,
            $role,
            $originalName,
            $originalEmail,
            $originalRole,
            $authenticatedUser,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $userData = [];

            if (array_key_exists('name', $data)) {
                $userData['name'] = $data['name'];
            }

            if (array_key_exists('email', $data)) {
                $userData['email'] = strtolower(
                    $data['email']
                );
            }

            if (!empty($userData)) {
                $user = $this
                    ->tenantUserRepository
                    ->updateUser(
                        $user,
                        $userData
                    );
            }

            if ($role) {
                $user->unsetRelation('roles');
                $user->unsetRelation('permissions');

                $user->syncRoles([
                    $role,
                ]);

                $membership = $this
                    ->tenantUserRepository
                    ->updateMembership(
                        $membership,
                        [
                            'role' =>
                                $role->name === 'MSP Admin'
                                    ? 'admin'
                                    : 'member',
                        ]
                    );
            }

            $user->refresh();
            $membership->refresh();

            $user->unsetRelation('roles');
            $user->unsetRelation('permissions');

            /*
            |--------------------------------------------------------------------------
            | Build Change Summary
            |--------------------------------------------------------------------------
            */

            $changes = [];

            if (
                array_key_exists('name', $data) &&
                $originalName !== $user->name
            ) {
                $changes['name'] = [
                    'from' => $originalName,
                    'to' => $user->name,
                ];
            }

            if (
                array_key_exists('email', $data) &&
                $originalEmail !== $user->email
            ) {
                $changes['email'] = [
                    'from' => $originalEmail,
                    'to' => $user->email,
                ];
            }

            $newRole =
                $role?->name ?? $originalRole;

            if (
                $role &&
                $originalRole !== $newRole
            ) {
                $changes['role'] = [
                    'from' => $originalRole,
                    'to' => $newRole,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Audit Event
            |--------------------------------------------------------------------------
            */

            if (!empty($changes)) {
                $this
                    ->auditEventService
                    ->record(
                        tenantId: $tenantId,
                        actor: $authenticatedUser,
                        action: AuditEvent::ACTION_UPDATED,
                        category: AuditEvent::CATEGORY_ACCESS,
                        targetType: 'user',
                        targetId: $user->id,
                        targetLabel: $user->name,
                        description: 'Tenant user was updated.',
                        changes: $changes,
                        metadata: [
                            'membership_id' =>
                                $membership->id,
                        ],
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );
            }

            return [
                'user' => $user,
                'membership' => $membership,
            ];
        });
    }

    public function suspend(
        TenantUser $membership,
        string $authenticatedUserId,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?User $authenticatedUser = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): TenantUser {
        if (
            $membership->user_id ===
            $authenticatedUserId
        ) {
            throw new DomainException(
                'You cannot suspend your own tenant access.'
            );
        }

        if (
            $membership->status ===
            TenantUser::STATUS_SUSPENDED
        ) {
            throw new DomainException(
                'Tenant user is already suspended.'
            );
        }

        return DB::transaction(function () use (
            $membership,
            $authenticatedUserId,
            $ipAddress,
            $userAgent,
            $authenticatedUser,
            $requestMethod,
            $requestPath
        ) {
            $updatedMembership = $this
                ->tenantUserRepository
                ->updateMembership(
                    $membership,
                    [
                        'status' =>
                            TenantUser::STATUS_SUSPENDED,
                    ]
                );

            /*
            |--------------------------------------------------------------------------
            | Security Event
            |--------------------------------------------------------------------------
            */

            $this
                ->securityEventService
                ->record(
                    eventType: 'user.suspended',
                    category:
                        SecurityEventService::CATEGORY_USER,
                    tenantId: $membership->tenant_id,
                    actorUserId: $authenticatedUserId,
                    subjectUserId: $membership->user_id,
                    severity:
                        SecurityEvent::SEVERITY_WARNING,
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    description:
                        'Tenant user access was suspended.',
                    metadata: [
                        'membership_id' =>
                            $membership->id,
                        'previous_status' =>
                            TenantUser::STATUS_ACTIVE,
                        'new_status' =>
                            TenantUser::STATUS_SUSPENDED,
                        'scope' =>
                            'tenant_membership',
                    ]
                );

            /*
            |--------------------------------------------------------------------------
            | Audit Event
            |--------------------------------------------------------------------------
            */

            $this
                ->auditEventService
                ->record(
                    tenantId: $membership->tenant_id,
                    actor: $authenticatedUser,
                    action: AuditEvent::ACTION_UPDATED,
                    category: AuditEvent::CATEGORY_ACCESS,
                    targetType: 'user',
                    targetId: $membership->user_id,
                    targetLabel:
                        $membership->user?->name ??
                        'Tenant User',
                    description:
                        'Tenant user access was suspended.',
                    changes: [
                        'membership_status' => [
                            'from' =>
                                TenantUser::STATUS_ACTIVE,
                            'to' =>
                                TenantUser::STATUS_SUSPENDED,
                        ],
                    ],
                    metadata: [
                        'membership_id' =>
                            $membership->id,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            return $updatedMembership;
        });
    }

    public function activate(
        TenantUser $membership,
        ?string $authenticatedUserId = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?User $authenticatedUser = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): TenantUser {
        $user = $membership->user;

        if (!$user) {
            throw new DomainException(
                'Tenant user not found.'
            );
        }

        if (!$user->isActive()) {
            throw new DomainException(
                'This user account is not globally active.'
            );
        }

        if (
            $membership->status ===
            TenantUser::STATUS_ACTIVE
        ) {
            throw new DomainException(
                'Tenant user is already active.'
            );
        }

        return DB::transaction(function () use (
            $membership,
            $authenticatedUserId,
            $ipAddress,
            $userAgent,
            $authenticatedUser,
            $requestMethod,
            $requestPath
        ) {
            $updatedMembership = $this
                ->tenantUserRepository
                ->updateMembership(
                    $membership,
                    [
                        'status' =>
                            TenantUser::STATUS_ACTIVE,
                    ]
                );

            /*
            |--------------------------------------------------------------------------
            | Security Event
            |--------------------------------------------------------------------------
            */

            $this
                ->securityEventService
                ->record(
                    eventType: 'user.activated',
                    category:
                        SecurityEventService::CATEGORY_USER,
                    tenantId: $membership->tenant_id,
                    actorUserId: $authenticatedUserId,
                    subjectUserId: $membership->user_id,
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    description:
                        'Tenant user access was activated.',
                    metadata: [
                        'membership_id' =>
                            $membership->id,
                        'previous_status' =>
                            TenantUser::STATUS_SUSPENDED,
                        'new_status' =>
                            TenantUser::STATUS_ACTIVE,
                        'scope' =>
                            'tenant_membership',
                    ]
                );

            /*
            |--------------------------------------------------------------------------
            | Audit Event
            |--------------------------------------------------------------------------
            */

            $this
                ->auditEventService
                ->record(
                    tenantId: $membership->tenant_id,
                    actor: $authenticatedUser,
                    action: AuditEvent::ACTION_UPDATED,
                    category: AuditEvent::CATEGORY_ACCESS,
                    targetType: 'user',
                    targetId: $membership->user_id,
                    targetLabel:
                        $membership->user?->name ??
                        'Tenant User',
                    description:
                        'Tenant user access was activated.',
                    changes: [
                        'membership_status' => [
                            'from' =>
                                TenantUser::STATUS_SUSPENDED,
                            'to' =>
                                TenantUser::STATUS_ACTIVE,
                        ],
                    ],
                    metadata: [
                        'membership_id' =>
                            $membership->id,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            return $updatedMembership;
        });
    }
}
