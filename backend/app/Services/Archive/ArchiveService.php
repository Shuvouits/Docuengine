<?php

namespace App\Services\Archive;

use App\Models\ArchiveEntry;
use App\Models\AuditEvent;
use App\Models\User;
use App\Repositories\ArchiveEntryRepository;
use App\Services\Audit\AuditEventService;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ArchiveService
{
    public function __construct(
        protected ArchiveEntryRepository $archiveEntryRepository,
        protected AuditEventService $auditEventService
    ) {
    }

    public function listArchived(
        string $tenantId,
        array $filters = [],
        int $perPage = 25
    ): LengthAwarePaginator {
        return $this
            ->archiveEntryRepository
            ->paginateArchivedByTenant(
                $tenantId,
                $filters,
                $perPage
            );
    }

    public function getArchived(
        string $tenantId,
        string $archiveEntryId
    ): ArchiveEntry {
        $archiveEntry = $this
            ->archiveEntryRepository
            ->findArchivedByTenantAndId(
                $tenantId,
                $archiveEntryId
            );

        if (!$archiveEntry) {
            throw new DomainException(
                'Archived resource not found.'
            );
        }

        return $archiveEntry;
    }


    public function viewArchived(
    string $tenantId,
    string $archiveEntryId,
    User $actor,
    ?string $ipAddress = null,
    ?string $userAgent = null,
    ?string $requestMethod = null,
    ?string $requestPath = null
): ArchiveEntry {
    $archiveEntry = $this->getArchived(
        $tenantId,
        $archiveEntryId
    );

    $this
        ->auditEventService
        ->record(
            tenantId: $tenantId,
            actor: $actor,
            action: AuditEvent::ACTION_VIEWED,
            category: AuditEvent::CATEGORY_ARCHIVE,
            targetType:
                $archiveEntry->resource_type,
            targetId:
                $archiveEntry->resource_id,
            targetLabel:
                $archiveEntry->resource_label,
            description:
                'Archived resource was viewed.',
            metadata: [
                'archive_entry_id' =>
                    $archiveEntry->id,
            ],
            ipAddress: $ipAddress,
            userAgent: $userAgent,
            requestMethod: $requestMethod,
            requestPath: $requestPath
        );

    return $archiveEntry;
}

    public function registerArchivedResource(
        string $tenantId,
        string $resourceType,
        string $resourceId,
        ?string $resourceLabel,
        User $actor,
        ?string $reason = null,
        array $metadata = [],
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): ArchiveEntry {
        $existing = $this
            ->archiveEntryRepository
            ->findByTenantAndResource(
                $tenantId,
                $resourceType,
                $resourceId
            );

        if ($existing) {
            throw new DomainException(
                'This resource is already archived.'
            );
        }

        return DB::transaction(function () use (
            $tenantId,
            $resourceType,
            $resourceId,
            $resourceLabel,
            $actor,
            $reason,
            $metadata,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $archiveEntry = $this
                ->archiveEntryRepository
                ->create([
                    'tenant_id' => $tenantId,
                    'resource_type' => $resourceType,
                    'resource_id' => $resourceId,
                    'resource_label' => $resourceLabel,
                    'archived_by_user_id' => $actor->id,
                    'actor_snapshot' => [
                        'id' => $actor->id,
                        'name' => $actor->name,
                        'email' => $actor->email,
                    ],
                    'reason' => $reason,
                    'metadata' => $metadata,
                    'archived_at' => now(),
                ]);

            $this
                ->auditEventService
                ->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_ARCHIVED,
                    category: AuditEvent::CATEGORY_ARCHIVE,
                    targetType: $resourceType,
                    targetId: $resourceId,
                    targetLabel: $resourceLabel,
                    description:
                        'Resource was moved to the archive.',
                    metadata: [
                        'archive_entry_id' =>
                            $archiveEntry->id,
                        'reason' => $reason,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            return $archiveEntry;
        });
    }

    public function markRestored(
        string $tenantId,
        string $archiveEntryId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): ArchiveEntry {
        $archiveEntry = $this->getArchived(
            $tenantId,
            $archiveEntryId
        );

        return DB::transaction(function () use (
            $archiveEntry,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $archiveEntry = $this
                ->archiveEntryRepository
                ->markRestored(
                    $archiveEntry,
                    $actor->id
                );

            $this
                ->auditEventService
                ->record(
                    tenantId: $archiveEntry->tenant_id,
                    actor: $actor,
                    action: AuditEvent::ACTION_RESTORED,
                    category: AuditEvent::CATEGORY_ARCHIVE,
                    targetType:
                        $archiveEntry->resource_type,
                    targetId:
                        $archiveEntry->resource_id,
                    targetLabel:
                        $archiveEntry->resource_label,
                    description:
                        'Archived resource was restored.',
                    metadata: [
                        'archive_entry_id' =>
                            $archiveEntry->id,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            return $archiveEntry;
        });
    }

    public function markPermanentlyDeleted(
        string $tenantId,
        string $archiveEntryId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): ArchiveEntry {
        $archiveEntry = $this->getArchived(
            $tenantId,
            $archiveEntryId
        );

        return DB::transaction(function () use (
            $archiveEntry,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $archiveEntry = $this
                ->archiveEntryRepository
                ->markPermanentlyDeleted(
                    $archiveEntry,
                    $actor->id
                );

            $this
                ->auditEventService
                ->record(
                    tenantId: $archiveEntry->tenant_id,
                    actor: $actor,
                    action:
                        AuditEvent::ACTION_PERMANENTLY_DELETED,
                    category:
                        AuditEvent::CATEGORY_ARCHIVE,
                    targetType:
                        $archiveEntry->resource_type,
                    targetId:
                        $archiveEntry->resource_id,
                    targetLabel:
                        $archiveEntry->resource_label,
                    description:
                        'Archived resource was permanently deleted.',
                    metadata: [
                        'archive_entry_id' =>
                            $archiveEntry->id,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

            return $archiveEntry;
        });
    }


    public function getArchivedByResource(
    string $tenantId,
    string $resourceType,
    string $resourceId
): ArchiveEntry {
    $archiveEntry = $this
        ->archiveEntryRepository
        ->findByTenantAndResource(
            $tenantId,
            $resourceType,
            $resourceId
        );

    if (!$archiveEntry) {
        throw new DomainException(
            'Archived resource not found.'
        );
    }

    return $archiveEntry;
}




}
