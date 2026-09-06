<?php

namespace App\Repositories;

use App\Models\Tenant;

class TenantConfigurationRepository
{
    public function getConfiguration(Tenant $tenant): Tenant
    {
        return $tenant->load([
            'settings',
            'branding',
            'featureFlags',
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
        return $tenant->settings()
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
        return $tenant->branding()
            ->updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                ],
                $data
            );
    }

    public function updateFeatureFlag(
        Tenant $tenant,
        string $key,
        array $data
    ) {
        return $tenant->featureFlags()
            ->updateOrCreate(
                [
                    'key' => $key,
                ],
                $data
            );
    }
}
