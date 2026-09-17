<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ArchiveEntry extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'resource_type',
        'resource_id',
        'resource_label',
        'archived_by_user_id',
        'actor_snapshot',
        'reason',
        'metadata',
        'archived_at',
        'restored_at',
        'restored_by_user_id',
        'permanently_deleted_at',
        'permanently_deleted_by_user_id',
    ];

    protected $casts = [
        'actor_snapshot' => 'array',
        'metadata' => 'array',
        'archived_at' => 'datetime',
        'restored_at' => 'datetime',
        'permanently_deleted_at' => 'datetime',
    ];

    public function isArchived(): bool
    {
        return $this->restored_at === null
            && $this->permanently_deleted_at === null;
    }

    public function isRestored(): bool
    {
        return $this->restored_at !== null;
    }

    public function isPermanentlyDeleted(): bool
    {
        return $this->permanently_deleted_at !== null;
    }
}
