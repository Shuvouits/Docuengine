<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AccessReviewItem extends Model
{
    use HasUuids;

    public const DECISION_PENDING = 'pending';
    public const DECISION_RETAIN = 'retain';
    public const DECISION_REVOKE = 'revoke';
    public const DECISION_CHANGE_ROLE = 'change_role';

    protected $fillable = [
        'access_review_id',
        'tenant_id',
        'tenant_user_id',
        'subject_user_id',
        'decision',
        'current_role',
        'requested_role',
        'reviewed_by_user_id',
        'reviewed_at',
        'decision_notes',
        'access_snapshot',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'access_snapshot' => 'array',
    ];

    public function accessReview()
    {
        return $this->belongsTo(
            AccessReview::class
        );
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function tenantUser()
    {
        return $this->belongsTo(
            TenantUser::class
        );
    }

    public function subject()
    {
        return $this->belongsTo(
            User::class,
            'subject_user_id'
        );
    }

    public function reviewedBy()
    {
        return $this->belongsTo(
            User::class,
            'reviewed_by_user_id'
        );
    }

    public function isPending(): bool
    {
        return $this->decision === self::DECISION_PENDING;
    }
}
