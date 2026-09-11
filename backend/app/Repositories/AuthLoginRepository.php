<?php

namespace App\Repositories;

use App\Models\User;

class AuthLoginRepository
{
    public function findByEmail(
        string $email
    ): ?User {
        return User::query()
            ->with([
                'mfaSetting',
            ])
            ->where(
                'email',
                strtolower(trim($email))
            )
            ->first();
    }
}
