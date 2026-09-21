<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetLayout extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'asset_layouts';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'description',
        'status',
        'current_version',
        'is_template',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'current_version' => 'integer',
            'is_template' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Statuses
    |--------------------------------------------------------------------------
    */

    public const STATUS_DRAFT = 'draft';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function sections(): HasMany
    {
        return $this->hasMany(
            AssetLayoutSection::class,
            'asset_layout_id'
        )->orderBy('sort_order');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(
            AssetLayoutField::class,
            'asset_layout_id'
        )->orderBy('sort_order');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(
            AssetLayoutVersion::class,
            'asset_layout_id'
        )->orderByDesc('version_number');
    }

    public function activations(): HasMany
    {
        return $this->hasMany(
            AssetLayoutActivation::class,
            'asset_layout_id'
        );
    }
}
