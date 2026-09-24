<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class TenantRoleRepository
{
    public function allByTenant(
        string $tenantId
    ): Collection {
        return Role::query()
            ->with([
                'permissions:id,name,guard_name',
            ])
            ->where('tenant_id', $tenantId)
            ->where('guard_name', 'api')
            ->orderBy('name')
            ->get();
    }

    public function findByTenantAndId(
        string $tenantId,
        int $roleId
    ): ?Role {
        return Role::query()
            ->with([
                'permissions:id,name,guard_name',
            ])
            ->where('tenant_id', $tenantId)
            ->where('guard_name', 'api')
            ->where('id', $roleId)
            ->first();
    }

    public function findByTenantAndName(
        string $tenantId,
        string $name
    ): ?Role {
        return Role::query()
            ->where('tenant_id', $tenantId)
            ->where('guard_name', 'api')
            ->where('name', $name)
            ->first();
    }

    public function allPermissions(): Collection
    {
        return Permission::query()
            ->where('guard_name', 'api')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'guard_name',
            ]);
    }

    public function findPermissionsByNames(
        array $permissionNames
    ): Collection {
        return Permission::query()
            ->where('guard_name', 'api')
            ->whereIn('name', $permissionNames)
            ->get();
    }

    public function create(
        string $tenantId,
        array $data
    ): Role {
        return Role::create([
            'tenant_id' => $tenantId,
            'name' => $data['name'],
            'guard_name' => 'api',
        ]);
    }

    public function update(
        Role $role,
        array $data
    ): Role {
        $role->fill($data);
        $role->save();

        return $role->fresh([
            'permissions:id,name,guard_name',
        ]);
    }

    public function delete(
        Role $role
    ): bool {
        return (bool) $role->delete();
    }

    public function roleHasUsers(
        Role $role
    ): bool {
        return $role
            ->users()
            ->exists();
    }

  


}
