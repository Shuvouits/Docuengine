<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityGroupUser extends Model
{
    protected $table = 'security_group_users';

    protected $fillable = [
        'tenant_id',
        'security_group_id',
        'user_id',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }


    
}
