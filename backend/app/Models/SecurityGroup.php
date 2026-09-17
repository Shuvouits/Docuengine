<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SecurityGroup extends Model
{
    use HasUuids;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'is_system',
        'created_by',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(
            Tenant::class,
            'tenant_id'
        );
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'security_group_users',
            'security_group_id',
            'user_id'
        )
            ->withPivot([
                'id',
                'tenant_id',
            ])
            ->withTimestamps();
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(
            SecurityGroupUser::class,
            'security_group_id'
        );
    }

    public function resourceRestrictions(): HasMany
    {
        return $this->hasMany(
            SecurityGroupResourceRestriction::class,
            'security_group_id'
        );
    }

    public function scopeForTenant(
        $query,
        string $tenantId
    ) {
        return $query->where(
            'tenant_id',
            $tenantId
        );
    }

    public function isSystem(): bool
    {
        return $this->is_system === true;
    }
}