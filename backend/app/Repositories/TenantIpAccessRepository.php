<?php

namespace App\Repositories;

use App\Models\TenantIpAccessPolicy;
use App\Models\TenantIpAllowlistEntry;
use Illuminate\Database\Eloquent\Collection;

class TenantIpAccessRepository
{
    public function findPolicyByTenant(
        string $tenantId
    ): ?TenantIpAccessPolicy {
        return TenantIpAccessPolicy::query()
            ->where('tenant_id', $tenantId)
            ->first();
    }

    public function createOrUpdatePolicy(
        string $tenantId,
        array $data
    ): TenantIpAccessPolicy {
        return TenantIpAccessPolicy::updateOrCreate(
            [
                'tenant_id' => $tenantId,
            ],
            [
                'enabled' =>
                    $data['enabled'] ?? false,

                'updated_by' =>
                    $data['updated_by'] ?? null,
            ]
        );
    }

    public function allEntriesByTenant(
        string $tenantId
    ): Collection {
        return TenantIpAllowlistEntry::query()
            ->where('tenant_id', $tenantId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function activeEntriesByTenant(
        string $tenantId
    ): Collection {
        return TenantIpAllowlistEntry::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->get();
    }

    public function findEntryByTenantAndId(
        string $tenantId,
        string $entryId
    ): ?TenantIpAllowlistEntry {
        return TenantIpAllowlistEntry::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $entryId)
            ->first();
    }

    public function findEntryByTenantAndValue(
        string $tenantId,
        string $ipOrCidr
    ): ?TenantIpAllowlistEntry {
        return TenantIpAllowlistEntry::query()
            ->where('tenant_id', $tenantId)
            ->where('ip_or_cidr', $ipOrCidr)
            ->first();
    }

    public function createEntry(
        string $tenantId,
        array $data
    ): TenantIpAllowlistEntry {
        return TenantIpAllowlistEntry::create([
            'tenant_id' => $tenantId,

            'label' =>
                $data['label'] ?? null,

            'ip_or_cidr' =>
                $data['ip_or_cidr'],

            'is_active' =>
                $data['is_active'] ?? true,

            'created_by' =>
                $data['created_by'] ?? null,
        ]);
    }

    public function updateEntry(
        TenantIpAllowlistEntry $entry,
        array $data
    ): TenantIpAllowlistEntry {
        $entry->fill($data);
        $entry->save();

        return $entry->fresh();
    }

    public function deleteEntry(
        TenantIpAllowlistEntry $entry
    ): bool {
        return (bool) $entry->delete();
    }

    public function hasActiveEntries(
        string $tenantId
    ): bool {
        return TenantIpAllowlistEntry::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->exists();
    }
}