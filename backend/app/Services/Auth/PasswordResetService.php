<?php

namespace App\Services\Auth;

use App\Repositories\PasswordResetRepository;
use App\Services\Security\SecurityEventService;
use Carbon\Carbon;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PasswordResetService
{
    public function __construct(
        private PasswordResetRepository $passwordResetRepository,
        private SecurityEventService $securityEventService
    ) {
    }

    public function requestReset(
        string $email
    ): array {
        $email = strtolower(
            trim($email)
        );

        $user = $this
            ->passwordResetRepository
            ->findUserByEmail($email);

        /*
        |--------------------------------------------------------------------------
        | Enumeration Protection
        |--------------------------------------------------------------------------
        */

        if (!$user) {
            return [
                'token' => null,
                'issued' => false,
            ];
        }

        if (!$user->isActive()) {
            return [
                'token' => null,
                'issued' => false,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Generate One-Time Reset Token
        |--------------------------------------------------------------------------
        */

        $plainToken = Str::random(64);

        $tokenHash = hash(
            'sha256',
            $plainToken
        );

        /*
        |--------------------------------------------------------------------------
        | Replace Previous Reset Token
        |--------------------------------------------------------------------------
        */

        $this
            ->passwordResetRepository
            ->createOrReplaceToken(
                $email,
                $tokenHash
            );

        return [
            'token' => $plainToken,
            'issued' => true,
        ];
    }

    public function validateToken(
        string $plainToken
    ): object {
        $tokenHash = hash(
            'sha256',
            $plainToken
        );

        $reset = $this
            ->passwordResetRepository
            ->findByTokenHash(
                $tokenHash
            );

        if (!$reset) {
            throw new DomainException(
                'Password reset token is invalid.'
            );
        }

        if (!$reset->created_at) {
            $this
                ->passwordResetRepository
                ->deleteByTokenHash(
                    $tokenHash
                );

            throw new DomainException(
                'Password reset token is invalid.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Token Expiration
        |--------------------------------------------------------------------------
        */

        $expireMinutes = (int) config(
            'auth.passwords.users.expire',
            60
        );

        $expiresAt = Carbon::parse(
            $reset->created_at
        )->addMinutes(
            $expireMinutes
        );

        if (now()->greaterThan($expiresAt)) {
            $this
                ->passwordResetRepository
                ->deleteByTokenHash(
                    $tokenHash
                );

            throw new DomainException(
                'Password reset token has expired.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | User Must Still Exist And Be Active
        |--------------------------------------------------------------------------
        */

        $user = $this
            ->passwordResetRepository
            ->findUserByEmail(
                $reset->email
            );

        if (!$user) {
            $this
                ->passwordResetRepository
                ->deleteByTokenHash(
                    $tokenHash
                );

            throw new DomainException(
                'Password reset token is invalid.'
            );
        }

        if (!$user->isActive()) {
            throw new DomainException(
                'This account is not active.'
            );
        }

        return (object) [
            'email' => $reset->email,
            'expires_at' => $expiresAt,
        ];
    }

    public function resetPassword(
        string $plainToken,
        string $newPassword,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $tokenHash = hash(
            'sha256',
            $plainToken
        );

        $user = DB::transaction(function () use (
            $tokenHash,
            $newPassword
        ) {
            /*
            |--------------------------------------------------------------------------
            | Lock Token
            |--------------------------------------------------------------------------
            */

            $reset = $this
                ->passwordResetRepository
                ->findByTokenHashForUpdate(
                    $tokenHash
                );

            if (!$reset) {
                throw new DomainException(
                    'Password reset token is invalid.'
                );
            }

            if (!$reset->created_at) {
                $this
                    ->passwordResetRepository
                    ->deleteByTokenHash(
                        $tokenHash
                    );

                throw new DomainException(
                    'Password reset token is invalid.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Check Expiration Again Inside Transaction
            |--------------------------------------------------------------------------
            */

            $expireMinutes = (int) config(
                'auth.passwords.users.expire',
                60
            );

            $expiresAt = Carbon::parse(
                $reset->created_at
            )->addMinutes(
                $expireMinutes
            );

            if (now()->greaterThan($expiresAt)) {
                $this
                    ->passwordResetRepository
                    ->deleteByTokenHash(
                        $tokenHash
                    );

                throw new DomainException(
                    'Password reset token has expired.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Find User
            |--------------------------------------------------------------------------
            */

            $user = $this
                ->passwordResetRepository
                ->findUserByEmail(
                    $reset->email
                );

            if (!$user) {
                $this
                    ->passwordResetRepository
                    ->deleteByTokenHash(
                        $tokenHash
                    );

                throw new DomainException(
                    'Password reset token is invalid.'
                );
            }

            if (!$user->isActive()) {
                throw new DomainException(
                    'This account is not active.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Update Password
            |--------------------------------------------------------------------------
            */

            $this
                ->passwordResetRepository
                ->updateUserPassword(
                    $user,
                    $newPassword
                );

            /*
            |--------------------------------------------------------------------------
            | Consume One-Time Token
            |--------------------------------------------------------------------------
            */

            $this
                ->passwordResetRepository
                ->deleteByTokenHash(
                    $tokenHash
                );

            return $user;
        });

        /*
        |--------------------------------------------------------------------------
        | Security Audit Event
        |--------------------------------------------------------------------------
        */

        $this
            ->securityEventService
            ->record(
                eventType: 'password.reset.completed',
                category: SecurityEventService::CATEGORY_PASSWORD,
                tenantId: null,
                actorUserId: null,
                subjectUserId: $user->id,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                description: 'User password was reset successfully.',
                metadata: [
                    'method' => 'password_reset_token',
                ]
            );
    }
}
