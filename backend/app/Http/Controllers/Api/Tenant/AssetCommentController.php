<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\AssetComment;
use App\Services\Asset\AssetCommentService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetCommentController extends Controller
{
    public function __construct(
        private readonly AssetCommentService $assetCommentService
    ) {
    }

    /**
     * List Asset Comments
     */
    public function index(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        $validated = $request->validate([
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        try {
            $comments = $this
                ->assetCommentService
                ->getAll(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    actor: $request->user('api'),
                    perPage: (int) (
                        $validated['per_page']
                        ?? 25
                    )
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset comments retrieved successfully.',

            'data' => [
                'comments' =>
                    collect($comments->items())
                        ->map(
                            fn (AssetComment $comment) =>
                                $this->formatComment($comment)
                        )
                        ->values()
                        ->all(),

                'pagination' => [
                    'current_page' =>
                        $comments->currentPage(),

                    'last_page' =>
                        $comments->lastPage(),

                    'per_page' =>
                        $comments->perPage(),

                    'total' =>
                        $comments->total(),

                    'from' =>
                        $comments->firstItem(),

                    'to' =>
                        $comments->lastItem(),
                ],
            ],
        ]);
    }

    /**
     * Show Asset Comment
     */
    public function show(
        Request $request,
        string $tenantId,
        string $assetId,
        string $commentId
    ): JsonResponse {
        try {
            $comment = $this
                ->assetCommentService
                ->getById(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    commentId: $commentId,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset comment retrieved successfully.',

            'data' => [
                'comment' =>
                    $this->formatComment($comment),
            ],
        ]);
    }

    /**
     * Create Asset Comment
     */
    public function store(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        $validated = $request->validate([
            'body' => [
                'required',
                'string',
                'max:10000',
            ],
        ]);

        try {
            $comment = $this
                ->assetCommentService
                ->create(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    data: $validated,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset comment created successfully.',

            'data' => [
                'comment' =>
                    $this->formatComment($comment),
            ],
        ], 201);
    }

    /**
     * Update Asset Comment
     */
    public function update(
        Request $request,
        string $tenantId,
        string $assetId,
        string $commentId
    ): JsonResponse {
        $validated = $request->validate([
            'body' => [
                'required',
                'string',
                'max:10000',
            ],
        ]);

        try {
            $comment = $this
                ->assetCommentService
                ->update(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    commentId: $commentId,
                    data: $validated,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset comment updated successfully.',

            'data' => [
                'comment' =>
                    $this->formatComment($comment),
            ],
        ]);
    }

    /**
     * Delete Asset Comment
     */
    public function destroy(
        Request $request,
        string $tenantId,
        string $assetId,
        string $commentId
    ): JsonResponse {
        try {
            $this
                ->assetCommentService
                ->delete(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    commentId: $commentId,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset comment deleted successfully.',
        ]);
    }

    /**
     * Format Comment
     */
    private function formatComment(
        AssetComment $comment
    ): array {
        return [
            'id' =>
                $comment->id,

            'tenant_id' =>
                $comment->tenant_id,

            'asset_id' =>
                $comment->asset_id,

            'body' =>
                $comment->body,

            'created_by' =>
                $comment->created_by,

            'updated_by' =>
                $comment->updated_by,

            'creator' =>
                $comment->creator
                    ? [
                        'id' =>
                            $comment->creator->id,

                        'name' =>
                            $comment->creator->name,

                        'email' =>
                            $comment->creator->email,
                    ]
                    : null,

            'updater' =>
                $comment->updater
                    ? [
                        'id' =>
                            $comment->updater->id,

                        'name' =>
                            $comment->updater->name,

                        'email' =>
                            $comment->updater->email,
                    ]
                    : null,

            'created_at' =>
                $comment->created_at
                    ?->toISOString(),

            'updated_at' =>
                $comment->updated_at
                    ?->toISOString(),
        ];
    }
}
