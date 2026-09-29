<?php

namespace App\Services\Asset;

use App\Models\Asset;
use App\Models\AssetTag;
use App\Models\User;
use App\Repositories\AssetRepository;
use App\Repositories\AssetTagRepository;
use App\Services\Company\CompanyAccessService;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AssetTagService
{
    public function __construct(
        private readonly AssetTagRepository $assetTagRepository,
        private readonly AssetRepository $assetRepository,
        private readonly CompanyAccessService $companyAccessService
    ) {
    }

    public function getAll(
        string $tenantId
    ): Collection {
        return $this
            ->assetTagRepository
            ->getAllByTenant(
                $tenantId
            );
    }

    public function getById(
        string $tenantId,
        string $tagId
    ): AssetTag {
        $tag = $this
            ->assetTagRepository
            ->findById(
                $tenantId,
                $tagId
            );

        if (!$tag) {
            throw new DomainException(
                'Asset tag not found.'
            );
        }

        return $tag;
    }

    public function create(
        string $tenantId,
        array $data,
        User $actor
    ): AssetTag {
        $name = trim(
            (string) (
                $data['name']
                ?? ''
            )
        );

        if ($name === '') {
            throw ValidationException::withMessages([
                'name' => [
                    'Asset tag name is required.',
                ],
            ]);
        }

        if (mb_strlen($name) > 100) {
            throw ValidationException::withMessages([
                'name' => [
                    'Asset tag name may not be greater than 100 characters.',
                ],
            ]);
        }

        $slug = Str::slug($name);

        if ($slug === '') {
            throw ValidationException::withMessages([
                'name' => [
                    'Asset tag name must contain valid characters.',
                ],
            ]);
        }

        if (
            $this
                ->assetTagRepository
                ->slugExists(
                    $tenantId,
                    $slug
                )
        ) {
            throw ValidationException::withMessages([
                'name' => [
                    'An Asset tag with this name already exists.',
                ],
            ]);
        }

        return $this
            ->assetTagRepository
            ->create([
                'tenant_id' =>
                    $tenantId,

                'name' =>
                    $name,

                'slug' =>
                    $slug,

                'created_by' =>
                    $actor->id,

                'updated_by' =>
                    $actor->id,
            ]);
    }

    public function update(
        string $tenantId,
        string $tagId,
        array $data,
        User $actor
    ): AssetTag {
        $tag = $this->getById(
            $tenantId,
            $tagId
        );

        $updateData = [];

        if (
            array_key_exists(
                'name',
                $data
            )
        ) {
            $name = trim(
                (string) $data['name']
            );

            if ($name === '') {
                throw ValidationException::withMessages([
                    'name' => [
                        'Asset tag name cannot be empty.',
                    ],
                ]);
            }

            if (mb_strlen($name) > 100) {
                throw ValidationException::withMessages([
                    'name' => [
                        'Asset tag name may not be greater than 100 characters.',
                    ],
                ]);
            }

            $slug = Str::slug($name);

            if ($slug === '') {
                throw ValidationException::withMessages([
                    'name' => [
                        'Asset tag name must contain valid characters.',
                    ],
                ]);
            }

            if (
                $this
                    ->assetTagRepository
                    ->slugExists(
                        $tenantId,
                        $slug,
                        $tag->id
                    )
            ) {
                throw ValidationException::withMessages([
                    'name' => [
                        'An Asset tag with this name already exists.',
                    ],
                ]);
            }

            $updateData['name'] =
                $name;

            $updateData['slug'] =
                $slug;
        }

        if (empty($updateData)) {
            return $tag;
        }

        $updateData['updated_by'] =
            $actor->id;

        return $this
            ->assetTagRepository
            ->update(
                $tag,
                $updateData
            );
    }

    public function delete(
        string $tenantId,
        string $tagId
    ): void {
        $tag = $this->getById(
            $tenantId,
            $tagId
        );

        DB::transaction(
            function () use ($tag) {
                $deleted = $this
                    ->assetTagRepository
                    ->delete($tag);

                if (!$deleted) {
                    throw new DomainException(
                        'Unable to delete the Asset tag.'
                    );
                }
            }
        );
    }

    public function getForAsset(
        string $tenantId,
        string $assetId,
        User $actor
    ): Collection {
        $asset = $this
            ->requireAsset(
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
            ->assetTagRepository
            ->getForAsset(
                $tenantId,
                $assetId
            );
    }

    public function syncForAsset(
        string $tenantId,
        Asset $asset,
        array $tagIds,
        User $actor
    ): Collection {
        $this
            ->companyAccessService
            ->requireEdit(
                $tenantId,
                $actor,
                $asset->company_id
            );

        $tagIds = $this
            ->validateTagIds(
                $tenantId,
                $tagIds
            );

        $this
            ->assetTagRepository
            ->syncForAsset(
                $tenantId,
                $asset,
                $tagIds,
                (string) $actor->id
            );

        return $this
            ->assetTagRepository
            ->getForAsset(
                $tenantId,
                $asset->id
            );
    }

    public function validateTagIds(
        string $tenantId,
        mixed $tagIds
    ): array {
        if ($tagIds === null) {
            return [];
        }

        if (!is_array($tagIds)) {
            throw ValidationException::withMessages([
                'tag_ids' => [
                    'Asset tags must be an array.',
                ],
            ]);
        }

        $normalizedTagIds = [];

        foreach ($tagIds as $tagId) {
            if (
                !is_string($tagId) ||
                trim($tagId) === '' ||
                !Str::isUuid(trim($tagId))
            ) {
                throw ValidationException::withMessages([
                    'tag_ids' => [
                        'One or more selected Asset tags are invalid.',
                    ],
                ]);
            }

            $normalizedTagIds[] =
                trim($tagId);
        }

        $normalizedTagIds = array_values(
            array_unique(
                $normalizedTagIds
            )
        );

        if (empty($normalizedTagIds)) {
            return [];
        }

        $tags = $this
            ->assetTagRepository
            ->findManyByIds(
                $tenantId,
                $normalizedTagIds
            );

        if (
            $tags->count() !==
            count($normalizedTagIds)
        ) {
            throw ValidationException::withMessages([
                'tag_ids' => [
                    'One or more selected Asset tags are invalid for this tenant.',
                ],
            ]);
        }

        return $normalizedTagIds;
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
}
