<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasUuids, SoftDeletes, Notifiable;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_SUSPENDED = 'suspended';

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

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
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


}
