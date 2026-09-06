<?php

namespace App\Policies;

use App\Models\TenantTestRecord;
use App\Models\User;
use App\Services\Tenant\TenantContext;

class TenantTestRecordPolicy
{
    public function viewAny(User $user): bool
    {
        $tenantId = app(TenantContext::class)->id();

        if (!$tenantId) {
            return false;
        }

        return $user->hasTenantAccess($tenantId);
    }

    public function view(
        User $user,
        TenantTestRecord $record
    ): bool {
        $tenantId = app(TenantContext::class)->id();

        if (!$tenantId) {
            return false;
        }

        return $record->tenant_id === $tenantId
            && $user->hasTenantAccess($tenantId);
    }

    public function create(User $user): bool
    {
        $tenantId = app(TenantContext::class)->id();

        if (!$tenantId) {
            return false;
        }

        return $user->hasTenantAccess($tenantId);
    }

    public function update(
        User $user,
        TenantTestRecord $record
    ): bool {
        $tenantId = app(TenantContext::class)->id();

        if (!$tenantId) {
            return false;
        }

        return $record->tenant_id === $tenantId
            && $user->hasTenantAccess($tenantId);
    }

    public function delete(
        User $user,
        TenantTestRecord $record
    ): bool {
        $tenantId = app(TenantContext::class)->id();

        if (!$tenantId) {
            return false;
        }

        return $record->tenant_id === $tenantId
            && $user->hasTenantAccess($tenantId);
    }
}



