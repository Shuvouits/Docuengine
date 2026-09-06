<?php

namespace App\Services\Tenant;

use App\Models\Tenant;
use RuntimeException;

class TenantContext
{
    protected ?Tenant $tenant = null;

    public function set(Tenant $tenant): void
    {
        $this->tenant = $tenant;
    }

    public function get(): ?Tenant
    {
        return $this->tenant;
    }

    public function id(): ?string
    {
        return $this->tenant?->id;
    }

    public function hasTenant(): bool
    {
        return $this->tenant !== null;
    }

    public function requireTenant(): Tenant
    {
        if (!$this->tenant) {
            throw new RuntimeException(
                'Tenant context has not been resolved.'
            );
        }

        return $this->tenant;
    }

    public function clear(): void
    {
        $this->tenant = null;
    }
}
