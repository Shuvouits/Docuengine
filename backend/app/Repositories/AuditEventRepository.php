<?php

namespace App\Repositories;

use App\Models\AuditEvent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\LazyCollection;

class AuditEventRepository
{
    public function create(
        array $data
    ): AuditEvent {
        return AuditEvent::create($data);
    }

    public function paginateByTenant(
        string $tenantId,
        array $filters = [],
        int $perPage = 25
    ): LengthAwarePaginator {
        return $this
            ->buildTenantQuery(
                $tenantId,
                $filters
            )
            ->orderByDesc('occurred_at')
            ->paginate($perPage);
    }

    public function findByTenantAndId(
        string $tenantId,
        string $eventId
    ): ?AuditEvent {
        return AuditEvent::query()
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'id',
                $eventId
            )
            ->first();
    }

    public function paginateForTarget(
        string $tenantId,
        string $targetType,
        string $targetId,
        int $perPage = 25
    ): LengthAwarePaginator {
        return AuditEvent::query()
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'target_type',
                $targetType
            )
            ->where(
                'target_id',
                $targetId
            )
            ->orderByDesc('occurred_at')
            ->paginate($perPage);
    }

    /*
    |--------------------------------------------------------------------------
    | Audit Export
    |--------------------------------------------------------------------------
    */

    public function cursorForExport(
        string $tenantId,
        array $filters = []
    ): LazyCollection {
        return $this
            ->buildTenantQuery(
                $tenantId,
                $filters
            )
            ->orderByDesc('occurred_at')
            ->cursor();
    }

    /*
    |--------------------------------------------------------------------------
    | Shared Tenant Filter Query
    |--------------------------------------------------------------------------
    */

    private function buildTenantQuery(
        string $tenantId,
        array $filters = []
    ): Builder {
        $query = AuditEvent::query()
            ->where(
                'tenant_id',
                $tenantId
            );

        if (!empty($filters['action'])) {
            $query->where(
                'action',
                $filters['action']
            );
        }

        if (!empty($filters['category'])) {
            $query->where(
                'category',
                $filters['category']
            );
        }

        if (!empty($filters['actor_user_id'])) {
            $query->where(
                'actor_user_id',
                $filters['actor_user_id']
            );
        }

        if (!empty($filters['target_type'])) {
            $query->where(
                'target_type',
                $filters['target_type']
            );
        }

        if (!empty($filters['target_id'])) {
            $query->where(
                'target_id',
                $filters['target_id']
            );
        }

        if (!empty($filters['from'])) {
            $query->where(
                'occurred_at',
                '>=',
                $filters['from']
            );
        }

        if (!empty($filters['to'])) {
            $query->where(
                'occurred_at',
                '<=',
                $filters['to']
            );
        }

        return $query;
    }
}