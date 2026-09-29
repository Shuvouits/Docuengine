<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetRelationship extends Model
{
    use HasUuids;

    public const TYPE_RELATED_TO = 'related_to';
    public const TYPE_DEPENDS_ON = 'depends_on';
    public const TYPE_CONNECTED_TO = 'connected_to';
    public const TYPE_BACKUP_OF = 'backup_of';
    public const TYPE_HOSTED_ON = 'hosted_on';
    public const TYPE_MANAGED_BY = 'managed_by';

    protected $fillable = [
        'tenant_id',
        'source_asset_id',
        'related_asset_id',
        'relationship_type',
        'label',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function sourceAsset(): BelongsTo
    {
        return $this->belongsTo(
            Asset::class,
            'source_asset_id'
        );
    }

    public function relatedAsset(): BelongsTo
    {
        return $this->belongsTo(
            Asset::class,
            'related_asset_id'
        );
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
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

    public function scopeForSourceAsset(
        Builder $query,
        string $assetId
    ): Builder {
        return $query->where(
            'source_asset_id',
            $assetId
        );
    }

    public function scopeForRelatedAsset(
        Builder $query,
        string $assetId
    ): Builder {
        return $query->where(
            'related_asset_id',
            $assetId
        );
    }

    public function scopeForAsset(
        Builder $query,
        string $assetId
    ): Builder {
        return $query->where(
            function (Builder $relationshipQuery) use (
                $assetId
            ) {
                $relationshipQuery
                    ->where(
                        'source_asset_id',
                        $assetId
                    )
                    ->orWhere(
                        'related_asset_id',
                        $assetId
                    );
            }
        );
    }

    public function scopeOfType(
        Builder $query,
        string $relationshipType
    ): Builder {
        return $query->where(
            'relationship_type',
            $relationshipType
        );
    }

    public static function relationshipTypes(): array
    {
        return [
            self::TYPE_RELATED_TO,
            self::TYPE_DEPENDS_ON,
            self::TYPE_CONNECTED_TO,
            self::TYPE_BACKUP_OF,
            self::TYPE_HOSTED_ON,
            self::TYPE_MANAGED_BY,
        ];
    }
}
