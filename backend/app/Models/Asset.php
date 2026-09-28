<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasUuids;
    use SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | Status Constants
    |--------------------------------------------------------------------------
    */

    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    /*
    |--------------------------------------------------------------------------
    | Data Source Constants
    |--------------------------------------------------------------------------
    */

    public const DATA_SOURCE_MANUAL = 'manual';

    public const DATA_SOURCE_INTEGRATION = 'integration';

    public const DATA_SOURCE_MIXED = 'mixed';

    /*
    |--------------------------------------------------------------------------
    | Lifecycle Constants
    |--------------------------------------------------------------------------
    */

    public const LIFECYCLE_ACTIVE = 'active';

    public const LIFECYCLE_IN_STOCK = 'in_stock';

    public const LIFECYCLE_ASSIGNED = 'assigned';

    public const LIFECYCLE_MAINTENANCE = 'maintenance';

    public const LIFECYCLE_RETIRED = 'retired';

    public const LIFECYCLE_DECOMMISSIONED = 'decommissioned';

    /*
    |--------------------------------------------------------------------------
    | Fillable Fields
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'tenant_id',
        'company_id',
        'asset_layout_id',
        'asset_layout_version_id',
        'name',
        'status',
        'owner_user_id',
        'assigned_user_id',
        'data_source',
        'warranty_provider',
        'warranty_start_date',
        'warranty_expiration_date',
        'lifecycle_status',
        'notes',
        'created_by',
        'updated_by',
    ];

    /*
    |--------------------------------------------------------------------------
    | Casts
    |--------------------------------------------------------------------------
    */

    protected function casts(): array
    {
        return [
            'warranty_start_date' => 'date',
            'warranty_expiration_date' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function company(): BelongsTo
    {
        return $this->belongsTo(
            Company::class,
            'company_id'
        );
    }

    public function layout(): BelongsTo
    {
        return $this->belongsTo(
            AssetLayout::class,
            'asset_layout_id'
        );
    }

    public function layoutVersion(): BelongsTo
    {
        return $this->belongsTo(
            AssetLayoutVersion::class,
            'asset_layout_version_id'
        );
    }

    public function fieldValues(): HasMany
    {
        return $this->hasMany(
            AssetFieldValue::class,
            'asset_id'
        );
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'owner_user_id'
        );
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'assigned_user_id'
        );
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'updated_by'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeForTenant(
        Builder $query,
        string $tenantId
    ): Builder {
        return $query->where(
            'tenant_id',
            $tenantId
        );
    }

    public function scopeForCompany(
        Builder $query,
        string $companyId
    ): Builder {
        return $query->where(
            'company_id',
            $companyId
        );
    }

    public function scopeForLayout(
        Builder $query,
        string $layoutId
    ): Builder {
        return $query->where(
            'asset_layout_id',
            $layoutId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Status Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(
        Builder $query
    ): Builder {
        return $query->where(
            'status',
            self::STATUS_ACTIVE
        );
    }

    public function scopeInactive(
        Builder $query
    ): Builder {
        return $query->where(
            'status',
            self::STATUS_INACTIVE
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isActive(): bool
    {
        return $this->status ===
            self::STATUS_ACTIVE;
    }

    public function isManual(): bool
    {
        return $this->data_source ===
            self::DATA_SOURCE_MANUAL;
    }

    public function isIntegrationSourced(): bool
    {
        return $this->data_source ===
            self::DATA_SOURCE_INTEGRATION;
    }

    public function isMixedSource(): bool
    {
        return $this->data_source ===
            self::DATA_SOURCE_MIXED;
    }
}
