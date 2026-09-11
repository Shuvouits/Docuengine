<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\UserMfaSetting;

class UserMfaRepository
{
    public function findByUserId(
        string $userId
    ): ?UserMfaSetting {
        return UserMfaSetting::query()
            ->where('user_id', $userId)
            ->first();
    }

    public function createOrUpdateSetup(
        User $user,
        array $data
    ): UserMfaSetting {
        $setting = UserMfaSetting::query()
            ->firstOrNew([
                'user_id' => $user->id,
            ]);

        $setting->fill($data);
        $setting->save();

        return $setting->fresh();
    }

    public function update(
        UserMfaSetting $setting,
        array $data
    ): UserMfaSetting {
        $setting->fill($data);
        $setting->save();

        return $setting->fresh();
    }

    public function delete(
        UserMfaSetting $setting
    ): bool {
        return (bool) $setting->delete();
    }
}
