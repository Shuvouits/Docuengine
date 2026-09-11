<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable implements JWTSubject
{
    use HasUuids, SoftDeletes, Notifiable, HasRoles;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_SUSPENDED = 'suspended';

    protected string $guard_name = 'api';

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_platform_owner',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_platform_owner' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    public function tenants()
    {
        return $this->belongsToMany(
            Tenant::class,
            'tenant_users'
        )
            ->withPivot([
                'role',
                'status',
                'joined_at',
            ])
            ->withTimestamps();
    }

    public function tenantMemberships()
    {
        return $this->hasMany(TenantUser::class);
    }

    public function isPlatformOwner(): bool
    {
        return $this->is_platform_owner === true;
    }

    public function isTenantAdmin(string $tenantId): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        return $this->tenantMemberships()
            ->where('tenant_id', $tenantId)
            ->where('role', 'admin')
            ->where('status', 'active')
            ->exists();
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function hasTenantAccess(string $tenantId): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        if ($this->isPlatformOwner()) {
            return true;
        }

        return $this->tenantMemberships()
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->exists();
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }


    public function securityGroups(): BelongsToMany
{
    return $this->belongsToMany(
        SecurityGroup::class,
        'security_group_users',
        'user_id',
        'security_group_id'
    )
        ->withPivot([
            'id',
            'tenant_id',
        ])
        ->withTimestamps();
}

public function securityGroupMemberships(): HasMany
{
    return $this->hasMany(
        SecurityGroupUser::class,
        'user_id'
    );
}


public function mfaSetting()
{
    return $this->hasOne(
        UserMfaSetting::class,
        'user_id'
    );
}


public function hasMfaEnabled()
{
    return $this->mfaSetting?->isEnabled() ?? false;
}


public function authSessions()
{
    return $this->hasMany(
        AuthSession::class,
        'user_id'
    );
}



}
