<?php

namespace App\Repositories;

use App\Models\SecurityGroup;
use App\Models\SecurityGroupUser;
use App\Models\TenantUser;
use Illuminate\Database\Eloquent\Collection;

class SecurityGroupRepository
{
    public function allByTenant(
        string $tenantId
    ): Collection {
        return SecurityGroup::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'creator:id,name,email',
                'users:id,name,email,status',
            ])
            ->withCount('users')
            ->orderBy('name')
            ->get();
    }

    public function findByTenantAndId(
        string $tenantId,
        string $groupId
    ): ?SecurityGroup {
        return SecurityGroup::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $groupId)
            ->with([
                'creator:id,name,email',
                'users:id,name,email,status',
            ])
            ->withCount('users')
            ->first();
    }

    public function findArchivedByTenantAndId(
        string $tenantId,
        string $groupId
    ): ?SecurityGroup {
        return SecurityGroup::onlyTrashed()
            ->where('tenant_id', $tenantId)
            ->where('id', $groupId)
            ->with([
                'creator:id,name,email',
                'users:id,name,email,status',
            ])
            ->withCount('users')
            ->first();
    }

    public function findWithArchivedByTenantAndId(
        string $tenantId,
        string $groupId
    ): ?SecurityGroup {
        return SecurityGroup::withTrashed()
            ->where('tenant_id', $tenantId)
            ->where('id', $groupId)
            ->with([
                'creator:id,name,email',
                'users:id,name,email,status',
            ])
            ->withCount('users')
            ->first();
    }

    public function findByTenantAndName(
        string $tenantId,
        string $name
    ): ?SecurityGroup {
        return SecurityGroup::query()
            ->where('tenant_id', $tenantId)
            ->where('name', $name)
            ->first();
    }

    public function create(
        array $data
    ): SecurityGroup {
        return SecurityGroup::create(
            $data
        );
    }

    public function update(
        SecurityGroup $group,
        array $data
    ): SecurityGroup {
        $group->fill($data);
        $group->save();

        return $group->fresh([
            'creator:id,name,email',
            'users:id,name,email,status',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Archive / Soft Delete
    |--------------------------------------------------------------------------
    */

    public function delete(
        SecurityGroup $group
    ): bool {
        return (bool) $group->delete();
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Archived Group
    |--------------------------------------------------------------------------
    */

    public function restore(
        SecurityGroup $group
    ): bool {
        return (bool) $group->restore();
    }

    /*
    |--------------------------------------------------------------------------
    | Permanent Delete
    |--------------------------------------------------------------------------
    */

    public function forceDelete(
        SecurityGroup $group
    ): bool {
        return (bool) $group->forceDelete();
    }

    public function findActiveTenantMembership(
        string $tenantId,
        string $userId
    ): ?TenantUser {
        return TenantUser::query()
            ->where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->where(
                'status',
                TenantUser::STATUS_ACTIVE
            )
            ->with([
                'user:id,name,email,status',
            ])
            ->first();
    }

    public function findGroupMembership(
        string $tenantId,
        string $groupId,
        string $userId
    ): ?SecurityGroupUser {
        return SecurityGroupUser::query()
            ->where('tenant_id', $tenantId)
            ->where(
                'security_group_id',
                $groupId
            )
            ->where('user_id', $userId)
            ->first();
    }

    public function addUser(
        string $tenantId,
        string $groupId,
        string $userId
    ): SecurityGroupUser {
        return SecurityGroupUser::create([
            'tenant_id' => $tenantId,

            'security_group_id' =>
                $groupId,

            'user_id' =>
                $userId,
        ]);
    }

    public function removeUser(
        string $tenantId,
        string $groupId,
        string $userId
    ): int {
        return SecurityGroupUser::query()
            ->where('tenant_id', $tenantId)
            ->where(
                'security_group_id',
                $groupId
            )
            ->where('user_id', $userId)
            ->delete();
    }

    public function groupHasUsers(
        string $tenantId,
        string $groupId
    ): bool {
        return SecurityGroupUser::query()
            ->where('tenant_id', $tenantId)
            ->where(
                'security_group_id',
                $groupId
            )
            ->exists();
    }

    public function usersByGroup(
        string $tenantId,
        string $groupId
    ): Collection {
        return SecurityGroupUser::query()
            ->where('tenant_id', $tenantId)
            ->where(
                'security_group_id',
                $groupId
            )
            ->with([
                'user:id,name,email,status',
            ])
            ->get();
    }
}