<?php

namespace App\Services\Auth;

use App\Models\SecurityEvent;
use App\Models\User;
use App\Repositories\MfaLoginChallengeRepository;
use App\Services\Security\MfaService;
use App\Services\Security\SecurityEventService;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MfaLoginChallengeService
{
    public function __construct(
        private MfaLoginChallengeRepository $challengeRepository,
        private MfaService $mfaService,
        private SecurityEventService $securityEventService
    ) {
    }

    public function createChallenge(
        User $user,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): array {
        if (!$user->isActive()) {
            throw new DomainException(
                'This account is not active.'
            );
        }

        if (!$user->hasMfaEnabled()) {
            throw new DomainException(
                'MFA is not enabled for this account.'
            );
        }

        $plainToken = Str::random(64);

        $tokenHash = hash(
            'sha256',
            $plainToken
        );

        $ttlMinutes = (int) config(
            'mfa.challenge_ttl_minutes',
            5
        );

        $challenge = DB::transaction(function () use (
            $user,
            $tokenHash,
            $ttlMinutes,
            $ipAddress,
            $userAgent
        ) {
            $this
                ->challengeRepository
                ->invalidatePreviousChallenges(
                    $user->id
                );

            return $this
                ->challengeRepository
                ->create(
                    $user,
                    [
                        'token_hash' => $tokenHash,
                        'expires_at' => now()->addMinutes(
                            $ttlMinutes
                        ),
                        'ip_address' => $ipAddress,
                        'user_agent' => $userAgent,
                    ]
                );
        });

        return [
            'challenge_token' => $plainToken,
            'expires_at' => $challenge->expires_at,
            'expires_in' => $ttlMinutes * 60,
            'methods' => [
                'totp',
                'recovery_code',
            ],
        ];
    }

    public function verifyTotp(
        string $plainChallengeToken,
        string $code
    ): User {
        return $this->verifyChallenge(
            $plainChallengeToken,
            function (User $user) use ($code) {
                return $this
                    ->mfaService
                    ->verifyTotp(
                        $user,
                        $code
                    );
            },
            'totp'
        );
    }

    public function verifyRecoveryCode(
        string $plainChallengeToken,
        string $recoveryCode
    ): User {
        return $this->verifyChallenge(
            $plainChallengeToken,
            function (User $user) use ($recoveryCode) {
                return $this
                    ->mfaService
                    ->verifyRecoveryCode(
                        $user,
                        $recoveryCode
                    );
            },
            'recovery_code'
        );
    }

    private function verifyChallenge(
        string $plainChallengeToken,
        callable $verificationCallback,
        string $method
    ): User {
        $tokenHash = hash(
            'sha256',
            $plainChallengeToken
        );

        $result = DB::transaction(function () use (
            $tokenHash,
            $verificationCallback,
            $method
        ) {
            $challenge = $this
                ->challengeRepository
                ->findByTokenHashForUpdate(
                    $tokenHash
                );

            if (!$challenge) {
                throw new DomainException(
                    'MFA challenge is invalid.'
                );
            }

            if ($challenge->isVerified()) {
                throw new DomainException(
                    'This MFA challenge has already been used.'
                );
            }

            if ($challenge->isExpired()) {
                throw new DomainException(
                    'MFA challenge has expired.'
                );
            }

            if ($challenge->hasExceededAttempts()) {
                throw new DomainException(
                    'MFA challenge has exceeded the maximum number of attempts.'
                );
            }

            $user = $challenge->user;

            if (!$user) {
                throw new DomainException(
                    'MFA challenge is invalid.'
                );
            }

            if (!$user->isActive()) {
                throw new DomainException(
                    'This account is not active.'
                );
            }

            if (!$user->hasMfaEnabled()) {
                throw new DomainException(
                    'MFA is no longer enabled for this account.'
                );
            }

            $valid = $verificationCallback(
                $user
            );

            if (!$valid) {
                $challenge = $this
                    ->challengeRepository
                    ->incrementFailedAttempts(
                        $challenge
                    );

                $maxAttempts = (int) config(
                    'mfa.max_failed_attempts',
                    5
                );

                if (
                    $challenge->failed_attempts >=
                    $maxAttempts
                ) {
                    $this
                        ->challengeRepository
                        ->update(
                            $challenge,
                            [
                                'expires_at' => now(),
                            ]
                        );
                }

                $this
                    ->securityEventService
                    ->record(
                        eventType: 'mfa.challenge.failed',
                        category: SecurityEventService::CATEGORY_MFA,
                        tenantId: null,
                        actorUserId: $user->id,
                        subjectUserId: $user->id,
                        severity: SecurityEvent::SEVERITY_WARNING,
                        ipAddress: $challenge->ip_address,
                        userAgent: $challenge->user_agent,
                        description: 'MFA verification attempt failed.',
                        metadata: [
                            'challenge_id' => $challenge->id,
                            'method' => $method,
                            'failed_attempts' => $challenge->failed_attempts,
                            'max_attempts' => $maxAttempts,
                        ]
                    );

                return [
                    'success' => false,
                    'message' =>
                        'The MFA verification code is invalid.',
                ];
            }

            $this
                ->challengeRepository
                ->update(
                    $challenge,
                    [
                        'verified_at' => now(),
                    ]
                );

            $this
                ->securityEventService
                ->record(
                    eventType: 'mfa.challenge.success',
                    category: SecurityEventService::CATEGORY_MFA,
                    tenantId: null,
                    actorUserId: $user->id,
                    subjectUserId: $user->id,
                    ipAddress: $challenge->ip_address,
                    userAgent: $challenge->user_agent,
                    description: 'MFA verification completed successfully.',
                    metadata: [
                        'challenge_id' => $challenge->id,
                        'method' => $method,
                    ]
                );

            return [
                'success' => true,
                'user' => $user,
            ];
        });

        if (!$result['success']) {
            throw new DomainException(
                $result['message']
            );
        }

        return $result['user'];
    }
}