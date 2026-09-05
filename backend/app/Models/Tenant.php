<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Tenant extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'status',
        'locale',
        'timezone',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

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

    public function users()
{
    return $this->belongsToMany(
        User::class,
        'tenant_user'
    )->withPivot('role')
     ->withTimestamps();
}


}
