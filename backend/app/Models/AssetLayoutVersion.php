<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetLayoutVersion extends Model
{
    use HasUuids;

    protected $table = 'asset_layout_versions';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'asset_layout_id',
        'version_number',
        'schema_snapshot',
        'change_summary',
        'created_by',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'version_number' => 'integer',
            'schema_snapshot' => 'array',
            'created_at' => 'datetime',
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
}
