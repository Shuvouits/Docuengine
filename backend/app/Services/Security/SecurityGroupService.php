<?php

namespace App\Services\Security;

use App\Models\AuditEvent;
use App\Models\SecurityGroup;
use App\Models\User;
use App\Repositories\SecurityGroupRepository;
use App\Services\Archive\ArchiveService;
use App\Services\Audit\AuditEventService;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SecurityGroupService
{
    public function __construct(
        private SecurityGroupRepository $securityGroupRepository,
        private ArchiveService $archiveService,
        private AuditEventService $auditEventService
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
        array $data,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
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
            $data,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
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

            $createdGroup = $this
                ->securityGroupRepository
                ->findByTenantAndId(
                    $tenantId,
                    $group->id
                );

            if (!$createdGroup) {
                throw new DomainException(
                    'Security group was created but could not be reloaded.'
                );
            }

            if ($actor) {
                $this
                    ->auditEventService
                    ->record(
                        tenantId: $tenantId,
                        actor: $actor,
                        action: AuditEvent::ACTION_CREATED,
                        category: AuditEvent::CATEGORY_ACCESS,
                        targetType: 'security_group',
                        targetId: $createdGroup->id,
                        targetLabel: $createdGroup->name,
                        description: 'Security group was created.',
                        changes: null,
                        metadata: [
                            'description' =>
                                $createdGroup->description,
                            'is_system' =>
                                $createdGroup->is_system,
                        ],
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );
            }

            return $createdGroup;
        });
    }

    public function update(
        string $tenantId,
        string $groupId,
        array $data,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
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

        $oldName = $group->name;
        $oldDescription = $group->description;

        return DB::transaction(function () use (
            $tenantId,
            $group,
            $name,
            $data,
            $oldName,
            $oldDescription,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
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

            $updatedGroup = $this
                ->securityGroupRepository
                ->findByTenantAndId(
                    $tenantId,
                    $group->id
                );

            if (!$updatedGroup) {
                throw new DomainException(
                    'Security group was updated but could not be reloaded.'
                );
            }

            $changes = [];

            if (
                $oldName !==
                $updatedGroup->name
            ) {
                $changes['name'] = [
                    'from' => $oldName,
                    'to' => $updatedGroup->name,
                ];
            }

            if (
                $oldDescription !==
                $updatedGroup->description
            ) {
                $changes['description'] = [
                    'from' => $oldDescription,
                    'to' => $updatedGroup->description,
                ];
            }

            if (
                $actor &&
                !empty($changes)
            ) {
                $this
                    ->auditEventService
                    ->record(
                        tenantId: $tenantId,
                        actor: $actor,
                        action: AuditEvent::ACTION_UPDATED,
                        category: AuditEvent::CATEGORY_ACCESS,
                        targetType: 'security_group',
                        targetId: $updatedGroup->id,
                        targetLabel: $updatedGroup->name,
                        description: 'Security group was updated.',
                        changes: $changes,
                        metadata: null,
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );
            }

            return $updatedGroup;
        });
    }

    public function delete(
        string $tenantId,
        string $groupId,
        User $actor,
        ?string $reason = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
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
                'System security groups cannot be archived.'
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
                'This security group cannot be archived because it has assigned users.'
            );
        }

        DB::transaction(function () use (
            $tenantId,
            $group,
            $actor,
            $reason,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $deleted = $this
                ->securityGroupRepository
                ->delete($group);

            if (!$deleted) {
                throw new DomainException(
                    'Unable to archive the security group.'
                );
            }

            $this
                ->archiveService
                ->registerArchivedResource(
                    tenantId: $tenantId,
                    resourceType: 'security_group',
                    resourceId: $group->id,
                    resourceLabel: $group->name,
                    actor: $actor,
                    reason: $reason,
                    metadata: [
                        'description' =>
                            $group->description,
                        'is_system' =>
                            $group->is_system,
                        'created_by' =>
                            $group->created_by,
                        'created_at' =>
                            $group->created_at?->toISOString(),
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );
        });
    }

    public function addUser(
        string $tenantId,
        string $groupId,
        string $userId,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
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
            ->findActiveTenantMembership(
                $tenantId,
                $userId
            );

        if (!$membership) {
            throw new DomainException(
                'The selected user is not an active member of this tenant.'
            );
        }

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

        return DB::transaction(function () use (
            $tenantId,
            $groupId,
            $userId,
            $group,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $this
                ->securityGroupRepository
                ->addUser(
                    $tenantId,
                    $groupId,
                    $userId
                );

            if ($actor) {
                $this
                    ->auditEventService
                    ->record(
                        tenantId: $tenantId,
                        actor: $actor,
                        action: AuditEvent::ACTION_UPDATED,
                        category: AuditEvent::CATEGORY_ACCESS,
                        targetType: 'security_group',
                        targetId: $group->id,
                        targetLabel: $group->name,
                        description: 'User was added to the security group.',
                        changes: [
                            'member_user_id' => [
                                'from' => null,
                                'to' => $userId,
                            ],
                        ],
                        metadata: [
                            'user_id' => $userId,
                            'membership_action' => 'added',
                        ],
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );
            }

            $updatedGroup = $this
                ->securityGroupRepository
                ->findByTenantAndId(
                    $tenantId,
                    $groupId
                );

            if (!$updatedGroup) {
                throw new DomainException(
                    'Security group could not be reloaded.'
                );
            }

            return $updatedGroup;
        });
    }

    public function removeUser(
        string $tenantId,
        string $groupId,
        string $userId,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
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

        return DB::transaction(function () use (
            $tenantId,
            $groupId,
            $userId,
            $group,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $this
                ->securityGroupRepository
                ->removeUser(
                    $tenantId,
                    $groupId,
                    $userId
                );

            if ($actor) {
                $this
                    ->auditEventService
                    ->record(
                        tenantId: $tenantId,
                        actor: $actor,
                        action: AuditEvent::ACTION_UPDATED,
                        category: AuditEvent::CATEGORY_ACCESS,
                        targetType: 'security_group',
                        targetId: $group->id,
                        targetLabel: $group->name,
                        description: 'User was removed from the security group.',
                        changes: [
                            'member_user_id' => [
                                'from' => $userId,
                                'to' => null,
                            ],
                        ],
                        metadata: [
                            'user_id' => $userId,
                            'membership_action' => 'removed',
                        ],
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );
            }

            $updatedGroup = $this
                ->securityGroupRepository
                ->findByTenantAndId(
                    $tenantId,
                    $groupId
                );

            if (!$updatedGroup) {
                throw new DomainException(
                    'Security group could not be reloaded.'
                );
            }

            return $updatedGroup;
        });
    }

    public function restore(
        string $tenantId,
        string $groupId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): SecurityGroup {
        $group = $this
            ->securityGroupRepository
            ->findArchivedByTenantAndId(
                $tenantId,
                $groupId
            );

        if (!$group) {
            throw new DomainException(
                'Archived security group not found.'
            );
        }

        $archiveEntry = $this
            ->archiveService
            ->getArchivedByResource(
                $tenantId,
                'security_group',
                $groupId
            );

        return DB::transaction(function () use (
            $tenantId,
            $groupId,
            $group,
            $archiveEntry,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $restored = $this
                ->securityGroupRepository
                ->restore($group);

            if (!$restored) {
                throw new DomainException(
                    'Unable to restore the security group.'
                );
            }

            $this
                ->archiveService
                ->markRestored(
                    tenantId: $tenantId,
                    archiveEntryId: $archiveEntry->id,
                    actor: $actor,
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            $restoredGroup = $this
                ->securityGroupRepository
                ->findByTenantAndId(
                    $tenantId,
                    $groupId
                );

            if (!$restoredGroup) {
                throw new DomainException(
                    'Security group was restored but could not be reloaded.'
                );
            }

            return $restoredGroup;
        });
    }

    public function permanentlyDelete(
        string $tenantId,
        string $groupId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): void {
        $group = $this
            ->securityGroupRepository
            ->findArchivedByTenantAndId(
                $tenantId,
                $groupId
            );

        if (!$group) {
            throw new DomainException(
                'Archived security group not found.'
            );
        }

        $archiveEntry = $this
            ->archiveService
            ->getArchivedByResource(
                $tenantId,
                'security_group',
                $groupId
            );

        DB::transaction(function () use (
            $tenantId,
            $group,
            $archiveEntry,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $deleted = $this
                ->securityGroupRepository
                ->forceDelete($group);

            if (!$deleted) {
                throw new DomainException(
                    'Unable to permanently delete the security group.'
                );
            }

            $this
                ->archiveService
                ->markPermanentlyDeleted(
                    tenantId: $tenantId,
                    archiveEntryId: $archiveEntry->id,
                    actor: $actor,
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );
        });
    }
}