<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetTag extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function assets(): BelongsToMany
    {
        return $this->belongsToMany(
            Asset::class,
            'asset_tag_assignments',
            'asset_tag_id',
            'asset_id'
        )
            ->withPivot([
                'id',
                'tenant_id',
                'created_by',
            ])
            ->withTimestamps();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'updated_by'
        );
    }

    public function scopeForTenant(
        Builder $query,
        string $tenantId
    ): Builder {
        return $query->where(
            'tenant_id',
            $tenantId
        );
    }
}
