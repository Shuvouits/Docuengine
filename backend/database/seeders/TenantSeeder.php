<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $tenant = Tenant::updateOrCreate(
                [
                    'slug' => 'xpert-it',
                ],
                [
                    'name' => 'Xpert IT',
                    'status' => Tenant::STATUS_ACTIVE,
                    'locale' => 'en',
                    'timezone' => 'Asia/Dhaka',
                    'activated_at' => now(),
                    'deactivated_at' => null,
                    'suspended_at' => null,
                    'suspension_reason' => null,
                    'archived_at' => null,
                ]
            );

            $tenant->settings()->updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                ],
                [
                    'date_format' => 'Y-m-d',
                    'time_format' => 'H:i',
                    'week_start' => 'monday',
                    'name_prefix' => null,
                    'name_suffix' => null,
                    'preferences' => [],
                ]
            );

            $tenant->branding()->updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                ],
                [
                    'display_name' => 'Xpert IT',
                    'logo_path' => null,
                    'favicon_path' => null,
                    'primary_color' => '#0D2B1D',
                    'secondary_color' => null,
                    'custom_styles' => [],
                ]
            );

            $tenant->featureFlags()->updateOrCreate(
                [
                    'key' => 'client_portal',
                ],
                [
                    'enabled' => false,
                    'config' => [],
                ]
            );

            $tenant->featureFlags()->updateOrCreate(
                [
                    'key' => 'ai_assistant',
                ],
                [
                    'enabled' => false,
                    'config' => [],
                ]
            );

            $tenantAdmin = User::updateOrCreate(
                [
                    'email' => 'admin@xpert-it.test',
                ],
                [
                    'name' => 'Xpert IT Admin',
                    'password' => Hash::make('password123'),
                    'is_platform_owner' => false,
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            TenantUser::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'user_id' => $tenantAdmin->id,
                ],
                [
                    'role' => 'admin',
                    'status' => 'active',
                    'joined_at' => now(),
                ]
            );
        });
    }
}
