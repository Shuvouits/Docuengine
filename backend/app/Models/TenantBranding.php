<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantBranding extends Model
{
    protected $fillable = [
        'tenant_id',
        'display_name',
        'logo_path',
        'favicon_path',
        'primary_color',
        'secondary_color',
        'custom_styles',
    ];

    protected $casts = [
        'custom_styles' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
