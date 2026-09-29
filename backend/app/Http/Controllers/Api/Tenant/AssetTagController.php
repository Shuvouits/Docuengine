<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\AssetTag;
use App\Services\Asset\AssetTagService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetTagController extends Controller
{
    public function __construct(
        private readonly AssetTagService $assetTagService
    ) {
    }

    public function index(
        string $tenantId
    ): JsonResponse {
        $tags = $this
            ->assetTagService
            ->getAll(
                $tenantId
            );

        return response()->json([
            'message' =>
                'Asset tags retrieved successfully.',

            'data' => [
                'tags' =>
                    $tags
                        ->map(
                            fn (AssetTag $tag) =>
                                $this->formatTag(
                                    $tag
                                )
                        )
                        ->values(),
            ],
        ]);
    }

    public function show(
        string $tenantId,
        string $tagId
    ): JsonResponse {
        try {
            $tag = $this
                ->assetTagService
                ->getById(
                    $tenantId,
                    $tagId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 404);
        }

        return response()->json([
            'message' =>
                'Asset tag retrieved successfully.',

            'data' => [
                'tag' =>
                    $this->formatTag(
                        $tag
                    ),
            ],
        ]);
    }

    public function store(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],
        ]);

        $tag = $this
            ->assetTagService
            ->create(
                tenantId: $tenantId,
                data: $validated,
                actor: $request->user('api')
            );

        return response()->json([
            'message' =>
                'Asset tag created successfully.',

            'data' => [
                'tag' =>
                    $this->formatTag(
                        $tag
                    ),
            ],
        ], 201);
    }

    public function update(
        Request $request,
        string $tenantId,
        string $tagId
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
        ]);

        try {
            $tag = $this
                ->assetTagService
                ->update(
                    tenantId: $tenantId,
                    tagId: $tagId,
                    data: $validated,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 404);
        }

        return response()->json([
            'message' =>
                'Asset tag updated successfully.',

            'data' => [
                'tag' =>
                    $this->formatTag(
                        $tag
                    ),
            ],
        ]);
    }

    public function destroy(
        string $tenantId,
        string $tagId
    ): JsonResponse {
        try {
            $this
                ->assetTagService
                ->delete(
                    $tenantId,
                    $tagId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 404);
        }

        return response()->json([
            'message' =>
                'Asset tag deleted successfully.',
        ]);
    }

    private function formatTag(
        AssetTag $tag
    ): array {
        return [
            'id' =>
                $tag->id,

            'tenant_id' =>
                $tag->tenant_id,

            'name' =>
                $tag->name,

            'slug' =>
                $tag->slug,

            'assets_count' =>
                array_key_exists(
                    'assets_count',
                    $tag->getAttributes()
                )
                    ? (int) $tag->assets_count
                    : null,

            'created_by' =>
                $tag->created_by,

            'updated_by' =>
                $tag->updated_by,

            'created_at' =>
                $tag
                    ->created_at
                    ?->toISOString(),

            'updated_at' =>
                $tag
                    ->updated_at
                    ?->toISOString(),
        ];
    }
}
