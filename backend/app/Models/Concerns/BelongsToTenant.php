<?php

namespace App\Models\Concerns;

use App\Models\Scopes\TenantScope;
use App\Models\Tenant;
use App\Services\Tenant\TenantContext;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use RuntimeException;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function ($model) {
            $tenantContext = app(TenantContext::class);

            if ($tenantContext->hasTenant()) {
                $currentTenantId = $tenantContext->id();

                if (
                    !empty($model->tenant_id) &&
                    $model->tenant_id !== $currentTenantId
                ) {
                    throw new RuntimeException(
                        'The record tenant does not match the current tenant context.'
                    );
                }

                $model->tenant_id = $currentTenantId;

                return;
            }

            if (empty($model->tenant_id)) {
                throw new RuntimeException(
                    'Tenant context is required to create this record.'
                );
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
