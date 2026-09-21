<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditEvent extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

    /*
    |--------------------------------------------------------------------------
    | Actions
    |--------------------------------------------------------------------------
    */

    public const ACTION_CREATED = 'created';
    public const ACTION_VIEWED = 'viewed';
    public const ACTION_UPDATED = 'updated';
    public const ACTION_REVEALED = 'revealed';
    public const ACTION_SHARED = 'shared';
    public const ACTION_EXPORTED = 'exported';
    public const ACTION_ARCHIVED = 'archived';
    public const ACTION_RESTORED = 'restored';
    public const ACTION_DELETED = 'deleted';
    public const ACTION_PERMANENTLY_DELETED = 'permanently_deleted';

    public const ACTION_ACTIVATED = 'activated';
    public const ACTION_DEACTIVATED = 'deactivated';
    public const ACTION_REACTIVATED = 'reactivated';

    /*
    |--------------------------------------------------------------------------
    | Categories
    |--------------------------------------------------------------------------
    */

    public const CATEGORY_RESOURCE = 'resource';
    public const CATEGORY_ACCESS = 'access';
    public const CATEGORY_ARCHIVE = 'archive';
    public const CATEGORY_EXPORT = 'export';
    public const CATEGORY_SYSTEM = 'system';

    protected $fillable = [
        'tenant_id',
        'actor_user_id',
        'actor_snapshot',
        'action',
        'category',
        'target_type',
        'target_id',
        'target_label',
        'description',
        'changes',
        'metadata',
        'ip_address',
        'user_agent',
        'request_method',
        'request_path',
        'occurred_at',
    ];

    protected $casts = [
        'actor_snapshot' => 'array',
        'changes' => 'array',
        'metadata' => 'array',
        'occurred_at' => 'datetime',
        'created_at' => 'datetime',
    ];
}
