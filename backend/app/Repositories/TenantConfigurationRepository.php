<?php

namespace App\Repositories;

use App\Models\Tenant;
use App\Models\TenantFeatureFlag;

class TenantConfigurationRepository
{
    public function getConfiguration(
        Tenant $tenant
    ): Tenant {
        /*
        |--------------------------------------------------------------------------
        | Sync Registered Feature Flags
        |--------------------------------------------------------------------------
        */

        $this->syncFeatureFlags($tenant);

        $registeredFlags = array_keys(
            config(
                'docuengine.feature_flags',
                []
            )
        );

        /*
        |--------------------------------------------------------------------------
        | Load Tenant Configuration
        |--------------------------------------------------------------------------
        */

        return $tenant->load([
            'settings',
            'branding',

            'featureFlags' => function ($query) use (
                $registeredFlags
            ) {
                if (empty($registeredFlags)) {
                    $query->whereRaw('1 = 0');

                    return;
                }

                $query
                    ->whereIn(
                        'key',
                        $registeredFlags
                    )
                    ->orderBy('key');
            },
        ]);
    }

    public function updateTenant(
        Tenant $tenant,
        array $data
    ): Tenant {
        $tenant->update($data);

        return $tenant->fresh();
    }

    public function updateSettings(
        Tenant $tenant,
        array $data
    ) {
        return $tenant
            ->settings()
            ->updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                ],
                $data
            );
    }

    public function updateBranding(
        Tenant $tenant,
        array $data
    ) {
        return $tenant
            ->branding()
            ->updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                ],
                $data
            );
    }


    public function findFeatureFlag(
    Tenant $tenant,
    string $key
) {
    return $tenant
        ->featureFlags()
        ->where('key', $key)
        ->first();
}


public function isFeatureEnabled(
    string $tenantId,
    string $key
): bool {
    $registeredFlags = config(
        'docuengine.feature_flags',
        []
    );

    if (!array_key_exists($key, $registeredFlags)) {
        return false;
    }

    $featureFlag = TenantFeatureFlag::query()
        ->where('tenant_id', $tenantId)
        ->where('key', $key)
        ->first();

    if ($featureFlag) {
        return (bool) $featureFlag->enabled;
    }

    return (bool) $registeredFlags[$key];
}


    public function updateFeatureFlag(
        Tenant $tenant,
        string $key,
        array $data
    ) {
        return $tenant
            ->featureFlags()
            ->updateOrCreate(
                [
                    'key' => $key,
                ],
                $data
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Sync Feature Registry With Tenant
    |--------------------------------------------------------------------------
    */

    private function syncFeatureFlags(
        Tenant $tenant
    ): void {
        $registeredFlags = config(
            'docuengine.feature_flags',
            []
        );

        foreach (
            $registeredFlags as $key => $defaultEnabled
        ) {
            $tenant
                ->featureFlags()
                ->firstOrCreate(
                    [
                        'key' => $key,
                    ],
                    [
                        'enabled' =>
                            (bool) $defaultEnabled,

                        'config' => [],
                    ]
                );
        }
    }
}
