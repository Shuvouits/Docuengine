<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetAttachment extends Model
{
    use HasUuids;

    public const TYPE_FILE = 'file';

    public const TYPE_PHOTO = 'photo';

    protected $fillable = [
        'tenant_id',
        'asset_id',
        'attachment_type',
        'original_name',
        'stored_name',
        'disk',
        'path',
        'mime_type',
        'extension',
        'size_bytes',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
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

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'uploaded_by'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant / Asset Scopes
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

    /*
    |--------------------------------------------------------------------------
    | Attachment Type Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeFiles(
        Builder $query
    ): Builder {
        return $query->where(
            'attachment_type',
            self::TYPE_FILE
        );
    }

    public function scopePhotos(
        Builder $query
    ): Builder {
        return $query->where(
            'attachment_type',
            self::TYPE_PHOTO
        );
    }

    public function scopeOfType(
        Builder $query,
        string $type
    ): Builder {
        return $query->where(
            'attachment_type',
            $type
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isFile(): bool
    {
        return $this->attachment_type ===
            self::TYPE_FILE;
    }

    public function isPhoto(): bool
    {
        return $this->attachment_type ===
            self::TYPE_PHOTO;
    }

    public function sizeInKilobytes(): float
    {
        return round(
            $this->size_bytes / 1024,
            2
        );
    }

    public function sizeInMegabytes(): float
    {
        return round(
            $this->size_bytes / 1024 / 1024,
            2
        );
    }
}
