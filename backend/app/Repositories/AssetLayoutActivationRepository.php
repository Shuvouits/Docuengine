<?php

namespace App\Repositories;

use App\Models\AssetLayoutActivation;
use Illuminate\Database\Eloquent\Collection;

class AssetLayoutActivationRepository
{
    public function getAllByCompany(
        string $tenantId,
        string $companyId
    ): Collection {
        return AssetLayoutActivation::query()
            ->where('tenant_id', $tenantId)
            ->where('company_id', $companyId)
            ->with('layout')
            ->orderByDesc('created_at')
            ->get();
    }

    public function getAllByLayout(
        string $tenantId,
        string $layoutId
    ): Collection {
        return AssetLayoutActivation::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function findById(
        string $tenantId,
        string $activationId
    ): ?AssetLayoutActivation {
        return AssetLayoutActivation::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $activationId)
            ->with('layout')
            ->first();
    }

    public function findByLayoutAndCompany(
        string $tenantId,
        string $layoutId,
        string $companyId
    ): ?AssetLayoutActivation {
        return AssetLayoutActivation::query()
            ->where('tenant_id', $tenantId)
            ->where('asset_layout_id', $layoutId)
            ->where('company_id', $companyId)
            ->with('layout')
            ->first();
    }

    public function create(array $data): AssetLayoutActivation
    {
        return AssetLayoutActivation::create($data);
    }

    public function update(
        AssetLayoutActivation $activation,
        array $data
    ): AssetLayoutActivation {
        $activation->update($data);

        return $activation->fresh(['layout']);
    }
}