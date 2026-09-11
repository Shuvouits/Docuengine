
<?php


namespace App\Services\Security;

use App\Models\SecurityGroupResourceRestriction;
use App\Repositories\SecurityGroupRepository;
use App\Repositories\SecurityGroupResourceRestrictionRepository;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SecurityGroupResourceRestrictionService
{
    public function __construct(
        private SecurityGroupResourceRestrictionRepository $restrictionRepository,
        private SecurityGroupRepository $securityGroupRepository
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
        string $createdBy,
        array $data
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
            $createdBy,
            $resourceType,
            $resourceId,
            $accessLevel
        ) {
            $restriction = $this
                ->restrictionRepository
                ->create([
                    'tenant_id' => $tenantId,

                    'security_group_id' =>
                        $groupId,

                    'resource_type' =>
                        $resourceType,

                    'resource_id' =>
                        $resourceId,

                    'access_level' =>
                        $accessLevel,

                    'created_by' =>
                        $createdBy,
                ]);

            return $this
                ->restrictionRepository
                ->findByTenantAndId(
                    $tenantId,
                    $restriction->id
                );
        });
    }

    public function update(
        string $tenantId,
        string $groupId,
        string $restrictionId,
        array $data
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

        return DB::transaction(function () use (
            $restriction,
            $updateData
        ) {
            return $this
                ->restrictionRepository
                ->update(
                    $restriction,
                    $updateData
                );
        });
    }

    public function delete(
        string $tenantId,
        string $groupId,
        string $restrictionId
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

        DB::transaction(function () use (
            $restriction
        ) {
            $this
                ->restrictionRepository
                ->delete(
                    $restriction
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
