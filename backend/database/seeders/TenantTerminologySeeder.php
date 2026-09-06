<?php

namespace Database\Seeders;

use App\Models\TenantSetting;
use Illuminate\Database\Seeder;

class TenantTerminologySeeder extends Seeder
{
    public function run(): void
    {
        $defaults = config('docuengine.terminology_defaults', []);

        if (empty($defaults)) {
            return;
        }

        TenantSetting::query()
            ->chunkById(100, function ($settings) use ($defaults) {
                foreach ($settings as $setting) {
                    $existing = $setting->terminology;

                    if (is_string($existing)) {
                        $decoded = json_decode($existing, true);

                        $existing = is_array($decoded)
                            ? $decoded
                            : [];
                    }

                    if (!is_array($existing)) {
                        $existing = [];
                    }

                    $merged = array_merge(
                        $defaults,
                        $existing
                    );

                    if ($merged !== $existing) {
                        $setting->update([
                            'terminology' => $merged,
                        ]);
                    }
                }
            });
    }
}
