<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetLayoutSection extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'asset_layout_sections';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'tenant_id',
        'asset_layout_id',
        'name',
        'description',
        'sort_order',
        'columns',
        'is_collapsible',
        'is_collapsed_by_default',
        'is_visible',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'columns' => 'integer',
            'is_collapsible' => 'boolean',
            'is_collapsed_by_default' => 'boolean',
            'is_visible' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function layout(): BelongsTo
    {
        return $this->belongsTo(
            AssetLayout::class,
            'asset_layout_id'
        );
    }

    public function fields(): HasMany
    {
        return $this->hasMany(
            AssetLayoutField::class,
            'section_id'
        )->orderBy('sort_order');
    }
}
