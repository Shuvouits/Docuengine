<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Platform Owner',
            'email' => 'admin@example.com',
            'password' => 'password',
            'is_platform_owner' => true,
            'status' => 'active',
        ]);
    }
}
