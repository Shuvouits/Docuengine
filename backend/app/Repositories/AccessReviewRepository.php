<?php

namespace App\Repositories;

use App\Models\AccessReview;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AccessReviewRepository
{
    public function paginateByTenant(
        string $tenantId,
        array $filters = [],
        int $perPage = 25
    ): LengthAwarePaginator {
        return AccessReview::query()
            ->with([
                'reviewer:id,name,email',
                'createdBy:id,name,email',
            ])
            ->withCount('items')
            ->where('tenant_id', $tenantId)
            ->when(
                !empty($filters['status']),
                fn ($query) => $query->where(
                    'status',
                    $filters['status']
                )
            )
            ->when(
                !empty($filters['reviewer_user_id']),
                fn ($query) => $query->where(
                    'reviewer_user_id',
                    $filters['reviewer_user_id']
                )
            )
            ->when(
                !empty($filters['search']),
                function ($query) use ($filters) {
                    $search = trim($filters['search']);

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where(
                                'name',
                                'like',
                                '%' . $search . '%'
                            )
                            ->orWhere(
                                'notes',
                                'like',
                                '%' . $search . '%'
                            );
                    });
                }
            )
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findByTenantAndId(
        string $tenantId,
        string $reviewId
    ): ?AccessReview {
        return AccessReview::query()
            ->with([
                'reviewer:id,name,email',
                'createdBy:id,name,email',
                'items.subject:id,name,email,status',
                'items.reviewedBy:id,name,email',
                'items.tenantUser',
            ])
            ->where('tenant_id', $tenantId)
            ->whereKey($reviewId)
            ->first();
    }

    public function create(
        array $data
    ): AccessReview {
        return AccessReview::create($data);
    }

    public function update(
        AccessReview $accessReview,
        array $data
    ): AccessReview {
        $accessReview->update($data);

        return $accessReview->fresh([
            'reviewer:id,name,email',
            'createdBy:id,name,email',
        ]);
    }
}
