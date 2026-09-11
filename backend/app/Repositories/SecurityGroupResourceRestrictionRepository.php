<?php

namespace App\Repositories;

use App\Models\SecurityGroupResourceRestriction;
use Illuminate\Database\Eloquent\Collection;

class SecurityGroupResourceRestrictionRepository
{
    public function allByGroup(
        string $tenantId,
        string $groupId
    ): Collection {
        return SecurityGroupResourceRestriction::query()
            ->where('tenant_id', $tenantId)
            ->where('security_group_id', $groupId)
            ->with([
                'creator:id,name,email',
            ])
            ->orderBy('resource_type')
            ->orderBy('created_at')
            ->get();
    }

    public function findByTenantAndId(
        string $tenantId,
        string $restrictionId
    ): ?SecurityGroupResourceRestriction {
        return SecurityGroupResourceRestriction::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $restrictionId)
            ->with([
                'creator:id,name,email',
            ])
            ->first();
    }

    public function findExisting(
        string $tenantId,
        string $groupId,
        string $resourceType,
        string $resourceId
    ): ?SecurityGroupResourceRestriction {
        return SecurityGroupResourceRestriction::query()
            ->where('tenant_id', $tenantId)
            ->where('security_group_id', $groupId)
            ->where('resource_type', $resourceType)
            ->where('resource_id', $resourceId)
            ->first();
    }

    public function create(
        array $data
    ): SecurityGroupResourceRestriction {
        return SecurityGroupResourceRestriction::create(
            $data
        );
    }

    public function update(
        SecurityGroupResourceRestriction $restriction,
        array $data
    ): SecurityGroupResourceRestriction {
        $restriction->fill($data);
        $restriction->save();

        return $restriction->fresh([
            'creator:id,name,email',
        ]);
    }

    public function delete(
        SecurityGroupResourceRestriction $restriction
    ): bool {
        return (bool) $restriction->delete();
    }

    public function deleteByGroup(
        string $tenantId,
        string $groupId
    ): int {
        return SecurityGroupResourceRestriction::query()
            ->where('tenant_id', $tenantId)
            ->where('security_group_id', $groupId)
            ->delete();
    }

    public function existsForResource(
        string $tenantId,
        string $groupId,
        string $resourceType,
        string $resourceId
    ): bool {
        return SecurityGroupResourceRestriction::query()
            ->where('tenant_id', $tenantId)
            ->where('security_group_id', $groupId)
            ->where('resource_type', $resourceType)
            ->where('resource_id', $resourceId)
            ->exists();
    }
}
