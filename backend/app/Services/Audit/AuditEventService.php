<?php

namespace App\Services\Audit;

use App\Models\AuditEvent;
use App\Models\User;
use App\Repositories\AuditEventRepository;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\LazyCollection;

class AuditEventService
{
    public function __construct(
        protected AuditEventRepository $auditEventRepository
    ) {
    }

    public function record(
        ?string $tenantId,
        ?User $actor,
        string $action,
        ?string $category = null,
        ?string $targetType = null,
        ?string $targetId = null,
        ?string $targetLabel = null,
        ?string $description = null,
        ?array $changes = null,
        ?array $metadata = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): AuditEvent {
        $this->validateAction($action);

        return $this
            ->auditEventRepository
            ->create([
                'tenant_id' =>
                    $tenantId,

                'actor_user_id' =>
                    $actor?->id,

                'actor_snapshot' =>
                    $actor
                        ? [
                            'id' => $actor->id,
                            'name' => $actor->name,
                            'email' => $actor->email,
                        ]
                        : null,

                'action' =>
                    $action,

                'category' =>
                    $category,

                'target_type' =>
                    $targetType,

                'target_id' =>
                    $targetId,

                'target_label' =>
                    $targetLabel,

                'description' =>
                    $description,

                'changes' =>
                    $changes,

                'metadata' =>
                    $metadata,

                'ip_address' =>
                    $ipAddress,

                'user_agent' =>
                    $userAgent,

                'request_method' =>
                    $requestMethod,

                'request_path' =>
                    $requestPath,

                'occurred_at' =>
                    now(),
            ]);
    }

    public function listTenantEvents(
        string $tenantId,
        array $filters = [],
        int $perPage = 25
    ): LengthAwarePaginator {
        $perPage = max(
            1,
            min($perPage, 100)
        );

        return $this
            ->auditEventRepository
            ->paginateByTenant(
                $tenantId,
                $filters,
                $perPage
            );
    }

    public function getTenantEvent(
        string $tenantId,
        string $eventId
    ): AuditEvent {
        $event = $this
            ->auditEventRepository
            ->findByTenantAndId(
                $tenantId,
                $eventId
            );

        if (!$event) {
            throw new DomainException(
                'Audit event not found.'
            );
        }

        return $event;
    }

    public function getTargetActivity(
        string $tenantId,
        string $targetType,
        string $targetId,
        int $perPage = 25
    ): LengthAwarePaginator {
        $perPage = max(
            1,
            min($perPage, 100)
        );

        return $this
            ->auditEventRepository
            ->paginateForTarget(
                $tenantId,
                $targetType,
                $targetId,
                $perPage
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Audit Export
    |--------------------------------------------------------------------------
    */

    public function exportTenantEvents(
        string $tenantId,
        array $filters,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): LazyCollection {
        $cleanFilters = array_filter(
            $filters,
            fn ($value) =>
                $value !== null &&
                $value !== ''
        );

        return LazyCollection::make(
            function () use (
                $tenantId,
                $cleanFilters,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $exportedCount = 0;

                $events = $this
                    ->auditEventRepository
                    ->cursorForExport(
                        $tenantId,
                        $cleanFilters
                    );

                foreach ($events as $event) {
                    $exportedCount++;

                    yield $event;
                }

                /*
                |--------------------------------------------------------------------------
                | Record Export Only After Successful Iteration
                |--------------------------------------------------------------------------
                |
                | This happens after the export records are read, so the export event
                | itself is not accidentally included inside the same CSV export.
                |
                */

                $this->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_EXPORTED,
                    category: AuditEvent::CATEGORY_EXPORT,
                    targetType: 'audit_log',
                    targetId: null,
                    targetLabel: 'Audit Log',
                    description: 'Audit records were exported.',
                    changes: null,
                    metadata: [
                        'filters' =>
                            $cleanFilters,

                        'record_count' =>
                            $exportedCount,

                        'format' =>
                            'csv',
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );
            }
        );
    }

    private function validateAction(
        string $action
    ): void {
        $allowed = [
            AuditEvent::ACTION_CREATED,
            AuditEvent::ACTION_VIEWED,
            AuditEvent::ACTION_UPDATED,
            AuditEvent::ACTION_REVEALED,
            AuditEvent::ACTION_SHARED,
            AuditEvent::ACTION_EXPORTED,
            AuditEvent::ACTION_ARCHIVED,
            AuditEvent::ACTION_RESTORED,
            AuditEvent::ACTION_DELETED,
            AuditEvent::ACTION_PERMANENTLY_DELETED,
        ];

        if (!in_array(
            $action,
            $allowed,
            true
        )) {
            throw new DomainException(
                'Invalid audit event action.'
            );
        }
    }
}