<?php

namespace App\Repositories;

use App\Models\AccessReview;
use App\Models\AccessReviewItem;
use Illuminate\Database\Eloquent\Collection;

class AccessReviewItemRepository
{
    public function create(
        array $data
    ): AccessReviewItem {
        return AccessReviewItem::create($data);
    }

    public function createMany(
        AccessReview $accessReview,
        array $items
    ): Collection {
        $createdItems = new Collection();

        foreach ($items as $item) {
            $createdItems->push(
                AccessReviewItem::create([
                    'access_review_id' => $accessReview->id,
                    'tenant_id' => $accessReview->tenant_id,
                    ...$item,
                ])
            );
        }

        return $createdItems;
    }

    public function findByTenantReviewAndId(
        string $tenantId,
        string $reviewId,
        string $itemId
    ): ?AccessReviewItem {
        return AccessReviewItem::query()
            ->with([
                'subject:id,name,email,status',
                'reviewedBy:id,name,email',
                'tenantUser',
            ])
            ->where('tenant_id', $tenantId)
            ->where('access_review_id', $reviewId)
            ->whereKey($itemId)
            ->first();
    }

    public function getByReview(
        string $tenantId,
        string $reviewId
    ): Collection {
        return AccessReviewItem::query()
            ->with([
                'subject:id,name,email,status',
                'reviewedBy:id,name,email',
                'tenantUser',
            ])
            ->where('tenant_id', $tenantId)
            ->where('access_review_id', $reviewId)
            ->orderBy('created_at')
            ->get();
    }

    public function update(
        AccessReviewItem $item,
        array $data
    ): AccessReviewItem {
        $item->update($data);

        return $item->fresh([
            'subject:id,name,email,status',
            'reviewedBy:id,name,email',
            'tenantUser',
        ]);
    }

    public function countPending(
        string $tenantId,
        string $reviewId
    ): int {
        return AccessReviewItem::query()
            ->where('tenant_id', $tenantId)
            ->where('access_review_id', $reviewId)
            ->where(
                'decision',
                AccessReviewItem::DECISION_PENDING
            )
            ->count();
    }

    public function countByReview(
        string $tenantId,
        string $reviewId
    ): int {
        return AccessReviewItem::query()
            ->where('tenant_id', $tenantId)
            ->where('access_review_id', $reviewId)
            ->count();
    }
}
