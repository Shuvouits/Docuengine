<?php

namespace App\Repositories;

use App\Models\SecurityEvent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SecurityEventRepository
{
    public function create(
        array $data
    ): SecurityEvent {
        return SecurityEvent::create([
            'tenant_id' =>
                $data['tenant_id'] ?? null,

            'actor_user_id' =>
                $data['actor_user_id'] ?? null,

            'subject_user_id' =>
                $data['subject_user_id'] ?? null,

            'event_type' =>
                $data['event_type'],

            'category' =>
                $data['category'],

            'severity' =>
                $data['severity'] ?? SecurityEvent::SEVERITY_INFO,

            'ip_address' =>
                $data['ip_address'] ?? null,

            'user_agent' =>
                $data['user_agent'] ?? null,

            'description' =>
                $data['description'] ?? null,

            'metadata' =>
                $data['metadata'] ?? null,

            'occurred_at' =>
                $data['occurred_at'] ?? now(),
        ]);
    }

   public function paginateByTenant(
    string $tenantId,
    array $filters = [],
    int $perPage = 25
): LengthAwarePaginator {
    $query = SecurityEvent::query()
        ->with([
            'actor:id,name,email',
            'subject:id,name,email',
        ])
        ->where(function ($query) use ($tenantId) {
            $query
                ->where(
                    'tenant_id',
                    $tenantId
                )
                ->orWhere(function ($query) use ($tenantId) {
                    $query
                        ->whereNull('tenant_id')
                        ->whereNotNull('subject_user_id')
                        ->whereExists(function ($membershipQuery) use ($tenantId) {
                            $membershipQuery
                                ->selectRaw('1')
                                ->from('tenant_users')
                                ->whereColumn(
                                    'tenant_users.user_id',
                                    'security_events.subject_user_id'
                                )
                                ->where(
                                    'tenant_users.tenant_id',
                                    $tenantId
                                );
                        });
                });
        });

    if (!empty($filters['event_type'])) {
        $query->where(
            'event_type',
            $filters['event_type']
        );
    }

    if (!empty($filters['category'])) {
        $query->where(
            'category',
            $filters['category']
        );
    }

    if (!empty($filters['severity'])) {
        $query->where(
            'severity',
            $filters['severity']
        );
    }

    if (!empty($filters['subject_user_id'])) {
        $query->where(
            'subject_user_id',
            $filters['subject_user_id']
        );
    }

    if (!empty($filters['actor_user_id'])) {
        $query->where(
            'actor_user_id',
            $filters['actor_user_id']
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

    return $query
        ->orderByDesc('occurred_at')
        ->paginate($perPage);
}

  

public function findByTenantAndId(
    string $tenantId,
    string $eventId
): ?SecurityEvent {
    return SecurityEvent::query()
        ->with([
            'actor:id,name,email',
            'subject:id,name,email',
        ])
        ->where(
            'id',
            $eventId
        )
        ->where(function ($query) use ($tenantId) {
            $query
                ->where(
                    'tenant_id',
                    $tenantId
                )
                ->orWhere(function ($query) use ($tenantId) {
                    $query
                        ->whereNull('tenant_id')
                        ->whereNotNull('subject_user_id')
                        ->whereExists(function ($membershipQuery) use ($tenantId) {
                            $membershipQuery
                                ->selectRaw('1')
                                ->from('tenant_users')
                                ->whereColumn(
                                    'tenant_users.user_id',
                                    'security_events.subject_user_id'
                                )
                                ->where(
                                    'tenant_users.tenant_id',
                                    $tenantId
                                );
                        });
                });
        })
        ->first();
}





    public function recentBySubject(
        string $userId,
        int $limit = 20
    ) {
        return SecurityEvent::query()
            ->where(
                'subject_user_id',
                $userId
            )
            ->orderByDesc('occurred_at')
            ->limit($limit)
            ->get();
    }
}