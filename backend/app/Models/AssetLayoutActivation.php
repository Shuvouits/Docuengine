<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetLayoutActivation extends Model
{
    use HasUuids;

    protected $table = 'asset_layout_activations';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'tenant_id',
        'asset_layout_id',
        'company_id',
        'is_active',
        'activated_at',
        'activated_by',
        'deactivated_at',
        'deactivated_by',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'activated_at' => 'datetime',
            'deactivated_at' => 'datetime',
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





    public function company(): BelongsTo
{
    return $this->belongsTo(
        Company::class,
        'company_id'
    );
}





}
