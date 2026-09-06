<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantFeatureFlag extends Model
{
    protected $fillable = [
        'tenant_id',
        'key',
        'enabled',
        'config',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'config' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isEnabled(): bool
    {
        return $this->enabled === true;
    }
}
