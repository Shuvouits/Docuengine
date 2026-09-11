<?php

namespace App\Services\Tenant;

use App\Models\SecurityEvent;
use App\Models\TenantUser;
use App\Models\User;
use App\Repositories\TenantUserRepository;
use App\Services\Security\SecurityEventService;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TenantUserService
{
    public function __construct(
        protected TenantUserRepository $tenantUserRepository,
        protected SecurityEventService $securityEventService
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
        array $data
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
            $role
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

            $legacyRole = $role->name === 'MSP Admin'
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

            return [
                'user' => $user,
                'membership' => $membership,
            ];
        });
    }

    public function update(
        TenantUser $membership,
        string $tenantId,
        array $data
    ): array {
        $user = $membership->user;

        if (!$user) {
            throw new DomainException(
                'Tenant user not found.'
            );
        }

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
            $data,
            $role
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
        ?string $userAgent = null
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

        $updatedMembership = $this
            ->tenantUserRepository
            ->updateMembership(
                $membership,
                [
                    'status' =>
                        TenantUser::STATUS_SUSPENDED,
                ]
            );

        $this
            ->securityEventService
            ->record(
                eventType: 'user.suspended',
                category: SecurityEventService::CATEGORY_USER,
                tenantId: $membership->tenant_id,
                actorUserId: $authenticatedUserId,
                subjectUserId: $membership->user_id,
                severity: SecurityEvent::SEVERITY_WARNING,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                description: 'Tenant user access was suspended.',
                metadata: [
                    'membership_id' => $membership->id,
                    'previous_status' =>
                        TenantUser::STATUS_ACTIVE,
                    'new_status' =>
                        TenantUser::STATUS_SUSPENDED,
                    'scope' => 'tenant_membership',
                ]
            );

        return $updatedMembership;
    }

    public function activate(
        TenantUser $membership,
        ?string $authenticatedUserId = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
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

        $updatedMembership = $this
            ->tenantUserRepository
            ->updateMembership(
                $membership,
                [
                    'status' =>
                        TenantUser::STATUS_ACTIVE,
                ]
            );

        $this
            ->securityEventService
            ->record(
                eventType: 'user.activated',
                category: SecurityEventService::CATEGORY_USER,
                tenantId: $membership->tenant_id,
                actorUserId: $authenticatedUserId,
                subjectUserId: $membership->user_id,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                description: 'Tenant user access was activated.',
                metadata: [
                    'membership_id' => $membership->id,
                    'previous_status' =>
                        TenantUser::STATUS_SUSPENDED,
                    'new_status' =>
                        TenantUser::STATUS_ACTIVE,
                    'scope' => 'tenant_membership',
                ]
            );

        return $updatedMembership;
    }
}
