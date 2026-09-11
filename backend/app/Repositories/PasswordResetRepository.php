<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PasswordResetRepository
{
    public function findUserByEmail(
        string $email
    ): ?User {
        return User::query()
            ->where('email', strtolower($email))
            ->first();
    }

    public function createOrReplaceToken(
        string $email,
        string $tokenHash
    ): void {
        DB::table('password_reset_tokens')
            ->updateOrInsert(
                [
                    'email' => strtolower($email),
                ],
                [
                    'token_hash' => $tokenHash,
                    'created_at' => now(),
                ]
            );
    }

    public function findByTokenHash(
        string $tokenHash
    ): ?object {
        return DB::table('password_reset_tokens')
            ->where('token_hash', $tokenHash)
            ->first();
    }

    public function findByTokenHashForUpdate(
        string $tokenHash
    ): ?object {
        return DB::table('password_reset_tokens')
            ->where('token_hash', $tokenHash)
            ->lockForUpdate()
            ->first();
    }

    public function deleteByEmail(
        string $email
    ): int {
        return DB::table('password_reset_tokens')
            ->where('email', strtolower($email))
            ->delete();
    }

    public function deleteByTokenHash(
        string $tokenHash
    ): int {
        return DB::table('password_reset_tokens')
            ->where('token_hash', $tokenHash)
            ->delete();
    }

    public function updateUserPassword(
    User $user,
    string $password
): User {
    $user->password = Hash::make($password);
    $user->save();

    return $user->fresh();
}



}
