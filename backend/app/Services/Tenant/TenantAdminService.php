<?php

namespace App\Services\Tenant;

use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Repositories\TenantAdminRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TenantAdminService
{
    public function __construct(
        protected TenantAdminRepository $tenantAdminRepository
    ) {
    }

    public function assignAdmin(
        Tenant $tenant,
        array $data
    ): array {
        return DB::transaction(function () use ($tenant, $data) {
            $user = $this->tenantAdminRepository
                ->findUserByEmail($data['email']);

            if (!$user) {
                $user = $this->createNewUser($data);
            } else {
                $this->validateExistingUser($user);
            }

            $membership = $this->tenantAdminRepository
                ->findMembership(
                    $tenant->id,
                    $user->id
                );

            if ($membership) {
                $membership = $this->promoteMembership(
                    $membership
                );
            } else {
                $membership = $this->createMembership(
                    $tenant,
                    $user
                );
            }

            return [
                'user' => $user->fresh(),
                'membership' => $membership,
            ];
        });
    }

    protected function createNewUser(array $data): User
    {
        if (empty($data['password'])) {
            throw ValidationException::withMessages([
                'password' => [
                    'Password is required when creating a new tenant administrator.',
                ],
            ]);
        }

        return $this->tenantAdminRepository->createUser([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'is_platform_owner' => false,
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);
    }

    protected function validateExistingUser(User $user): void
    {
        if ($user->isPlatformOwner()) {
            throw ValidationException::withMessages([
                'email' => [
                    'A platform owner cannot be assigned as a tenant administrator.',
                ],
            ]);
        }

        if (!$user->isActive()) {
            throw ValidationException::withMessages([
                'email' => [
                    'This user account is not active.',
                ],
            ]);
        }
    }

    protected function createMembership(
        Tenant $tenant,
        User $user
    ): TenantUser {
        return $this->tenantAdminRepository
            ->createMembership([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'role' => 'admin',
                'status' => TenantUser::STATUS_ACTIVE,
                'joined_at' => now(),
            ]);
    }

    protected function promoteMembership(
        TenantUser $membership
    ): TenantUser {
        return $this->tenantAdminRepository
            ->updateMembership(
                $membership,
                [
                    'role' => 'admin',
                    'status' => TenantUser::STATUS_ACTIVE,
                    'joined_at' => $membership->joined_at ?? now(),
                ]
            );
    }
}
