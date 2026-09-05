<?php

namespace App\Services\Auth;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function __construct(
        protected UserRepository $userRepository
    ) {
    }

    public function login(string $email, string $password): ?string
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            return null;
        }

        if (!Hash::check($password, $user->password)) {
            return null;
        }

        if ($user->status !== 'active') {
            return null;
        }

        return JWTAuth::fromUser($user);
    }
}
