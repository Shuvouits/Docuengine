<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasUuids, SoftDeletes;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_SUSPENDED = 'suspended';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'name',
        'slug',
        'status',
        'activated_at',
        'deactivated_at',
        'suspended_at',
        'suspension_reason',
        'archived_at',
        'locale',
        'timezone',
        'metadata',
    ];

    protected $casts = [
        'activated_at' => 'datetime',
        'deactivated_at' => 'datetime',
        'suspended_at' => 'datetime',
        'archived_at' => 'datetime',
        'metadata' => 'array',
        'deleted_at' => 'datetime',
    ];

    public static function statuses(): array
    {
        return [
            self::STATUS_ACTIVE,
            self::STATUS_INACTIVE,
            self::STATUS_SUSPENDED,
            self::STATUS_ARCHIVED,
        ];
    }

    public function settings()
    {
        return $this->hasOne(TenantSetting::class);
    }

    public function branding()
    {
        return $this->hasOne(TenantBranding::class);
    }

    public function featureFlags()
    {
        return $this->hasMany(TenantFeatureFlag::class);
    }

    public function tenantUsers()
    {
        return $this->hasMany(TenantUser::class);
    }

    public function users()
    {
        return $this->belongsToMany(
            User::class,
            'tenant_users'
        )
            ->withPivot([
                'role',
                'status',
                'joined_at',
            ])
            ->withTimestamps();
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isInactive(): bool
    {
        return $this->status === self::STATUS_INACTIVE;
    }

    public function isSuspended(): bool
    {
        return $this->status === self::STATUS_SUSPENDED;
    }

    public function isArchived(): bool
    {
        return $this->status === self::STATUS_ARCHIVED;
    }
}