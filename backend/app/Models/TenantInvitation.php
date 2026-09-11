<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TenantInvitation extends Model
{
    use HasUuids;

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REVOKED = 'revoked';
    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'role_id',
        'token_hash',
        'status',
        'expires_at',
        'accepted_at',
        'revoked_at',
        'invited_by',
    ];

    protected $hidden = [
        'token_hash',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function role()
    {
        return $this->belongsTo(
            \Spatie\Permission\Models\Role::class,
            'role_id'
        );
    }

    public function invitedBy()
    {
        return $this->belongsTo(
            User::class,
            'invited_by'
        );
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isAccepted(): bool
    {
        return $this->status === self::STATUS_ACCEPTED;
    }

    public function isRevoked(): bool
    {
        return $this->status === self::STATUS_REVOKED;
    }

    public function isExpired(): bool
    {
        if (
            $this->status === self::STATUS_EXPIRED
        ) {
            return true;
        }

        return $this->expires_at?->isPast() === true;
    }

    public function canBeAccepted(): bool
    {
        return $this->isPending()
            && !$this->isExpired()
            && !$this->isRevoked();
    }
}
