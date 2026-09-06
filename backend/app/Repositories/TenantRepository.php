<?php

namespace App\Repositories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Collection;

class TenantRepository
{
    public function all(): Collection
    {
        return Tenant::query()
            ->with([
                'settings',
                'branding',
                'featureFlags',
            ])
            ->latest()
            ->get();
    }

    public function findById(string $id): ?Tenant
    {
        return Tenant::query()
            ->with([
                'settings',
                'branding',
                'featureFlags',
            ])
            ->find($id);
    }

    public function create(array $data): Tenant
    {
        return Tenant::create($data);
    }

    public function update(Tenant $tenant, array $data): Tenant
    {
        $tenant->update($data);

        return $tenant->fresh([
            'settings',
            'branding',
            'featureFlags',
        ]);
    }

    public function delete(Tenant $tenant): bool
    {
        return $tenant->delete();
    }
}
