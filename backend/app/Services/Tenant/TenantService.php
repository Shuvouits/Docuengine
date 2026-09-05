<?php

namespace App\Services\Tenant;

use App\Models\Tenant;
use App\Repositories\TenantRepository;
use Illuminate\Database\Eloquent\Collection;

class TenantService
{
    public function __construct(
        protected TenantRepository $tenantRepository
    ) {
    }

    /**
     * Get all tenants.
     */
    public function getAll(): Collection
    {
        return $this->tenantRepository->all();
    }

    /**
     * Get a tenant by ID.
     */
    public function getById(string $id): ?Tenant
    {
        return $this->tenantRepository->findById($id);
    }

    /**
     * Create a new tenant.
     */
    public function create(array $data): Tenant
    {
        return $this->tenantRepository->create($data);
    }

    /**
     * Update an existing tenant.
     */
    public function update(Tenant $tenant, array $data): Tenant
    {
        return $this->tenantRepository->update($tenant, $data);
    }

    /**
     * Delete a tenant.
     */
    public function delete(Tenant $tenant): bool
    {
        return $this->tenantRepository->delete($tenant);
    }
}
