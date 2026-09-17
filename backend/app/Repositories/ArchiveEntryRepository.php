<?php

namespace App\Repositories;

use App\Models\ArchiveEntry;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ArchiveEntryRepository
{
    public function create(
        array $data
    ): ArchiveEntry {
        return ArchiveEntry::create($data);
    }

    public function paginateArchivedByTenant(
        string $tenantId,
        array $filters = [],
        int $perPage = 25
    ): LengthAwarePaginator {
        return ArchiveEntry::query()
            ->where('tenant_id', $tenantId)
            ->whereNull('restored_at')
            ->whereNull('permanently_deleted_at')
            ->when(
                !empty($filters['resource_type']),
                fn($query) =>
                $query->where(
                    'resource_type',
                    $filters['resource_type']
                )
            )
            ->when(
                !empty($filters['search']),
                function ($query) use ($filters) {
                    $search = $filters['search'];

                    $query->where(function ($subQuery) use ($search) {
                        $subQuery
                            ->where(
                                'resource_label',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'resource_id',
                                'like',
                                "%{$search}%"
                            );
                    });
                }
            )
            ->orderByDesc('archived_at')
            ->paginate($perPage);
    }

    public function findArchivedByTenantAndId(
        string $tenantId,
        string $archiveEntryId
    ): ?ArchiveEntry {
        return ArchiveEntry::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $archiveEntryId)
            ->whereNull('restored_at')
            ->whereNull('permanently_deleted_at')
            ->first();
    }

    public function findByTenantAndResource(
        string $tenantId,
        string $resourceType,
        string $resourceId
    ): ?ArchiveEntry {
        return ArchiveEntry::query()
            ->where('tenant_id', $tenantId)
            ->where('resource_type', $resourceType)
            ->where('resource_id', $resourceId)
            ->whereNull('restored_at')
            ->whereNull('permanently_deleted_at')
            ->latest('archived_at')
            ->first();
    }

    public function markRestored(
        ArchiveEntry $archiveEntry,
        string $restoredByUserId
    ): ArchiveEntry {
        $archiveEntry->update([
            'restored_at' => now(),
            'restored_by_user_id' =>
                $restoredByUserId,
        ]);

        return $archiveEntry->refresh();
    }

    public function markPermanentlyDeleted(
        ArchiveEntry $archiveEntry,
        string $deletedByUserId
    ): ArchiveEntry {
        $archiveEntry->update([
            'permanently_deleted_at' => now(),
            'permanently_deleted_by_user_id' =>
                $deletedByUserId,
        ]);

        return $archiveEntry->refresh();
    }
}
