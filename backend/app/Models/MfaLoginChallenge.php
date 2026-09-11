<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MfaLoginChallenge extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'token_hash',
        'expires_at',
        'verified_at',
        'failed_attempts',
        'ip_address',
        'user_agent',
    ];

    protected $hidden = [
        'token_hash',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'failed_attempts' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public function isExpired(): bool
    {
        return !$this->expires_at
            || now()->greaterThanOrEqualTo(
                $this->expires_at
            );
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function hasExceededAttempts(): bool
    {
        return $this->failed_attempts >= (int) config(
            'mfa.max_failed_attempts',
            5
        );
    }

    public function canBeUsed(): bool
    {
        return !$this->isExpired()
            && !$this->isVerified()
            && !$this->hasExceededAttempts();
    }
}
