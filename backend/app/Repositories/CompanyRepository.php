<?php

namespace App\Repositories;

use App\Models\Company;

class CompanyRepository
{
    public function findById(
        string $tenantId,
        string $companyId
    ): ?Company {
        return Company::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $companyId)
            ->first();
    }

    public function findActiveById(
        string $tenantId,
        string $companyId
    ): ?Company {
        return Company::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $companyId)
            ->where('status', Company::STATUS_ACTIVE)
            ->first();
    }

    public function exists(
        string $tenantId,
        string $companyId
    ): bool {
        return Company::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $companyId)
            ->exists();
    }
}