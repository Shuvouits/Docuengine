<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityGroupResourceRestriction extends Model
{
    use HasUuids;

    public const ACCESS_VIEW = 'view';
    public const ACCESS_EDIT = 'edit';
    public const ACCESS_MANAGE = 'manage';

    protected $fillable = [
        'tenant_id',
        'security_group_id',
        'resource_type',
        'resource_id',
        'access_level',
        'created_by',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(
            Tenant::class,
            'tenant_id'
        );
    }

    public function securityGroup(): BelongsTo
    {
        return $this->belongsTo(
            SecurityGroup::class,
            'security_group_id'
        );
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public static function accessLevels(): array
    {
        return [
            self::ACCESS_VIEW,
            self::ACCESS_EDIT,
            self::ACCESS_MANAGE,
        ];
    }
}
