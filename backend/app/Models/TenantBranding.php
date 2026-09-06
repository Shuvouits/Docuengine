<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    protected $appends = [
        'logo_url',
        'favicon_url',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) {
            return null;
        }

        return asset(
            ltrim($this->logo_path, '/')
        );
    }

    public function getFaviconUrlAttribute(): ?string
    {
        if (!$this->favicon_path) {
            return null;
        }

        return asset(
            ltrim($this->favicon_path, '/')
        );
    }
}
