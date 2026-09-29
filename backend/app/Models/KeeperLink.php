<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KeeperLink extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'company_id',
        'name',
        'username_hint',
        'keeper_uid',
        'record_url',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function company(): BelongsTo
    {
        return $this->belongsTo(
            Company::class,
            'company_id'
        );
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'updated_by'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeForTenant(
        Builder $query,
        string $tenantId
    ): Builder {
        return $query->where(
            'tenant_id',
            $tenantId
        );
    }

    public function scopeForCompany(
        Builder $query,
        string $companyId
    ): Builder {
        return $query->where(
            'company_id',
            $companyId
        );
    }

    public function scopeSearch(
        Builder $query,
        string $search
    ): Builder {
        $search = trim($search);

        if ($search === '') {
            return $query;
        }

        return $query->where(
            function (Builder $query) use ($search) {
                $query
                    ->where(
                        'name',
                        'like',
                        '%' . $search . '%'
                    )
                    ->orWhere(
                        'username_hint',
                        'like',
                        '%' . $search . '%'
                    )
                    ->orWhere(
                        'keeper_uid',
                        'like',
                        '%' . $search . '%'
                    );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function hasRecordUrl(): bool
    {
        return $this->record_url !== null &&
            trim($this->record_url) !== '';
    }

    public function hasKeeperUid(): bool
    {
        return $this->keeper_uid !== null &&
            trim($this->keeper_uid) !== '';
    }

    public function hasUsernameHint(): bool
    {
        return $this->username_hint !== null &&
            trim($this->username_hint) !== '';
    }

    public function isCompanyLinked(): bool
    {
        return $this->company_id !== null;
    }
}
