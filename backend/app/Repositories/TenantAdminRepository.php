<?php

namespace App\Repositories;

use App\Models\TenantUser;
use App\Models\User;

class TenantAdminRepository
{
    public function findUserByEmail(string $email): ?User
    {
        return User::query()
            ->where('email', $email)
            ->first();
    }

    public function createUser(array $data): User
    {
        return User::create($data);
    }

    public function findMembership(
        string $tenantId,
        string $userId
    ): ?TenantUser {
        return TenantUser::query()
            ->where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->first();
    }

    public function createMembership(array $data): TenantUser
    {
        return TenantUser::create($data);
    }

    public function updateMembership(
        TenantUser $membership,
        array $data
    ): TenantUser {
        $membership->update($data);

        return $membership->fresh();
    }
}
