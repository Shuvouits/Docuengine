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
            'email' => 'owner@docuengaine.com',
            'password' => 'password',
            'is_platform_owner' => true,
            'status' => 'active',
        ]);
    }
}
