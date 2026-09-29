<?php

namespace App\Repositories;

use App\Models\AssetAttachment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class AssetAttachmentRepository
{
    public function queryForAsset(
        string $tenantId,
        string $assetId
    ): Builder {
        return AssetAttachment::query()
            ->forTenant($tenantId)
            ->forAsset($assetId);
    }

    public function paginateForAsset(
        string $tenantId,
        string $assetId,
        ?string $type = null,
        int $perPage = 25
    ): LengthAwarePaginator {
        $query = $this->queryForAsset(
            $tenantId,
            $assetId
        );

        if ($type !== null) {
            $query->ofType($type);
        }

        $perPage = max(
            1,
            min($perPage, 100)
        );

        return $query
            ->with([
                'uploader:id,name,email',
            ])
            ->latest('created_at')
            ->paginate($perPage);
    }

    public function findByTenantAssetAndId(
        string $tenantId,
        string $assetId,
        string $attachmentId
    ): ?AssetAttachment {
        return $this
            ->queryForAsset(
                $tenantId,
                $assetId
            )
            ->with([
                'uploader:id,name,email',
            ])
            ->where(
                'id',
                $attachmentId
            )
            ->first();
    }

    public function create(
        array $data
    ): AssetAttachment {
        $attachment = AssetAttachment::query()
            ->create($data);

        return $attachment->load([
            'uploader:id,name,email',
        ]);
    }

    public function delete(
        AssetAttachment $attachment
    ): bool {
        return (bool) $attachment->delete();
    }

    public function countForAsset(
        string $tenantId,
        string $assetId,
        ?string $type = null
    ): int {
        $query = $this->queryForAsset(
            $tenantId,
            $assetId
        );

        if ($type !== null) {
            $query->ofType($type);
        }

        return $query->count();
    }

    public function filesForAsset(
        string $tenantId,
        string $assetId,
        int $perPage = 25
    ): LengthAwarePaginator {
        return $this->paginateForAsset(
            tenantId: $tenantId,
            assetId: $assetId,
            type: AssetAttachment::TYPE_FILE,
            perPage: $perPage
        );
    }

    public function photosForAsset(
        string $tenantId,
        string $assetId,
        int $perPage = 25
    ): LengthAwarePaginator {
        return $this->paginateForAsset(
            tenantId: $tenantId,
            assetId: $assetId,
            type: AssetAttachment::TYPE_PHOTO,
            perPage: $perPage
        );
    }
}
