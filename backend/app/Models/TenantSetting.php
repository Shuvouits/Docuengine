<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantSetting extends Model
{
    protected $fillable = [
        'tenant_id',
        'date_format',
        'time_format',
        'name_prefix',
        'name_suffix',
        'preferences',
    ];

    protected $casts = [
        'preferences' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
