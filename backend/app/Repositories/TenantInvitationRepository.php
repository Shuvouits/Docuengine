<?php

namespace App\Repositories;

use App\Models\TenantInvitation;
use Illuminate\Database\Eloquent\Collection;

class TenantInvitationRepository
{
    /*
    |--------------------------------------------------------------------------
    | Get Tenant Invitations
    |--------------------------------------------------------------------------
    */

    public function allByTenant(string $tenantId): Collection
    {
        return TenantInvitation::query()
            ->with([
                'role:id,name,guard_name',
                'invitedBy:id,name,email',
            ])
            ->where('tenant_id', $tenantId)
            ->latest()
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Find Invitation
    |--------------------------------------------------------------------------
    */

    public function findByTenantAndId(
        string $tenantId,
        string $invitationId
    ): ?TenantInvitation {
        return TenantInvitation::query()
            ->with([
                'role:id,name,guard_name',
                'invitedBy:id,name,email',
            ])
            ->where('tenant_id', $tenantId)
            ->whereKey($invitationId)
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Find Invitation By Token Hash
    |--------------------------------------------------------------------------
    |
    | Used when an invited user opens the invitation link.
    |
    */

    public function findByTokenHash(
        string $tokenHash
    ): ?TenantInvitation {
        return TenantInvitation::query()
            ->with([
                'tenant',
                'role:id,name,guard_name,tenant_id',
                'invitedBy:id,name,email',
            ])
            ->where('token_hash', $tokenHash)
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Find Existing Pending Invitation
    |--------------------------------------------------------------------------
    |
    | Prevents creating multiple active invitations for the same email
    | inside the same tenant.
    |
    */

    public function findPendingByTenantAndEmail(
        string $tenantId,
        string $email
    ): ?TenantInvitation {
        return TenantInvitation::query()
            ->where('tenant_id', $tenantId)
            ->where('email', strtolower($email))
            ->where(
                'status',
                TenantInvitation::STATUS_PENDING
            )
            ->latest()
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Create Invitation
    |--------------------------------------------------------------------------
    */

    public function create(array $data): TenantInvitation
    {
        return TenantInvitation::create($data);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Invitation
    |--------------------------------------------------------------------------
    */

    public function update(
        TenantInvitation $invitation,
        array $data
    ): TenantInvitation {
        $invitation->update($data);

        return $invitation->fresh([
            'role:id,name,guard_name',
            'invitedBy:id,name,email',
        ]);
    }


    public function findByTokenHashForUpdate(
    string $tokenHash
): ?TenantInvitation {
    return TenantInvitation::query()
        ->where(
            'token_hash',
            $tokenHash
        )
        ->lockForUpdate()
        ->first();
}



}
