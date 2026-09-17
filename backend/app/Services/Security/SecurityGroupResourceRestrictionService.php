<?php

namespace App\Services\Security;

use App\Models\AuditEvent;
use App\Models\SecurityGroupResourceRestriction;
use App\Models\User;
use App\Repositories\SecurityGroupRepository;
use App\Repositories\SecurityGroupResourceRestrictionRepository;
use App\Services\Audit\AuditEventService;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SecurityGroupResourceRestrictionService
{
    public function __construct(
        private SecurityGroupResourceRestrictionRepository $restrictionRepository,
        private SecurityGroupRepository $securityGroupRepository,
        private AuditEventService $auditEventService
    ) {
    }

    public function getAll(
        string $tenantId,
        string $groupId
    ): Collection {
        $this->requireGroup(
            $tenantId,
            $groupId
        );

        return $this
            ->restrictionRepository
            ->allByGroup(
                $tenantId,
                $groupId
            );
    }

    public function getById(
        string $tenantId,
        string $groupId,
        string $restrictionId
    ): ?SecurityGroupResourceRestriction {
        $this->requireGroup(
            $tenantId,
            $groupId
        );

        $restriction = $this
            ->restrictionRepository
            ->findByTenantAndId(
                $tenantId,
                $restrictionId
            );

        if (
            !$restriction ||
            $restriction->security_group_id !== $groupId
        ) {
            return null;
        }

        return $restriction;
    }

    public function create(
        string $tenantId,
        string $groupId,
        User $actor,
        array $data,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): SecurityGroupResourceRestriction {
        $this->requireGroup(
            $tenantId,
            $groupId
        );

        $resourceType = $this
            ->normalizeResourceType(
                $data['resource_type']
            );

        $resourceId = trim(
            $data['resource_id']
        );

        $accessLevel = $this
            ->normalizeAccessLevel(
                $data['access_level'] ?? 'view'
            );

        if ($resourceId === '') {
            throw new DomainException(
                'Resource ID is required.'
            );
        }

        $existing = $this
            ->restrictionRepository
            ->findExisting(
                $tenantId,
                $groupId,
                $resourceType,
                $resourceId
            );

        if ($existing) {
            throw new DomainException(
                'This resource is already restricted for the security group.'
            );
        }

        return DB::transaction(function () use (
            $tenantId,
            $groupId,
            $actor,
            $resourceType,
            $resourceId,
            $accessLevel,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $restriction = $this
                ->restrictionRepository
                ->create([
                    'tenant_id' => $tenantId,
                    'security_group_id' => $groupId,
                    'resource_type' => $resourceType,
                    'resource_id' => $resourceId,
                    'access_level' => $accessLevel,
                    'created_by' => $actor->id,
                ]);

            $restriction = $this
                ->restrictionRepository
                ->findByTenantAndId(
                    $tenantId,
                    $restriction->id
                );

            if (!$restriction) {
                throw new DomainException(
                    'Resource restriction could not be retrieved.'
                );
            }

            $this
                ->auditEventService
                ->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_CREATED,
                    category: AuditEvent::CATEGORY_ACCESS,
                    targetType: 'security_group_resource_restriction',
                    targetId: (string) $restriction->id,
                    targetLabel: 'Resource Restriction',
                    description: 'Security group resource restriction was created.',
                    changes: [
                        'security_group_id' => [
                            'from' => null,
                            'to' => $groupId,
                        ],
                        'resource_type' => [
                            'from' => null,
                            'to' => $resourceType,
                        ],
                        'resource_id' => [
                            'from' => null,
                            'to' => $resourceId,
                        ],
                        'access_level' => [
                            'from' => null,
                            'to' => $accessLevel,
                        ],
                    ],
                    metadata: [
                        'security_group_id' => $groupId,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            return $restriction;
        });
    }

    public function update(
        string $tenantId,
        string $groupId,
        string $restrictionId,
        User $actor,
        array $data,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): SecurityGroupResourceRestriction {
        $this->requireGroup(
            $tenantId,
            $groupId
        );

        $restriction = $this
            ->restrictionRepository
            ->findByTenantAndId(
                $tenantId,
                $restrictionId
            );

        if (
            !$restriction ||
            $restriction->security_group_id !== $groupId
        ) {
            throw new DomainException(
                'Resource restriction not found.'
            );
        }

        $updateData = [];

        if (
            array_key_exists(
                'access_level',
                $data
            )
        ) {
            $updateData['access_level'] =
                $this->normalizeAccessLevel(
                    $data['access_level']
                );
        }

        if (empty($updateData)) {
            return $restriction;
        }

        $beforeAccessLevel =
            $restriction->access_level;

        $afterAccessLevel =
            $updateData['access_level'];

        if (
            $beforeAccessLevel ===
            $afterAccessLevel
        ) {
            return $restriction;
        }

        return DB::transaction(function () use (
            $restriction,
            $updateData,
            $tenantId,
            $groupId,
            $actor,
            $beforeAccessLevel,
            $afterAccessLevel,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $restriction = $this
                ->restrictionRepository
                ->update(
                    $restriction,
                    $updateData
                );

            $this
                ->auditEventService
                ->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_UPDATED,
                    category: AuditEvent::CATEGORY_ACCESS,
                    targetType: 'security_group_resource_restriction',
                    targetId: (string) $restriction->id,
                    targetLabel: 'Resource Restriction',
                    description: 'Security group resource restriction was updated.',
                    changes: [
                        'access_level' => [
                            'from' => $beforeAccessLevel,
                            'to' => $afterAccessLevel,
                        ],
                    ],
                    metadata: [
                        'security_group_id' =>
                            $groupId,

                        'resource_type' =>
                            $restriction->resource_type,

                        'resource_id' =>
                            $restriction->resource_id,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            return $restriction;
        });
    }

    public function delete(
        string $tenantId,
        string $groupId,
        string $restrictionId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): void {
        $this->requireGroup(
            $tenantId,
            $groupId
        );

        $restriction = $this
            ->restrictionRepository
            ->findByTenantAndId(
                $tenantId,
                $restrictionId
            );

        if (
            !$restriction ||
            $restriction->security_group_id !== $groupId
        ) {
            throw new DomainException(
                'Resource restriction not found.'
            );
        }

        $snapshot = [
            'security_group_id' =>
                $restriction->security_group_id,

            'resource_type' =>
                $restriction->resource_type,

            'resource_id' =>
                $restriction->resource_id,

            'access_level' =>
                $restriction->access_level,
        ];

        DB::transaction(function () use (
            $restriction,
            $tenantId,
            $groupId,
            $actor,
            $snapshot,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $restrictionId =
                (string) $restriction->id;

            $this
                ->restrictionRepository
                ->delete(
                    $restriction
                );

            $this
                ->auditEventService
                ->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_DELETED,
                    category: AuditEvent::CATEGORY_ACCESS,
                    targetType: 'security_group_resource_restriction',
                    targetId: $restrictionId,
                    targetLabel: 'Resource Restriction',
                    description: 'Security group resource restriction was deleted.',
                    changes: [
                        'deleted' => [
                            'from' => false,
                            'to' => true,
                        ],
                    ],
                    metadata: [
                        'security_group_id' =>
                            $groupId,

                        'snapshot' =>
                            $snapshot,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );
        });
    }

    private function requireGroup(
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
    }

    private function normalizeResourceType(
        string $resourceType
    ): string {
        $resourceType = strtolower(
            trim($resourceType)
        );

        $allowedTypes = config(
            'resource_restrictions.types',
            []
        );

        if (
            !in_array(
                $resourceType,
                $allowedTypes,
                true
            )
        ) {
            throw new DomainException(
                'Unsupported resource type.'
            );
        }

        return $resourceType;
    }

    private function normalizeAccessLevel(
        string $accessLevel
    ): string {
        $accessLevel = strtolower(
            trim($accessLevel)
        );

        $allowedLevels = config(
            'resource_restrictions.access_levels',
            []
        );

        if (
            !in_array(
                $accessLevel,
                $allowedLevels,
                true
            )
        ) {
            throw new DomainException(
                'Invalid resource access level.'
            );
        }

        return $accessLevel;
    }
}
