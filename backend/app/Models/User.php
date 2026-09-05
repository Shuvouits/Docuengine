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
            'tenant_user'
        )->withPivot('role')
         ->withTimestamps();
    }

    public function isPlatformOwner(): bool
    {
        return $this->is_platform_owner;
    }

    public function getJWTIdentifier()
{
    return $this->getKey();
}

public function getJWTCustomClaims()
{
    return [];
}


}
