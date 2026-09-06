<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantSetting extends Model
{
    protected $fillable = [
        'tenant_id',
        'date_format',
        'time_format',
        'week_start',
        'name_prefix',
        'name_suffix',
        'terminology',
        'preferences',
    ];

    protected $casts = [
        'terminology' => 'array',
        'preferences' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
