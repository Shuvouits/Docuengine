<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMfaSetting extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'enabled',
        'secret_encrypted',
        'recovery_codes_encrypted',
        'confirmed_at',
        'last_used_at',
    ];

    protected $casts = [
        'enabled' => 'boolean',

        'secret_encrypted' => 'encrypted',

        'recovery_codes_encrypted' =>
            'encrypted:array',

        'confirmed_at' => 'datetime',

        'last_used_at' => 'datetime',
    ];

    protected $hidden = [
        'secret_encrypted',
        'recovery_codes_encrypted',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public function isEnabled(): bool
    {
        return $this->enabled === true
            && $this->confirmed_at !== null
            && !empty($this->secret_encrypted);
    }
}
