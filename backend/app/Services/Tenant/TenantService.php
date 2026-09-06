<?php

namespace App\Services\Tenant;

use App\Models\Tenant;
use App\Repositories\TenantRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TenantService
{
    public function __construct(
        protected TenantRepository $tenantRepository
    ) {
    }

    public function getAll(): Collection
    {
        return $this->tenantRepository->all();
    }

    public function getById(string $id): ?Tenant
    {
        return $this->tenantRepository->findById($id);
    }

    public function create(array $data): Tenant
{
    return DB::transaction(function () use ($data) {
        $tenant = $this->tenantRepository->create([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'status' => Tenant::STATUS_ACTIVE,

            'locale' => $data['locale']
                ?? config('docuengine.tenant_defaults.locale'),

            'timezone' => $data['timezone']
                ?? config('docuengine.tenant_defaults.timezone'),

            'activated_at' => now(),
        ]);

        $tenant->settings()->create([
            'date_format' => config(
                'docuengine.tenant_defaults.date_format'
            ),

            'time_format' => config(
                'docuengine.tenant_defaults.time_format'
            ),

            'week_start' => config(
                'docuengine.tenant_defaults.week_start'
            ),
        ]);

        $tenant->branding()->create([
            'display_name' => $tenant->name,
        ]);

        foreach (
            config('docuengine.feature_flags', [])
            as $key => $enabled
        ) {
            $tenant->featureFlags()->create([
                'key' => $key,
                'enabled' => (bool) $enabled,
                'config' => [],
            ]);
        }

        return $tenant->fresh([
            'settings',
            'branding',
            'featureFlags',
        ]);
    });
}

    public function update(Tenant $tenant, array $data): Tenant
    {
        return $this->tenantRepository->update(
            $tenant,
            $data
        );
    }

    public function activate(Tenant $tenant): Tenant
    {
        return $this->tenantRepository->update($tenant, [
            'status' => Tenant::STATUS_ACTIVE,
            'activated_at' => now(),
            'deactivated_at' => null,
            'suspended_at' => null,
            'suspension_reason' => null,
            'archived_at' => null,
        ]);
    }

    public function deactivate(Tenant $tenant): Tenant
    {
        return $this->tenantRepository->update($tenant, [
            'status' => Tenant::STATUS_INACTIVE,
            'deactivated_at' => now(),
            'suspended_at' => null,
            'suspension_reason' => null,
            'archived_at' => null,
        ]);
    }

    public function suspend(
        Tenant $tenant,
        ?string $reason = null
    ): Tenant {
        return $this->tenantRepository->update($tenant, [
            'status' => Tenant::STATUS_SUSPENDED,
            'suspended_at' => now(),
            'suspension_reason' => $reason,
            'deactivated_at' => null,
            'archived_at' => null,
        ]);
    }

    public function archive(Tenant $tenant): Tenant
    {
        return $this->tenantRepository->update($tenant, [
            'status' => Tenant::STATUS_ARCHIVED,
            'archived_at' => now(),
        ]);
    }

    public function delete(Tenant $tenant): bool
    {
        return $this->tenantRepository->delete($tenant);
    }
}
