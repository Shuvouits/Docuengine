<?php

namespace App\Repositories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Collection;

class TenantRepository
{
    /**
     * Get all tenants.
     */
    public function all(): Collection
    {
        return Tenant::query()
            ->latest()
            ->get();
    }

    /**
     * Find tenant by ID.
     */
    public function findById(string $id): ?Tenant
    {
        return Tenant::find($id);
    }

    /**
     * Create a new tenant.
     */
    public function create(array $data): Tenant
    {
        return Tenant::create($data);
    }

    /**
     * Update an existing tenant.
     */
    public function update(Tenant $tenant, array $data): Tenant
    {
        $tenant->update($data);

        return $tenant->fresh();
    }

    /**
     * Delete a tenant.
     */
    public function delete(Tenant $tenant): bool
    {
        return $tenant->delete();
    }
}
