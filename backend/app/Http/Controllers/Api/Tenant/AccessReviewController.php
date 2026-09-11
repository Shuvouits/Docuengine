<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\AccessReview;
use App\Models\AccessReviewItem;
use App\Services\Security\AccessReviewService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccessReviewController extends Controller
{
    public function __construct(
        private AccessReviewService $accessReviewService
    ) {
    }

    public function index(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'status' => [
                'nullable',
                'string',
                Rule::in([
                    AccessReview::STATUS_DRAFT,
                    AccessReview::STATUS_IN_PROGRESS,
                    AccessReview::STATUS_COMPLETED,
                    AccessReview::STATUS_CANCELLED,
                ]),
            ],
            'reviewer_user_id' => [
                'nullable',
                'uuid',
            ],
            'search' => [
                'nullable',
                'string',
                'max:150',
            ],
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $reviews = $this
            ->accessReviewService
            ->list(
                $tenantId,
                $validated,
                (int) ($validated['per_page'] ?? 25)
            );

        return response()->json([
            'message' => 'Access reviews retrieved successfully.',
            'data' => $reviews,
        ]);
    }

    public function show(
        string $tenantId,
        string $reviewId
    ): JsonResponse {
        $review = $this
            ->accessReviewService
            ->get(
                $tenantId,
                $reviewId
            );

        if (!$review) {
            return response()->json([
                'message' => 'Access review not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Access review retrieved successfully.',
            'data' => $review,
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
                'max:150',
            ],
            'reviewer_user_id' => [
                'nullable',
                'uuid',
            ],
            'due_at' => [
                'nullable',
                'date',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'metadata' => [
                'nullable',
                'array',
            ],
        ]);

        try {
            $review = $this
                ->accessReviewService
                ->createDraft(
                    $tenantId,
                    $request->user()->id,
                    $validated,
                    $request->ip(),
                    $request->userAgent()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Access review created successfully.',
            'data' => $review,
        ], 201);
    }

    public function start(
        Request $request,
        string $tenantId,
        string $reviewId
    ): JsonResponse {
        $review = $this->findReview(
            $tenantId,
            $reviewId
        );

        if (!$review) {
            return response()->json([
                'message' => 'Access review not found.',
            ], 404);
        }

        try {
            $review = $this
                ->accessReviewService
                ->start(
                    $review,
                    $request->user()->id,
                    $request->ip(),
                    $request->userAgent()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Access review started successfully.',
            'data' => $review,
        ]);
    }

    public function decide(
        Request $request,
        string $tenantId,
        string $reviewId,
        string $itemId
    ): JsonResponse {
        $review = $this->findReview(
            $tenantId,
            $reviewId
        );

        if (!$review) {
            return response()->json([
                'message' => 'Access review not found.',
            ], 404);
        }

        $validated = $request->validate([
            'decision' => [
                'required',
                'string',
                Rule::in([
                    AccessReviewItem::DECISION_RETAIN,
                    AccessReviewItem::DECISION_REVOKE,
                    AccessReviewItem::DECISION_CHANGE_ROLE,
                ]),
            ],
            'requested_role' => [
                'nullable',
                'string',
                'max:100',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        try {
            $item = $this
                ->accessReviewService
                ->decide(
                    $review,
                    $itemId,
                    $validated['decision'],
                    $request->user()->id,
                    $validated['requested_role'] ?? null,
                    $validated['notes'] ?? null,
                    $request->ip(),
                    $request->userAgent()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Access review decision saved successfully.',
            'data' => $item,
        ]);
    }

    public function complete(
        Request $request,
        string $tenantId,
        string $reviewId
    ): JsonResponse {
        $review = $this->findReview(
            $tenantId,
            $reviewId
        );

        if (!$review) {
            return response()->json([
                'message' => 'Access review not found.',
            ], 404);
        }

        try {
            $review = $this
                ->accessReviewService
                ->complete(
                    $review,
                    $request->user()->id,
                    $request->ip(),
                    $request->userAgent()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Access review completed successfully.',
            'data' => $review,
        ]);
    }

    public function cancel(
        Request $request,
        string $tenantId,
        string $reviewId
    ): JsonResponse {
        $review = $this->findReview(
            $tenantId,
            $reviewId
        );

        if (!$review) {
            return response()->json([
                'message' => 'Access review not found.',
            ], 404);
        }

        try {
            $review = $this
                ->accessReviewService
                ->cancel(
                    $review,
                    $request->user()->id,
                    $request->ip(),
                    $request->userAgent()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Access review cancelled successfully.',
            'data' => $review,
        ]);
    }

    private function findReview(
        string $tenantId,
        string $reviewId
    ): ?AccessReview {
        return $this
            ->accessReviewService
            ->get(
                $tenantId,
                $reviewId
            );
    }
}
