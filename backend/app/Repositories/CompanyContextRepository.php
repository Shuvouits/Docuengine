<?php

namespace App\Repositories;

use App\Models\TenantUser;

class CompanyContextRepository
{
    public function findMembership(
        string $tenantId,
        string $userId
    ): ?TenantUser {
        return TenantUser::query()
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'user_id',
                $userId
            )
            ->first();
    }

    public function updateCurrentCompany(
        TenantUser $membership,
        ?string $companyId
    ): TenantUser {
        $membership->update([
            'current_company_id' =>
                $companyId,
        ]);

        return $membership->fresh();
    }

    public function clearCurrentCompany(
        TenantUser $membership
    ): TenantUser {
        return $this->updateCurrentCompany(
            $membership,
            null
        );
    }

    public function clearCompanySelections(
        string $tenantId,
        string $companyId
    ): int {
        return TenantUser::query()
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'current_company_id',
                $companyId
            )
            ->update([
                'current_company_id' =>
                    null,
            ]);
    }
}
