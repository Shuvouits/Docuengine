<?php

namespace App\Services\Security;

use App\Models\SecurityEvent;
use App\Repositories\SecurityEventRepository;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SecurityEventService
{
    public const CATEGORY_AUTH = 'auth';
    public const CATEGORY_MFA = 'mfa';
    public const CATEGORY_SESSION = 'session';
    public const CATEGORY_PASSWORD = 'password';
    public const CATEGORY_USER = 'user';
    public const CATEGORY_SECURITY = 'security';

    public function __construct(
        protected SecurityEventRepository $securityEventRepository
    ) {
    }

    public function record(
        string $eventType,
        string $category,
        ?string $tenantId = null,
        ?string $actorUserId = null,
        ?string $subjectUserId = null,
        string $severity = SecurityEvent::SEVERITY_INFO,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $description = null,
        ?array $metadata = null
    ): SecurityEvent {
        $this->validateSeverity($severity);

        return $this->securityEventRepository->create([
            'tenant_id' => $tenantId,
            'actor_user_id' => $actorUserId,
            'subject_user_id' => $subjectUserId,
            'event_type' => $eventType,
            'category' => $category,
            'severity' => $severity,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'description' => $description,
            'metadata' => $metadata,
            'occurred_at' => now(),
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

        return $this->securityEventRepository->paginateByTenant(
            $tenantId,
            $filters,
            $perPage
        );
    }

    public function getTenantEvent(
        string $tenantId,
        string $eventId
    ): SecurityEvent {
        $event = $this->securityEventRepository->findByTenantAndId(
            $tenantId,
            $eventId
        );

        if (!$event) {
            throw new DomainException(
                'Security event not found.'
            );
        }

        return $event;
    }

    public function getRecentUserEvents(
        string $userId,
        int $limit = 20
    ) {
        $limit = max(
            1,
            min($limit, 100)
        );

        return $this->securityEventRepository->recentBySubject(
            $userId,
            $limit
        );
    }

    private function validateSeverity(
        string $severity
    ): void {
        $allowed = [
            SecurityEvent::SEVERITY_INFO,
            SecurityEvent::SEVERITY_WARNING,
            SecurityEvent::SEVERITY_CRITICAL,
        ];

        if (!in_array($severity, $allowed, true)) {
            throw new DomainException(
                'Invalid security event severity.'
            );
        }
    }
}