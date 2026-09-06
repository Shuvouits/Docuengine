<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PlatformOwnerSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'platform@docuengine.test',
            ],
            [
                'name' => 'DocuEngine Platform Owner',
                'password' => Hash::make('password123'),
                'is_platform_owner' => true,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
    }
}
