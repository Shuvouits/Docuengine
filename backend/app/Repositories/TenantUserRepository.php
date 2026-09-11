<?php

namespace App\Repositories;

use App\Models\TenantUser;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Role;

class TenantUserRepository
{
    public function allByTenant(string $tenantId): Collection
    {
        return TenantUser::query()
            ->with('user')
            ->where('tenant_id', $tenantId)
            ->orderBy('created_at')
            ->get();
    }

    public function findByTenantAndUser(
        string $tenantId,
        string $userId
    ): ?TenantUser {
        return TenantUser::query()
            ->with('user')
            ->where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->first();
    }

    public function rolesByTenant(string $tenantId): Collection
    {
        return Role::query()
            ->where('tenant_id', $tenantId)
            ->where('guard_name', 'api')
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);
    }

    public function findRole(
        string $tenantId,
        string $roleName
    ): ?Role {
        return Role::query()
            ->where('tenant_id', $tenantId)
            ->where('name', $roleName)
            ->where('guard_name', 'api')
            ->first();
    }

    public function createUser(array $data): User
    {
        return User::create($data);
    }

    public function createMembership(array $data): TenantUser
    {
        return TenantUser::create($data);
    }

    public function updateUser(
        User $user,
        array $data
    ): User {
        $user->update($data);

        return $user->fresh();
    }

    public function updateMembership(
        TenantUser $membership,
        array $data
    ): TenantUser {
        $membership->update($data);

        return $membership->fresh();
    }


    public function findByTenantAndEmail(
    string $tenantId,
    string $email
): ?TenantUser {
    return TenantUser::query()
        ->with('user')
        ->where('tenant_id', $tenantId)
        ->whereHas('user', function ($query) use ($email) {
            $query->where(
                'email',
                strtolower($email)
            );
        })
        ->first();
}


public function findUserByEmail(
    string $email
): ?User {
    return User::query()
        ->where(
            'email',
            strtolower($email)
        )
        ->first();
}


public function getActiveByTenant(
    string $tenantId
): \Illuminate\Database\Eloquent\Collection {
    return \App\Models\TenantUser::query()
        ->with([
            'user.roles',
        ])
        ->where('tenant_id', $tenantId)
        ->where(
            'status',
            \App\Models\TenantUser::STATUS_ACTIVE
        )
        ->orderBy('id')
        ->get();
}





}
