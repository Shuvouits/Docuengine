<?php

namespace App\Services\Security;

use App\Models\Tenant;
use App\Models\TenantUser;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class TenantRbacService
{
    protected string $guardName = 'api';

    /*
    |--------------------------------------------------------------------------
    | Sync RBAC For Tenant
    |--------------------------------------------------------------------------
    */

    public function syncTenant(Tenant $tenant): void
    {
        $permissionRegistrar =
            app(PermissionRegistrar::class);

        /*
        |--------------------------------------------------------------------------
        | Set Current Tenant Context
        |--------------------------------------------------------------------------
        */

        $permissionRegistrar
            ->setPermissionsTeamId($tenant->id);

        try {
            /*
            |--------------------------------------------------------------------------
            | Global Permissions
            |--------------------------------------------------------------------------
            */

            $permissions =
                $this->syncPermissions();

            /*
            |--------------------------------------------------------------------------
            | Tenant Roles
            |--------------------------------------------------------------------------
            */

            $this->syncRoles(
                $tenant,
                $permissions
            );

            /*
            |--------------------------------------------------------------------------
            | Bridge Existing Module 1 Tenant Admins
            |--------------------------------------------------------------------------
            */

            $this->syncLegacyTenantAdmins(
                $tenant
            );

            /*
            |--------------------------------------------------------------------------
            | Clear Permission Cache
            |--------------------------------------------------------------------------
            */

            $permissionRegistrar
                ->forgetCachedPermissions();
        } finally {
            /*
            |--------------------------------------------------------------------------
            | Reset Tenant Context
            |--------------------------------------------------------------------------
            */

            $permissionRegistrar
                ->setPermissionsTeamId(null);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Sync Global Permissions
    |--------------------------------------------------------------------------
    */

    protected function syncPermissions()
    {
        $permissionNames =
            config(
                'rbac.permissions',
                []
            );

        return collect(
            $permissionNames
        )
            ->mapWithKeys(
                function (
                    string $permissionName
                ) {
                    $permission =
                        Permission::query()
                            ->firstOrCreate([
                                'name' =>
                                    $permissionName,

                                'guard_name' =>
                                    $this
                                        ->guardName,
                            ]);

                    return [
                        $permissionName =>
                            $permission,
                    ];
                }
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Sync Tenant Roles
    |--------------------------------------------------------------------------
    */

    protected function syncRoles(
        Tenant $tenant,
        $permissions
    ): void {
        $roleDefinitions =
            config(
                'rbac.roles',
                []
            );

        foreach (
            $roleDefinitions
            as $roleDefinition
        ) {
            $roleName =
                $roleDefinition[
                    'name'
                ];

            $role =
                Role::query()
                    ->where(
                        'tenant_id',
                        $tenant->id
                    )
                    ->where(
                        'name',
                        $roleName
                    )
                    ->where(
                        'guard_name',
                        $this->guardName
                    )
                    ->first();

            if (!$role) {
                $role =
                    Role::create([
                        'tenant_id' =>
                            $tenant->id,

                        'name' =>
                            $roleName,

                        'guard_name' =>
                            $this
                                ->guardName,
                    ]);
            }

            $rolePermissions =
                $roleDefinition[
                    'permissions'
                ] ?? [];

            /*
            |--------------------------------------------------------------------------
            | MSP Admin Gets Every Registered Permission
            |--------------------------------------------------------------------------
            */

            if (
                $rolePermissions === '*'
            ) {
                $role->syncPermissions(
                    $permissions
                        ->values()
                        ->all()
                );

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Other Roles
            |--------------------------------------------------------------------------
            */

            $permissionsForRole =
                collect(
                    $rolePermissions
                )
                    ->map(
                        fn (
                            string $permissionName
                        ) =>
                            $permissions->get(
                                $permissionName
                            )
                    )
                    ->filter()
                    ->values()
                    ->all();

            $role->syncPermissions(
                $permissionsForRole
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Sync Existing Tenant Admins
    |--------------------------------------------------------------------------
    |
    | Module 1 currently uses:
    |
    | tenant_users.role = admin
    |
    | We preserve that field for backward compatibility while also assigning
    | the new Spatie MSP Admin role.
    |
    */

    protected function syncLegacyTenantAdmins(
        Tenant $tenant
    ): void {
        $memberships =
            TenantUser::query()
                ->with('user')
                ->where(
                    'tenant_id',
                    $tenant->id
                )
                ->where(
                    'role',
                    'admin'
                )
                ->where(
                    'status',
                    TenantUser::STATUS_ACTIVE
                )
                ->get();

        foreach (
            $memberships
            as $membership
        ) {
            $user =
                $membership->user;

            if (!$user) {
                continue;
            }

            if (!$user->isActive()) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Make Sure Cached Relations Are Tenant-Safe
            |--------------------------------------------------------------------------
            */

            $user->unsetRelation(
                'roles'
            );

            $user->unsetRelation(
                'permissions'
            );

            if (
                !$user->hasRole(
                    'MSP Admin'
                )
            ) {
                $user->assignRole(
                    'MSP Admin'
                );
            }
        }
    }
}
