<?php

namespace App\Repositories;

use App\Models\AuthSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AuthSessionRepository
{
    public function create(
        User $user,
        array $data
    ): AuthSession {
        return AuthSession::create([
            'user_id' => $user->id,

            'jti_hash' =>
                $data['jti_hash'],

            'ip_address' =>
                $data['ip_address'] ?? null,

            'user_agent' =>
                $data['user_agent'] ?? null,

            'device_name' =>
                $data['device_name'] ?? null,

            'last_activity_at' =>
                $data['last_activity_at'] ?? now(),

            'expires_at' =>
                $data['expires_at'],

            'revoked_at' =>
                null,

            'revoke_reason' =>
                null,
        ]);
    }

    public function findByJtiHash(
        string $jtiHash
    ): ?AuthSession {
        return AuthSession::query()
            ->where(
                'jti_hash',
                $jtiHash
            )
            ->first();
    }

    public function findByUserAndId(
        string $userId,
        string $sessionId
    ): ?AuthSession {
        return AuthSession::query()
            ->where(
                'user_id',
                $userId
            )
            ->where(
                'id',
                $sessionId
            )
            ->first();
    }

    public function activeByUser(
        string $userId
    ): Collection {
        return AuthSession::query()
            ->where(
                'user_id',
                $userId
            )
            ->whereNull('revoked_at')
            ->where(
                'expires_at',
                '>',
                now()
            )
            ->latest('last_activity_at')
            ->get();
    }

    public function update(
        AuthSession $session,
        array $data
    ): AuthSession {
        $session->fill($data);
        $session->save();

        return $session->fresh();
    }

    public function revoke(
        AuthSession $session,
        string $reason
    ): AuthSession {
        return $this->update(
            $session,
            [
                'revoked_at' => now(),
                'revoke_reason' => $reason,
            ]
        );
    }

    public function revokeAllByUser(
        string $userId,
        string $reason
    ): int {
        return AuthSession::query()
            ->where(
                'user_id',
                $userId
            )
            ->whereNull('revoked_at')
            ->where(
                'expires_at',
                '>',
                now()
            )
            ->update([
                'revoked_at' => now(),
                'revoke_reason' => $reason,
                'updated_at' => now(),
            ]);
    }

    public function touchActivity(
        AuthSession $session
    ): AuthSession {
        return $this->update(
            $session,
            [
                'last_activity_at' => now(),
            ]
        );
    }

    public function deleteExpired(): int
    {
        return AuthSession::query()
            ->where(
                'expires_at',
                '<=',
                now()
            )
            ->delete();
    }
}
