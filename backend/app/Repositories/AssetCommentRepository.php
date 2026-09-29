<?php

namespace App\Repositories;

use App\Models\AssetComment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class AssetCommentRepository
{
    public function queryForAsset(
        string $tenantId,
        string $assetId
    ): Builder {
        return AssetComment::query()
            ->forTenant($tenantId)
            ->forAsset($assetId);
    }

    public function paginateForAsset(
        string $tenantId,
        string $assetId,
        int $perPage = 25
    ): LengthAwarePaginator {
        $perPage = max(
            1,
            min($perPage, 100)
        );

        return $this
            ->queryForAsset(
                $tenantId,
                $assetId
            )
            ->with([
                'creator:id,name,email',
                'updater:id,name,email',
            ])
            ->latest('created_at')
            ->paginate($perPage);
    }

    public function findByTenantAssetAndId(
        string $tenantId,
        string $assetId,
        string $commentId
    ): ?AssetComment {
        return $this
            ->queryForAsset(
                $tenantId,
                $assetId
            )
            ->with([
                'creator:id,name,email',
                'updater:id,name,email',
            ])
            ->where(
                'id',
                $commentId
            )
            ->first();
    }

    public function create(
        array $data
    ): AssetComment {
        $comment = AssetComment::query()
            ->create($data);

        return $comment->load([
            'creator:id,name,email',
            'updater:id,name,email',
        ]);
    }

    public function update(
        AssetComment $comment,
        array $data
    ): AssetComment {
        $comment->fill($data);

        $comment->save();

        return $comment
            ->refresh()
            ->load([
                'creator:id,name,email',
                'updater:id,name,email',
            ]);
    }

    public function delete(
        AssetComment $comment
    ): bool {
        return (bool) $comment->delete();
    }
}
