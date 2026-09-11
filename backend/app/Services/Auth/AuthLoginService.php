<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Repositories\AuthLoginRepository;
use App\Services\Security\SecurityEventService;
use DomainException;
use Illuminate\Support\Facades\Hash;
use App\Models\SecurityEvent;

class AuthLoginService
{
    public function __construct(
        private AuthLoginRepository $authLoginRepository,
        private MfaLoginChallengeService $mfaChallengeService,
        private AuthSessionService $authSessionService,
        private SecurityEventService $securityEventService
    ) {
    }

    public function login(
        string $email,
        string $password,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): array {
        $email = strtolower(trim($email));

        $user = $this
            ->authLoginRepository
            ->findByEmail($email);

         
            if (
    !$user ||
    !Hash::check(
        $password,
        $user->password
    )
) {
    $this
        ->securityEventService
        ->record(
            eventType: 'auth.login.failed',
            category: SecurityEventService::CATEGORY_AUTH,
            tenantId: null,
            actorUserId: null,
            subjectUserId: $user?->id,
            severity: SecurityEvent::SEVERITY_WARNING,
            ipAddress: $ipAddress,
            userAgent: $userAgent,
            description: 'Login attempt failed.',
            metadata: [
                'reason' => 'invalid_credentials',
            ]
        );

    throw new DomainException(
        'Invalid email or password.'
    );
}



        if (!$user->isActive()) {
            throw new DomainException(
                'This account is not active.'
            );
        }

        if ($user->hasMfaEnabled()) {
            $challenge = $this
                ->mfaChallengeService
                ->createChallenge(
                    $user,
                    $ipAddress,
                    $userAgent
                );

            return [
                'mfa_required' => true,
                'user' => $user,
                'challenge' => $challenge,
                'token' => null,
            ];
        }

        $token = $this->issueJwtForUser(
            $user,
            $ipAddress,
            $userAgent
        );

        return [
            'mfa_required' => false,
            'user' => $user,
            'challenge' => null,
            'token' => $token,
        ];
    }

    public function issueJwtAfterMfa(
        User $user,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): string {
        return $this->issueJwtForUser(
            $user,
            $ipAddress,
            $userAgent
        );
    }

    private function issueJwtForUser(
        User $user,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): string {
        if (!$user->isActive()) {
            throw new DomainException(
                'This account is not active.'
            );
        }

        $token = auth('api')->login($user);

        if (!$token) {
            throw new DomainException(
                'Unable to create authentication token.'
            );
        }

        $session = $this
            ->authSessionService
            ->createFromJwtToken(
                $user,
                $token,
                $ipAddress,
                $userAgent
            );

        $this
            ->securityEventService
            ->record(
                eventType: 'auth.login.success',
                category: SecurityEventService::CATEGORY_AUTH,
                tenantId: null,
                actorUserId: $user->id,
                subjectUserId: $user->id,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                description: 'User signed in successfully.',
                metadata: [
                    'session_id' => $session->id,
                    'mfa_enabled' => $user->hasMfaEnabled(),
                ]
            );

        return $token;
    }
}