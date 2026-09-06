<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;

class TenantFeatureFlagSeeder extends Seeder
{
    public function run(): void
    {
        $featureFlags = config('docuengine.feature_flags', []);

        if (empty($featureFlags)) {
            return;
        }

        Tenant::query()
            ->whereNull('deleted_at')
            ->chunkById(100, function ($tenants) use ($featureFlags) {
                foreach ($tenants as $tenant) {
                    foreach ($featureFlags as $key => $enabled) {
                        $tenant->featureFlags()->firstOrCreate(
                            [
                                'key' => $key,
                            ],
                            [
                                'enabled' => (bool) $enabled,
                                'config' => [],
                            ]
                        );
                    }
                }
            });
    }
}
