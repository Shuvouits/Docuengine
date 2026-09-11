<?php

namespace App\Services\Security;

use App\Repositories\TenantRoleRepository;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class TenantRoleService
{
    public function __construct(
        private TenantRoleRepository $tenantRoleRepository
    ) {
    }

    public function getAll(
        string $tenantId
    ): Collection {
        $this->setTenantContext($tenantId);

        return $this
            ->tenantRoleRepository
            ->allByTenant($tenantId);
    }

    public function getById(
        string $tenantId,
        int $roleId
    ): ?Role {
        $this->setTenantContext($tenantId);

        return $this
            ->tenantRoleRepository
            ->findByTenantAndId(
                $tenantId,
                $roleId
            );
    }

    public function getPermissions(): Collection
    {
        return $this
            ->tenantRoleRepository
            ->allPermissions();
    }

    public function create(
        string $tenantId,
        array $data
    ): Role {
        $this->setTenantContext($tenantId);

        $name = trim($data['name']);

        if ($name === '') {
            throw new DomainException(
                'Role name is required.'
            );
        }

        $existingRole = $this
            ->tenantRoleRepository
            ->findByTenantAndName(
                $tenantId,
                $name
            );

        if ($existingRole) {
            throw new DomainException(
                'A role with this name already exists.'
            );
        }

        $permissions = $this
            ->resolvePermissions(
                $data['permissions'] ?? []
            );

        return DB::transaction(function () use (
            $tenantId,
            $name,
            $permissions
        ) {
            $role = $this
                ->tenantRoleRepository
                ->create(
                    $tenantId,
                    [
                        'name' => $name,
                    ]
                );

            $role->syncPermissions(
                $permissions
            );

            app(PermissionRegistrar::class)
                ->forgetCachedPermissions();

            return $this
                ->tenantRoleRepository
                ->findByTenantAndId(
                    $tenantId,
                    $role->id
                );
        });
    }

    public function update(
        string $tenantId,
        int $roleId,
        array $data
    ): Role {
        $this->setTenantContext($tenantId);

        $role = $this
            ->tenantRoleRepository
            ->findByTenantAndId(
                $tenantId,
                $roleId
            );

        if (!$role) {
            throw new DomainException(
                'Tenant role not found.'
            );
        }

        if ($this->isSystemRole($role)) {
            throw new DomainException(
                'System roles cannot be modified.'
            );
        }

        $name = trim(
            $data['name'] ?? $role->name
        );

        if ($name === '') {
            throw new DomainException(
                'Role name is required.'
            );
        }

        $existingRole = $this
            ->tenantRoleRepository
            ->findByTenantAndName(
                $tenantId,
                $name
            );

        if (
            $existingRole &&
            $existingRole->id !== $role->id
        ) {
            throw new DomainException(
                'A role with this name already exists.'
            );
        }

        $permissions = null;

        if (array_key_exists('permissions', $data)) {
            $permissions = $this
                ->resolvePermissions(
                    $data['permissions']
                );
        }

        return DB::transaction(function () use (
            $tenantId,
            $role,
            $name,
            $permissions
        ) {
            $role = $this
                ->tenantRoleRepository
                ->update(
                    $role,
                    [
                        'name' => $name,
                    ]
                );

            if ($permissions !== null) {
                $role->syncPermissions(
                    $permissions
                );
            }

            app(PermissionRegistrar::class)
                ->forgetCachedPermissions();

            return $this
                ->tenantRoleRepository
                ->findByTenantAndId(
                    $tenantId,
                    $role->id
                );
        });
    }

    public function delete(
        string $tenantId,
        int $roleId
    ): void {
        $this->setTenantContext($tenantId);

        $role = $this
            ->tenantRoleRepository
            ->findByTenantAndId(
                $tenantId,
                $roleId
            );

        if (!$role) {
            throw new DomainException(
                'Tenant role not found.'
            );
        }

        if ($this->isSystemRole($role)) {
            throw new DomainException(
                'System roles cannot be deleted.'
            );
        }

        if (
            $this
                ->tenantRoleRepository
                ->roleHasUsers($role)
        ) {
            throw new DomainException(
                'This role cannot be deleted because it is assigned to one or more users.'
            );
        }

        if (
            $this
                ->tenantRoleRepository
                ->roleHasInvitations($role)
        ) {
            throw new DomainException(
                'This role cannot be deleted because it is referenced by an invitation.'
            );
        }

        DB::transaction(function () use (
            $role
        ) {
            $this
                ->tenantRoleRepository
                ->delete($role);

            app(PermissionRegistrar::class)
                ->forgetCachedPermissions();
        });
    }

    private function resolvePermissions(
        array $permissionNames
    ): Collection {
        $permissionNames = collect(
            $permissionNames
        )
            ->map(
                fn ($permission) =>
                    trim((string) $permission)
            )
            ->filter()
            ->unique()
            ->values()
            ->all();

        $permissions = $this
            ->tenantRoleRepository
            ->findPermissionsByNames(
                $permissionNames
            );

        if (
            $permissions->count() !==
            count($permissionNames)
        ) {
            $foundNames = $permissions
                ->pluck('name')
                ->all();

            $missingPermissions = array_values(
                array_diff(
                    $permissionNames,
                    $foundNames
                )
            );

            throw new DomainException(
                'Invalid permissions: ' .
                implode(', ', $missingPermissions)
            );
        }

        return $permissions;
    }

    private function isSystemRole(
        Role $role
    ): bool {
        return in_array(
            $role->name,
            $this->systemRoleNames(),
            true
        );
    }

    private function systemRoleNames(): array
    {
        return config(
            'rbac.protected_roles',
            [
                'MSP Admin',
                'Editor',
                'Author',
                'Read-only Technician',
                'Portal Member',
            ]
        );
    }

    private function setTenantContext(
        string $tenantId
    ): void {
        app(PermissionRegistrar::class)
            ->setPermissionsTeamId(
                $tenantId
            );
    }
}
