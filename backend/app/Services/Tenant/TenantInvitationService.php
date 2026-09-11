<?php

namespace App\Services\Tenant;

use App\Models\TenantInvitation;
use App\Repositories\TenantInvitationRepository;
use App\Repositories\TenantUserRepository;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\TenantUser;
use App\Models\User;
use Spatie\Permission\PermissionRegistrar;

class TenantInvitationService
{
    public function __construct(
        protected TenantInvitationRepository $invitationRepository,
        protected TenantUserRepository $tenantUserRepository
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Get Tenant Invitations
    |--------------------------------------------------------------------------
    */

    public function getAll(string $tenantId): Collection
    {
        return $this->invitationRepository
            ->allByTenant($tenantId);
    }

    /*
    |--------------------------------------------------------------------------
    | Get Single Invitation
    |--------------------------------------------------------------------------
    */

    public function getById(
        string $tenantId,
        string $invitationId
    ): ?TenantInvitation {
        return $this->invitationRepository
            ->findByTenantAndId(
                $tenantId,
                $invitationId
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Invitation
    |--------------------------------------------------------------------------
    */

    public function create(
        string $tenantId,
        array $data,
        string $invitedBy
    ): array {
        $email = strtolower(
            trim($data['email'])
        );

        /*
        |--------------------------------------------------------------------------
        | Prevent Inviting Existing Tenant Member
        |--------------------------------------------------------------------------
        */

        $existingMembership =
            $this->tenantUserRepository
                ->findByTenantAndEmail(
                    $tenantId,
                    $email
                );

        if ($existingMembership) {
            throw new DomainException(
                'This user is already a member of the tenant.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent Duplicate Pending Invitation
        |--------------------------------------------------------------------------
        */

        $existingInvitation =
            $this->invitationRepository
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

        /*
        |--------------------------------------------------------------------------
        | Validate Tenant Role
        |--------------------------------------------------------------------------
        */

        $role =
            $this->tenantUserRepository
                ->findRole(
                    $tenantId,
                    $data['role']
                );

        if (!$role) {
            throw new DomainException(
                'The selected role is not available for this tenant.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Generate Secure Invitation Token
        |--------------------------------------------------------------------------
        |
        | Raw token is returned once.
        | Database stores only SHA-256 hash.
        |
        */

        $plainToken =
            Str::random(64);

        $tokenHash =
            hash(
                'sha256',
                $plainToken
            );

        $expiresInHours =
            (int) config(
                'docuengine.invitations.expires_hours',
                72
            );

        /*
        |--------------------------------------------------------------------------
        | Create Invitation
        |--------------------------------------------------------------------------
        */

        $invitation =
            DB::transaction(
                function () use (
                    $tenantId,
                    $data,
                    $email,
                    $role,
                    $tokenHash,
                    $invitedBy,
                    $expiresInHours
                ) {
                    return $this
                        ->invitationRepository
                        ->create([
                            'tenant_id' =>
                                $tenantId,

                            'name' =>
                                $data['name']
                                    ?? null,

                            'email' =>
                                $email,

                            'role_id' =>
                                $role->id,

                            'token_hash' =>
                                $tokenHash,

                            'status' =>
                                TenantInvitation::STATUS_PENDING,

                            'expires_at' =>
                                now()->addHours(
                                    $expiresInHours
                                ),

                            'invited_by' =>
                                $invitedBy,
                        ]);
                }
            );

        $invitation->load([
            'role:id,name,guard_name',
            'invitedBy:id,name,email',
        ]);

        return [
            'invitation' =>
                $invitation,

            /*
            |--------------------------------------------------------------------------
            | Raw Token
            |--------------------------------------------------------------------------
            |
            | This will later be placed inside the invitation email URL.
            | It must never be persisted in the database.
            |
            */

            'token' =>
                $plainToken,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Revoke Invitation
    |--------------------------------------------------------------------------
    */

    public function revoke(
        TenantInvitation $invitation
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

        return $this
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
    }

    /*
    |--------------------------------------------------------------------------
    | Resend Invitation
    |--------------------------------------------------------------------------
    |
    | A new token is generated every time.
    | The previous invitation token immediately becomes invalid.
    |
    */

    public function resend(
        TenantInvitation $invitation
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

        $plainToken =
            Str::random(64);

        $tokenHash =
            hash(
                'sha256',
                $plainToken
            );

        $expiresInHours =
            (int) config(
                'docuengine.invitations.expires_hours',
                72
            );

        $invitation =
            $this
                ->invitationRepository
                ->update(
                    $invitation,
                    [
                        'token_hash' =>
                            $tokenHash,

                        'status' =>
                            TenantInvitation::STATUS_PENDING,

                        'expires_at' =>
                            now()->addHours(
                                $expiresInHours
                            ),

                        'accepted_at' =>
                            null,

                        'revoked_at' =>
                            null,
                    ]
                );

        return [
            'invitation' =>
                $invitation,

            'token' =>
                $plainToken,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Find Invitation From Raw Token
    |--------------------------------------------------------------------------
    */

    public function findByToken(
        string $plainToken
    ): ?TenantInvitation {
        $tokenHash =
            hash(
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

    /*
    |--------------------------------------------------------------------------
    | Revoked Invitation
    |--------------------------------------------------------------------------
    */

    if ($invitation->isRevoked()) {
        throw new DomainException(
            'This invitation has been revoked.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Already Accepted
    |--------------------------------------------------------------------------
    */

    if ($invitation->isAccepted()) {
        throw new DomainException(
            'This invitation has already been accepted.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Expired Invitation
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Only Pending Invitations Are Valid
    |--------------------------------------------------------------------------
    */

    if (!$invitation->isPending()) {
        throw new DomainException(
            'This invitation is no longer valid.'
        );
    }

    return $invitation;
}




public function accept(
    string $plainToken,
    array $data
): array {
    $tokenHash = hash(
        'sha256',
        $plainToken
    );

    return DB::transaction(function () use (
        $tokenHash,
        $data
    ) {
        /*
        |--------------------------------------------------------------------------
        | Lock Invitation
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | Validate Invitation State
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | Make Sure Role Still Belongs To Tenant
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | Prevent Existing Membership
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | Find Existing Global User
        |--------------------------------------------------------------------------
        */

        $user = $this
            ->tenantUserRepository
            ->findUserByEmail(
                $invitation->email
            );

        /*
        |--------------------------------------------------------------------------
        | Create New User When Needed
        |--------------------------------------------------------------------------
        */

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
            /*
            |--------------------------------------------------------------------------
            | Existing Global User Must Be Active
            |--------------------------------------------------------------------------
            */

            if (!$user->isActive()) {
                throw new DomainException(
                    'The existing user account is not active.'
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Create Tenant Membership
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | Set Spatie Tenant Context
        |--------------------------------------------------------------------------
        */

        $permissionRegistrar =
            app(PermissionRegistrar::class);

        $permissionRegistrar
            ->setPermissionsTeamId(
                $invitation->tenant_id
            );

        try {
            $user->unsetRelation('roles');
            $user->unsetRelation('permissions');

            /*
            |--------------------------------------------------------------------------
            | Assign Invited Role
            |--------------------------------------------------------------------------
            */

            $user->syncRoles([
                $role,
            ]);

            $user->unsetRelation('roles');
            $user->unsetRelation('permissions');
        } finally {
            $permissionRegistrar
                ->setPermissionsTeamId(null);
        }

        /*
        |--------------------------------------------------------------------------
        | Mark Invitation Accepted
        |--------------------------------------------------------------------------
        */

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

        return [

          'user' => $user,
    'membership' => $membership,
    'invitation' => $invitation,
    'assigned_role' => $role->name,
        ];
    });
}




}
