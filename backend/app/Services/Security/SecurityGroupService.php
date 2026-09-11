<?php

namespace App\Services\Security;

use App\Models\SecurityGroup;
use App\Repositories\SecurityGroupRepository;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SecurityGroupService
{
    public function __construct(
        private SecurityGroupRepository $securityGroupRepository
    ) {
    }

    public function getAll(
        string $tenantId
    ): Collection {
        return $this
            ->securityGroupRepository
            ->allByTenant($tenantId);
    }

    public function getById(
        string $tenantId,
        string $groupId
    ): ?SecurityGroup {
        return $this
            ->securityGroupRepository
            ->findByTenantAndId(
                $tenantId,
                $groupId
            );
    }

    public function getUsers(
        string $tenantId,
        string $groupId
    ): Collection {
        $group = $this
            ->securityGroupRepository
            ->findByTenantAndId(
                $tenantId,
                $groupId
            );

        if (!$group) {
            throw new DomainException(
                'Security group not found.'
            );
        }

        return $this
            ->securityGroupRepository
            ->usersByGroup(
                $tenantId,
                $groupId
            );
    }

    public function create(
        string $tenantId,
        string $createdBy,
        array $data
    ): SecurityGroup {
        $name = trim(
            $data['name']
        );

        if ($name === '') {
            throw new DomainException(
                'Security group name is required.'
            );
        }

        $existingGroup = $this
            ->securityGroupRepository
            ->findByTenantAndName(
                $tenantId,
                $name
            );

        if ($existingGroup) {
            throw new DomainException(
                'A security group with this name already exists.'
            );
        }

        return DB::transaction(function () use (
            $tenantId,
            $createdBy,
            $name,
            $data
        ) {
            $group = $this
                ->securityGroupRepository
                ->create([
                    'tenant_id' => $tenantId,

                    'name' => $name,

                    'description' =>
                        $data['description'] ?? null,

                    'is_system' => false,

                    'created_by' => $createdBy,
                ]);

            return $this
                ->securityGroupRepository
                ->findByTenantAndId(
                    $tenantId,
                    $group->id
                );
        });
    }

    public function update(
        string $tenantId,
        string $groupId,
        array $data
    ): SecurityGroup {
        $group = $this
            ->securityGroupRepository
            ->findByTenantAndId(
                $tenantId,
                $groupId
            );

        if (!$group) {
            throw new DomainException(
                'Security group not found.'
            );
        }

        if ($group->isSystem()) {
            throw new DomainException(
                'System security groups cannot be modified.'
            );
        }

        $name = array_key_exists(
            'name',
            $data
        )
            ? trim($data['name'])
            : $group->name;

        if ($name === '') {
            throw new DomainException(
                'Security group name is required.'
            );
        }

        $existingGroup = $this
            ->securityGroupRepository
            ->findByTenantAndName(
                $tenantId,
                $name
            );

        if (
            $existingGroup &&
            $existingGroup->id !== $group->id
        ) {
            throw new DomainException(
                'A security group with this name already exists.'
            );
        }

        return DB::transaction(function () use (
            $tenantId,
            $group,
            $name,
            $data
        ) {
            $updateData = [
                'name' => $name,
            ];

            if (
                array_key_exists(
                    'description',
                    $data
                )
            ) {
                $updateData['description'] =
                    $data['description'];
            }

            $this
                ->securityGroupRepository
                ->update(
                    $group,
                    $updateData
                );

            return $this
                ->securityGroupRepository
                ->findByTenantAndId(
                    $tenantId,
                    $group->id
                );
        });
    }

    public function delete(
        string $tenantId,
        string $groupId
    ): void {
        $group = $this
            ->securityGroupRepository
            ->findByTenantAndId(
                $tenantId,
                $groupId
            );

        if (!$group) {
            throw new DomainException(
                'Security group not found.'
            );
        }

        if ($group->isSystem()) {
            throw new DomainException(
                'System security groups cannot be deleted.'
            );
        }

        if (
            $this
                ->securityGroupRepository
                ->groupHasUsers(
                    $tenantId,
                    $groupId
                )
        ) {
            throw new DomainException(
                'This security group cannot be deleted because it has assigned users.'
            );
        }

        DB::transaction(function () use (
            $group
        ) {
            $this
                ->securityGroupRepository
                ->delete($group);
        });
    }

    public function addUser(
        string $tenantId,
        string $groupId,
        string $userId
    ): SecurityGroup {
        $group = $this
            ->securityGroupRepository
            ->findByTenantAndId(
                $tenantId,
                $groupId
            );

        if (!$group) {
            throw new DomainException(
                'Security group not found.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | User Must Be Active Member Of Same Tenant
        |--------------------------------------------------------------------------
        */

        $membership = $this
            ->securityGroupRepository
            ->findActiveTenantMembership(
                $tenantId,
                $userId
            );

        if (!$membership) {
            throw new DomainException(
                'The selected user is not an active member of this tenant.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Duplicate Membership Protection
        |--------------------------------------------------------------------------
        */

        $existingMembership = $this
            ->securityGroupRepository
            ->findGroupMembership(
                $tenantId,
                $groupId,
                $userId
            );

        if ($existingMembership) {
            throw new DomainException(
                'This user is already assigned to the security group.'
            );
        }

        DB::transaction(function () use (
            $tenantId,
            $groupId,
            $userId
        ) {
            $this
                ->securityGroupRepository
                ->addUser(
                    $tenantId,
                    $groupId,
                    $userId
                );
        });

        return $this
            ->securityGroupRepository
            ->findByTenantAndId(
                $tenantId,
                $groupId
            );
    }

    public function removeUser(
        string $tenantId,
        string $groupId,
        string $userId
    ): SecurityGroup {
        $group = $this
            ->securityGroupRepository
            ->findByTenantAndId(
                $tenantId,
                $groupId
            );

        if (!$group) {
            throw new DomainException(
                'Security group not found.'
            );
        }

        $membership = $this
            ->securityGroupRepository
            ->findGroupMembership(
                $tenantId,
                $groupId,
                $userId
            );

        if (!$membership) {
            throw new DomainException(
                'This user is not assigned to the security group.'
            );
        }

        DB::transaction(function () use (
            $tenantId,
            $groupId,
            $userId
        ) {
            $this
                ->securityGroupRepository
                ->removeUser(
                    $tenantId,
                    $groupId,
                    $userId
                );
        });

        return $this
            ->securityGroupRepository
            ->findByTenantAndId(
                $tenantId,
                $groupId
            );
    }
}
