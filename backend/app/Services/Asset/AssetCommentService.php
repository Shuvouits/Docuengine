<?php

namespace App\Services\Asset;

use App\Models\Asset;
use App\Models\AssetComment;
use App\Models\User;
use App\Repositories\AssetCommentRepository;
use App\Repositories\AssetRepository;
use App\Services\Company\CompanyAccessService;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class AssetCommentService
{
    public function __construct(
        private readonly AssetRepository $assetRepository,
        private readonly AssetCommentRepository $assetCommentRepository,
        private readonly CompanyAccessService $companyAccessService
    ) {
    }

    public function getAll(
        string $tenantId,
        string $assetId,
        User $actor,
        int $perPage = 25
    ): LengthAwarePaginator {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this
            ->companyAccessService
            ->requireView(
                $tenantId,
                $actor,
                $asset->company_id
            );

        return $this
            ->assetCommentRepository
            ->paginateForAsset(
                $tenantId,
                $assetId,
                $perPage
            );
    }

    public function getById(
        string $tenantId,
        string $assetId,
        string $commentId,
        User $actor
    ): AssetComment {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this
            ->companyAccessService
            ->requireView(
                $tenantId,
                $actor,
                $asset->company_id
            );

        $comment = $this
            ->assetCommentRepository
            ->findByTenantAssetAndId(
                $tenantId,
                $assetId,
                $commentId
            );

        if (!$comment) {
            throw new DomainException(
                'Asset comment not found.'
            );
        }

        return $comment;
    }

    public function create(
        string $tenantId,
        string $assetId,
        array $data,
        User $actor
    ): AssetComment {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this
            ->companyAccessService
            ->requireEdit(
                $tenantId,
                $actor,
                $asset->company_id
            );

        $body = $this->validateBody(
            $data['body'] ?? null
        );

        return $this
            ->assetCommentRepository
            ->create([
                'tenant_id' => $tenantId,
                'asset_id' => $assetId,
                'body' => $body,
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);
    }

    public function update(
        string $tenantId,
        string $assetId,
        string $commentId,
        array $data,
        User $actor
    ): AssetComment {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this
            ->companyAccessService
            ->requireEdit(
                $tenantId,
                $actor,
                $asset->company_id
            );

        $comment = $this
            ->assetCommentRepository
            ->findByTenantAssetAndId(
                $tenantId,
                $assetId,
                $commentId
            );

        if (!$comment) {
            throw new DomainException(
                'Asset comment not found.'
            );
        }

        $body = $this->validateBody(
            $data['body'] ?? null
        );

        return $this
            ->assetCommentRepository
            ->update(
                $comment,
                [
                    'body' => $body,
                    'updated_by' => $actor->id,
                ]
            );
    }

    public function delete(
        string $tenantId,
        string $assetId,
        string $commentId,
        User $actor
    ): void {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this
            ->companyAccessService
            ->requireEdit(
                $tenantId,
                $actor,
                $asset->company_id
            );

        $comment = $this
            ->assetCommentRepository
            ->findByTenantAssetAndId(
                $tenantId,
                $assetId,
                $commentId
            );

        if (!$comment) {
            throw new DomainException(
                'Asset comment not found.'
            );
        }

        $deleted = $this
            ->assetCommentRepository
            ->delete(
                $comment
            );

        if (!$deleted) {
            throw new DomainException(
                'Unable to delete the asset comment.'
            );
        }
    }

    private function requireAsset(
        string $tenantId,
        string $assetId
    ): Asset {
        $asset = $this
            ->assetRepository
            ->findByTenantAndId(
                $tenantId,
                $assetId
            );

        if (!$asset) {
            throw new DomainException(
                'Asset not found.'
            );
        }

        return $asset;
    }

    private function validateBody(
        mixed $body
    ): string {
        if (!is_string($body)) {
            throw ValidationException::withMessages([
                'body' => [
                    'Comment body is required.',
                ],
            ]);
        }

        $body = trim($body);

        if ($body === '') {
            throw ValidationException::withMessages([
                'body' => [
                    'Comment body is required.',
                ],
            ]);
        }

        if (mb_strlen($body) > 10000) {
            throw ValidationException::withMessages([
                'body' => [
                    'Comment body may not be greater than 10000 characters.',
                ],
            ]);
        }

        return $body;
    }
}
