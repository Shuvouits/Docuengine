<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuthSession extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'jti_hash',
        'ip_address',
        'user_agent',
        'device_name',
        'last_activity_at',
        'expires_at',
        'revoked_at',
        'revoke_reason',
    ];

    protected $hidden = [
        'jti_hash',
    ];

    protected $casts = [
        'last_activity_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    public function isExpired(): bool
    {
        return !$this->expires_at
            || now()->greaterThanOrEqualTo(
                $this->expires_at
            );
    }

    public function isActive(): bool
    {
        return !$this->isRevoked()
            && !$this->isExpired();
    }
}
