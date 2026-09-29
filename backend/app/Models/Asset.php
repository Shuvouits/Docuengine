<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasUuids;
    use SoftDeletes;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    public const DATA_SOURCE_MANUAL = 'manual';
    public const DATA_SOURCE_INTEGRATION = 'integration';
    public const DATA_SOURCE_MIXED = 'mixed';

    public const LIFECYCLE_ACTIVE = 'active';
    public const LIFECYCLE_IN_STOCK = 'in_stock';
    public const LIFECYCLE_ASSIGNED = 'assigned';
    public const LIFECYCLE_MAINTENANCE = 'maintenance';
    public const LIFECYCLE_RETIRED = 'retired';
    public const LIFECYCLE_DECOMMISSIONED = 'decommissioned';

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

    public static function statuses(): array
    {
        return [
            self::STATUS_ACTIVE,
            self::STATUS_INACTIVE,
        ];
    }

    public static function dataSources(): array
    {
        return [
            self::DATA_SOURCE_MANUAL,
            self::DATA_SOURCE_INTEGRATION,
            self::DATA_SOURCE_MIXED,
        ];
    }

    public static function lifecycleStatuses(): array
    {
        return [
            self::LIFECYCLE_ACTIVE,
            self::LIFECYCLE_IN_STOCK,
            self::LIFECYCLE_ASSIGNED,
            self::LIFECYCLE_MAINTENANCE,
            self::LIFECYCLE_RETIRED,
            self::LIFECYCLE_DECOMMISSIONED,
        ];
    }

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

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(
            AssetTag::class,
            'asset_tag_assignments',
            'asset_id',
            'asset_tag_id'
        )
            ->withPivot([
                'id',
                'tenant_id',
                'created_by',
            ])
            ->withTimestamps();
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(
            AssetAttachment::class,
            'asset_id'
        );
    }

    public function files(): HasMany
    {
        return $this
            ->hasMany(
                AssetAttachment::class,
                'asset_id'
            )
            ->where(
                'attachment_type',
                AssetAttachment::TYPE_FILE
            );
    }

    public function photos(): HasMany
    {
        return $this
            ->hasMany(
                AssetAttachment::class,
                'asset_id'
            )
            ->where(
                'attachment_type',
                AssetAttachment::TYPE_PHOTO
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

    public function scopeOwnedBy(
        Builder $query,
        string $userId
    ): Builder {
        return $query->where(
            'owner_user_id',
            $userId
        );
    }

    public function scopeAssignedTo(
        Builder $query,
        string $userId
    ): Builder {
        return $query->where(
            'assigned_user_id',
            $userId
        );
    }

    public function scopeFromDataSource(
        Builder $query,
        string $dataSource
    ): Builder {
        return $query->where(
            'data_source',
            $dataSource
        );
    }

    public function scopeWithLifecycleStatus(
        Builder $query,
        string $lifecycleStatus
    ): Builder {
        return $query->where(
            'lifecycle_status',
            $lifecycleStatus
        );
    }

    public function isActive(): bool
    {
        return $this->status ===
            self::STATUS_ACTIVE;
    }

    public function isInactive(): bool
    {
        return $this->status ===
            self::STATUS_INACTIVE;
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

    public function hasOwner(): bool
    {
        return $this->owner_user_id !== null;
    }

    public function isAssigned(): bool
    {
        return $this->assigned_user_id !== null;
    }

    public function hasWarranty(): bool
    {
        return $this->warranty_expiration_date !== null;
    }

    public function hasActiveWarranty(): bool
    {
        return $this->warranty_expiration_date !== null &&
            $this->warranty_expiration_date->isTodayOrAfter();
    }

    public function hasExpiredWarranty(): bool
    {
        return $this->warranty_expiration_date !== null &&
            $this->warranty_expiration_date->isBefore(
                now()->startOfDay()
            );
    }
}
