<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetFieldValue extends Model
{
    use HasUuids;

    /*
    |--------------------------------------------------------------------------
    | Data Source Constants
    |--------------------------------------------------------------------------
    */

    public const DATA_SOURCE_MANUAL = 'manual';

    public const DATA_SOURCE_INTEGRATION = 'integration';

    /*
    |--------------------------------------------------------------------------
    | Fillable Fields
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'tenant_id',
        'asset_id',
        'asset_layout_field_id',
        'field_key',
        'field_type',
        'value_text',
        'value_number',
        'value_datetime',
        'value_boolean',
        'value_json',
        'data_source',
        'source_provider',
        'source_reference',
        'created_by',
        'updated_by',
    ];

    /*
    |--------------------------------------------------------------------------
    | Casts
    |--------------------------------------------------------------------------
    */

    protected function casts(): array
    {
        return [
            'value_number' => 'decimal:6',
            'value_datetime' => 'datetime',
            'value_boolean' => 'boolean',
            'value_json' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function asset(): BelongsTo
    {
        return $this->belongsTo(
            Asset::class,
            'asset_id'
        );
    }

    public function layoutField(): BelongsTo
    {
        return $this->belongsTo(
            AssetLayoutField::class,
            'asset_layout_field_id'
        );
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

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeForTenant(
        Builder $query,
        string $tenantId
    ): Builder {
        return $query->where(
            'tenant_id',
            $tenantId
        );
    }

    public function scopeForAsset(
        Builder $query,
        string $assetId
    ): Builder {
        return $query->where(
            'asset_id',
            $assetId
        );
    }

    public function scopeForField(
        Builder $query,
        string $fieldId
    ): Builder {
        return $query->where(
            'asset_layout_field_id',
            $fieldId
        );
    }

    public function scopeManual(
        Builder $query
    ): Builder {
        return $query->where(
            'data_source',
            self::DATA_SOURCE_MANUAL
        );
    }

    public function scopeIntegration(
        Builder $query
    ): Builder {
        return $query->where(
            'data_source',
            self::DATA_SOURCE_INTEGRATION
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isManual(): bool
    {
        return $this->data_source ===
            self::DATA_SOURCE_MANUAL;
    }

    public function isIntegrationSourced(): bool
    {
        return $this->data_source ===
            self::DATA_SOURCE_INTEGRATION;
    }
}
