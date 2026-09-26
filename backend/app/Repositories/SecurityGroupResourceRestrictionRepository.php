<?php

namespace App\Repositories;

use App\Models\SecurityGroupResourceRestriction;
use Illuminate\Database\Eloquent\Collection;
use App\Models\SecurityGroupUser;

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


    /*
|--------------------------------------------------------------------------
| User Security Groups
|--------------------------------------------------------------------------
*/

public function groupIdsForUser(
    string $tenantId,
    string $userId
): array {
    return SecurityGroupUser::query()
        ->where(
            'tenant_id',
            $tenantId
        )
        ->where(
            'user_id',
            $userId
        )
        ->pluck(
            'security_group_id'
        )
        ->unique()
        ->values()
        ->all();
}

/*
|--------------------------------------------------------------------------
| Check Whether Groups Restrict A Resource Type
|--------------------------------------------------------------------------
*/

public function hasRestrictionsForGroupsAndType(
    string $tenantId,
    array $groupIds,
    string $resourceType
): bool {
    if (empty($groupIds)) {
        return false;
    }

    return SecurityGroupResourceRestriction::query()
        ->where(
            'tenant_id',
            $tenantId
        )
        ->whereIn(
            'security_group_id',
            $groupIds
        )
        ->where(
            'resource_type',
            $resourceType
        )
        ->exists();
}

/*
|--------------------------------------------------------------------------
| Matching Resource Restrictions
|--------------------------------------------------------------------------
*/

public function matchingForGroups(
    string $tenantId,
    array $groupIds,
    string $resourceType,
    string $resourceId
): Collection {
    if (empty($groupIds)) {
        return new Collection();
    }

    return SecurityGroupResourceRestriction::query()
        ->where(
            'tenant_id',
            $tenantId
        )
        ->whereIn(
            'security_group_id',
            $groupIds
        )
        ->where(
            'resource_type',
            $resourceType
        )
        ->where(
            'resource_id',
            $resourceId
        )
        ->get();
}

/*
|--------------------------------------------------------------------------
| Allowed Resource IDs
|--------------------------------------------------------------------------
*/

public function resourceIdsForGroups(
    string $tenantId,
    array $groupIds,
    string $resourceType
): array {
    if (empty($groupIds)) {
        return [];
    }

    return SecurityGroupResourceRestriction::query()
        ->where(
            'tenant_id',
            $tenantId
        )
        ->whereIn(
            'security_group_id',
            $groupIds
        )
        ->where(
            'resource_type',
            $resourceType
        )
        ->pluck(
            'resource_id'
        )
        ->unique()
        ->values()
        ->all();
}




}
