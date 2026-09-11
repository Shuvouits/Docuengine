<?php

namespace App\Services\Auth;

use App\Models\AuthSession;
use App\Models\User;
use App\Repositories\AuthSessionRepository;
use App\Services\Security\SecurityEventService;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthSessionService
{
    public function __construct(
        private AuthSessionRepository $authSessionRepository,
        private SecurityEventService $securityEventService
    ) {
    }

    public function createSession(
        User $user,
        string $jti,
        CarbonInterface $expiresAt,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $deviceName = null
    ): AuthSession {
        if (!$user->isActive()) {
            throw new DomainException(
                'This account is not active.'
            );
        }

        $jtiHash = $this->hashJti($jti);

        return $this
            ->authSessionRepository
            ->create(
                $user,
                [
                    'jti_hash' => $jtiHash,
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                    'device_name' => $deviceName,
                    'last_activity_at' => now(),
                    'expires_at' => $expiresAt,
                ]
            );
    }

    public function getActiveSessions(
        User $user
    ): Collection {
        return $this
            ->authSessionRepository
            ->activeByUser(
                $user->id
            );
    }

    public function findActiveByJti(
        string $jti
    ): ?AuthSession {
        $session = $this
            ->authSessionRepository
            ->findByJtiHash(
                $this->hashJti($jti)
            );

        if (!$session) {
            return null;
        }

        if (!$session->isActive()) {
            return null;
        }

        return $session;
    }

    public function revokeSession(
        User $user,
        string $sessionId,
        string $reason = 'user_revoked',
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): AuthSession {
        $session = $this
            ->authSessionRepository
            ->findByUserAndId(
                $user->id,
                $sessionId
            );

        if (!$session) {
            throw new DomainException(
                'Authentication session not found.'
            );
        }

        if ($session->isRevoked()) {
            throw new DomainException(
                'Authentication session has already been revoked.'
            );
        }

        $revokedSession = $this
            ->authSessionRepository
            ->revoke(
                $session,
                $reason
            );

        $eventType = $reason === 'idle_timeout'
    ? 'session.idle_timeout'
    : 'session.revoked';

$description = $reason === 'idle_timeout'
    ? 'Authentication session expired due to inactivity.'
    : 'Authentication session was revoked.';

$this
    ->securityEventService
    ->record(
        eventType: $eventType,
        category: SecurityEventService::CATEGORY_SESSION,
        tenantId: null,
        actorUserId: $user->id,
        subjectUserId: $user->id,
        ipAddress: $ipAddress,
        userAgent: $userAgent,
        description: $description,
        metadata: [
            'session_id' => $revokedSession->id,
            'reason' => $reason,
        ]
    );

        return $revokedSession;
    }


    public function revokeAllSessions(
    User $user,
    string $reason = 'logout_all',
    ?string $ipAddress = null,
    ?string $userAgent = null
): int {
    $revokedCount = $this
        ->authSessionRepository
        ->revokeAllByUser(
            $user->id,
            $reason
        );

    $this
        ->securityEventService
        ->record(
            eventType: 'session.logout_all',
            category: SecurityEventService::CATEGORY_SESSION,
            tenantId: null,
            actorUserId: $user->id,
            subjectUserId: $user->id,
            ipAddress: $ipAddress,
            userAgent: $userAgent,
            description: 'All authentication sessions were revoked.',
            metadata: [
                'revoked_sessions' => $revokedCount,
                'reason' => $reason,
            ]
        );

    return $revokedCount;
}





    public function recordActivity(
        AuthSession $session
    ): AuthSession {
        if (!$session->isActive()) {
            throw new DomainException(
                'Authentication session is no longer active.'
            );
        }

        return $this
            ->authSessionRepository
            ->touchActivity(
                $session
            );
    }

    public function createFromJwtToken(
        User $user,
        string $token,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): AuthSession {
        $payload = JWTAuth::setToken(
            $token
        )->getPayload();

        $jti = $payload->get('jti');
        $exp = $payload->get('exp');

        if (!$jti || !$exp) {
            throw new DomainException(
                'The authentication token is missing required session claims.'
            );
        }

        $expiresAt = CarbonImmutable::createFromTimestamp(
            (int) $exp
        );

        return $this->createSession(
            $user,
            (string) $jti,
            $expiresAt,
            $ipAddress,
            $userAgent
        );
    }

    private function hashJti(
        string $jti
    ): string {
        return hash(
            'sha256',
            $jti
        );
    }
}
