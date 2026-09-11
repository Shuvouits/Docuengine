<?php

namespace App\Repositories;

use App\Models\MfaLoginChallenge;
use App\Models\User;

class MfaLoginChallengeRepository
{
    public function create(
        User $user,
        array $data
    ): MfaLoginChallenge {
        return MfaLoginChallenge::create([
            'user_id' => $user->id,

            'token_hash' =>
                $data['token_hash'],

            'expires_at' =>
                $data['expires_at'],

            'verified_at' =>
                null,

            'failed_attempts' =>
                0,

            'ip_address' =>
                $data['ip_address'] ?? null,

            'user_agent' =>
                $data['user_agent'] ?? null,
        ]);
    }

    public function findByTokenHash(
        string $tokenHash
    ): ?MfaLoginChallenge {
        return MfaLoginChallenge::query()
            ->with([
                'user.mfaSetting',
            ])
            ->where(
                'token_hash',
                $tokenHash
            )
            ->first();
    }

    public function findByTokenHashForUpdate(
        string $tokenHash
    ): ?MfaLoginChallenge {
        return MfaLoginChallenge::query()
            ->with([
                'user.mfaSetting',
            ])
            ->where(
                'token_hash',
                $tokenHash
            )
            ->lockForUpdate()
            ->first();
    }

    public function update(
        MfaLoginChallenge $challenge,
        array $data
    ): MfaLoginChallenge {
        $challenge->fill($data);
        $challenge->save();

        return $challenge->fresh([
            'user.mfaSetting',
        ]);
    }

    public function incrementFailedAttempts(
        MfaLoginChallenge $challenge
    ): MfaLoginChallenge {
        $challenge->increment(
            'failed_attempts'
        );

        return $challenge->fresh([
            'user.mfaSetting',
        ]);
    }

    public function invalidatePreviousChallenges(
        string $userId
    ): int {
        return MfaLoginChallenge::query()
            ->where('user_id', $userId)
            ->whereNull('verified_at')
            ->where(
                'expires_at',
                '>',
                now()
            )
            ->update([
                'expires_at' => now(),
                'updated_at' => now(),
            ]);
    }

    public function deleteExpired(): int
    {
        return MfaLoginChallenge::query()
            ->where(
                'expires_at',
                '<=',
                now()
            )
            ->delete();
    }
}
