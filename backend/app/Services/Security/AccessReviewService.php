<?php

namespace App\Services\Security;

use App\Models\AccessReview;
use App\Models\AccessReviewItem;
use App\Models\SecurityEvent;
use App\Models\TenantUser;
use App\Repositories\AccessReviewItemRepository;
use App\Repositories\AccessReviewRepository;
use App\Repositories\TenantUserRepository;
use App\Services\Tenant\TenantUserService;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AccessReviewService
{
    public function __construct(
        private AccessReviewRepository $accessReviewRepository,
        private AccessReviewItemRepository $accessReviewItemRepository,
        private TenantUserRepository $tenantUserRepository,
        private TenantUserService $tenantUserService,
        private SecurityEventService $securityEventService
    ) {
    }

    public function list(
        string $tenantId,
        array $filters = [],
        int $perPage = 25
    ): LengthAwarePaginator {
        $perPage = max(
            1,
            min($perPage, 100)
        );

        return $this
            ->accessReviewRepository
            ->paginateByTenant(
                $tenantId,
                $filters,
                $perPage
            );
    }

    public function get(
        string $tenantId,
        string $reviewId
    ): ?AccessReview {
        return $this
            ->accessReviewRepository
            ->findByTenantAndId(
                $tenantId,
                $reviewId
            );
    }

    public function createDraft(
        string $tenantId,
        string $createdByUserId,
        array $data,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): AccessReview {
        $name = trim(
            $data['name'] ?? ''
        );

        if ($name === '') {
            throw new DomainException(
                'Access review name is required.'
            );
        }

        $reviewerUserId =
            $data['reviewer_user_id']
            ?? null;

        if ($reviewerUserId) {
            $reviewerMembership = $this
                ->tenantUserRepository
                ->findByTenantAndUser(
                    $tenantId,
                    $reviewerUserId
                );

            if (
                !$reviewerMembership ||
                !$reviewerMembership->isActive()
            ) {
                throw new DomainException(
                    'The selected reviewer does not have active access to this tenant.'
                );
            }
        }

        $accessReview = $this
            ->accessReviewRepository
            ->create([
                'tenant_id' => $tenantId,
                'name' => $name,
                'status' => AccessReview::STATUS_DRAFT,
                'reviewer_user_id' => $reviewerUserId,
                'created_by_user_id' => $createdByUserId,
                'due_at' => $data['due_at'] ?? null,
                'notes' => $data['notes'] ?? null,
                'metadata' => $data['metadata'] ?? null,
            ]);

        $this
            ->securityEventService
            ->record(
                eventType: 'access_review.created',
                category: SecurityEventService::CATEGORY_SECURITY,
                tenantId: $tenantId,
                actorUserId: $createdByUserId,
                subjectUserId: null,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                description: 'Access review was created.',
                metadata: [
                    'access_review_id' => $accessReview->id,
                    'name' => $accessReview->name,
                    'status' => $accessReview->status,
                ]
            );

        return $accessReview;
    }

    public function start(
        AccessReview $accessReview,
        string $actorUserId,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): AccessReview {
        if (!$accessReview->isDraft()) {
            throw new DomainException(
                'Only draft access reviews can be started.'
            );
        }

        $memberships = $this
            ->tenantUserRepository
            ->getActiveByTenant(
                $accessReview->tenant_id
            );

        if ($memberships->isEmpty()) {
            throw new DomainException(
                'There are no active tenant users to review.'
            );
        }

        $itemCount = 0;

        DB::transaction(function () use (
            $accessReview,
            $memberships,
            &$itemCount
        ) {
            $items = [];

            foreach ($memberships as $membership) {
                $user = $membership->user;

                if (!$user) {
                    continue;
                }

                $user->unsetRelation('roles');
                $user->unsetRelation('permissions');

                $roleNames = $user
                    ->getRoleNames()
                    ->values()
                    ->all();

                $permissionNames = $user
                    ->getAllPermissions()
                    ->pluck('name')
                    ->values()
                    ->all();

                $items[] = [
                    'tenant_user_id' => $membership->id,
                    'subject_user_id' => $user->id,
                    'decision' =>
                        AccessReviewItem::DECISION_PENDING,
                    'current_role' =>
                        $roleNames[0] ?? null,
                    'requested_role' => null,
                    'reviewed_by_user_id' => null,
                    'reviewed_at' => null,
                    'decision_notes' => null,
                    'access_snapshot' => [
                        'user_status' => $user->status,
                        'membership_status' =>
                            $membership->status,
                        'membership_role' =>
                            $membership->role,
                        'roles' => $roleNames,
                        'permissions' => $permissionNames,
                    ],
                ];
            }

            if (empty($items)) {
                throw new DomainException(
                    'There are no valid tenant users to review.'
                );
            }

            $this
                ->accessReviewItemRepository
                ->createMany(
                    $accessReview,
                    $items
                );

            $itemCount = count($items);

            $this
                ->accessReviewRepository
                ->update(
                    $accessReview,
                    [
                        'status' =>
                            AccessReview::STATUS_IN_PROGRESS,
                        'started_at' => now(),
                    ]
                );
        });

        $this
            ->securityEventService
            ->record(
                eventType: 'access_review.started',
                category: SecurityEventService::CATEGORY_SECURITY,
                tenantId: $accessReview->tenant_id,
                actorUserId: $actorUserId,
                subjectUserId: null,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                description: 'Access review was started.',
                metadata: [
                    'access_review_id' => $accessReview->id,
                    'review_items' => $itemCount,
                ]
            );

        return $this->requireReview(
            $accessReview->tenant_id,
            $accessReview->id
        );
    }

    public function decide(
        AccessReview $accessReview,
        string $itemId,
        string $decision,
        string $reviewedByUserId,
        ?string $requestedRole = null,
        ?string $notes = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): AccessReviewItem {
        if (!$accessReview->isInProgress()) {
            throw new DomainException(
                'Only access reviews in progress can be reviewed.'
            );
        }

        $allowedDecisions = [
            AccessReviewItem::DECISION_RETAIN,
            AccessReviewItem::DECISION_REVOKE,
            AccessReviewItem::DECISION_CHANGE_ROLE,
        ];

        if (
            !in_array(
                $decision,
                $allowedDecisions,
                true
            )
        ) {
            throw new DomainException(
                'Invalid access review decision.'
            );
        }

        $item = $this
            ->accessReviewItemRepository
            ->findByTenantReviewAndId(
                $accessReview->tenant_id,
                $accessReview->id,
                $itemId
            );

        if (!$item) {
            throw new DomainException(
                'Access review item not found.'
            );
        }

        if (!$item->isPending()) {
            throw new DomainException(
                'This access review item has already been reviewed.'
            );
        }

        $membership = $this
            ->tenantUserRepository
            ->findByTenantAndUser(
                $accessReview->tenant_id,
                $item->subject_user_id
            );

        if (!$membership) {
            throw new DomainException(
                'The reviewed tenant membership no longer exists.'
            );
        }

        $requestedRole = $requestedRole !== null
            ? trim($requestedRole)
            : null;

        DB::transaction(function () use (
            $accessReview,
            $item,
            $membership,
            $decision,
            $reviewedByUserId,
            $requestedRole,
            $notes,
            $ipAddress,
            $userAgent
        ) {
            if (
                $decision ===
                AccessReviewItem::DECISION_REVOKE
            ) {
                if (
                    $membership->status ===
                    TenantUser::STATUS_ACTIVE
                ) {
                    $this
                        ->tenantUserService
                        ->suspend(
                            $membership,
                            $reviewedByUserId,
                            $ipAddress,
                            $userAgent
                        );
                }
            }

            if (
                $decision ===
                AccessReviewItem::DECISION_CHANGE_ROLE
            ) {
                if (!$requestedRole) {
                    throw new DomainException(
                        'A new role is required for a role change decision.'
                    );
                }

                if (
                    $requestedRole ===
                    $item->current_role
                ) {
                    throw new DomainException(
                        'The selected role is already assigned to this user.'
                    );
                }

                $this
                    ->tenantUserService
                    ->update(
                        $membership,
                        $accessReview->tenant_id,
                        [
                            'role' => $requestedRole,
                        ]
                    );
            }

            $this
                ->accessReviewItemRepository
                ->update(
                    $item,
                    [
                        'decision' => $decision,
                        'requested_role' =>
                            $decision ===
                            AccessReviewItem::DECISION_CHANGE_ROLE
                                ? $requestedRole
                                : null,
                        'reviewed_by_user_id' =>
                            $reviewedByUserId,
                        'reviewed_at' => now(),
                        'decision_notes' => $notes,
                    ]
                );

            $this
                ->securityEventService
                ->record(
                    eventType: 'access_review.item.reviewed',
                    category: SecurityEventService::CATEGORY_SECURITY,
                    tenantId: $accessReview->tenant_id,
                    actorUserId: $reviewedByUserId,
                    subjectUserId: $item->subject_user_id,
                    severity:
                        $decision ===
                        AccessReviewItem::DECISION_REVOKE
                            ? SecurityEvent::SEVERITY_WARNING
                            : SecurityEvent::SEVERITY_INFO,
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    description: 'Access review item was reviewed.',
                    metadata: [
                        'access_review_id' =>
                            $accessReview->id,
                        'access_review_item_id' =>
                            $item->id,
                        'decision' => $decision,
                        'previous_role' =>
                            $item->current_role,
                        'requested_role' =>
                            $decision ===
                            AccessReviewItem::DECISION_CHANGE_ROLE
                                ? $requestedRole
                                : null,
                    ]
                );
        });

        $updatedItem = $this
            ->accessReviewItemRepository
            ->findByTenantReviewAndId(
                $accessReview->tenant_id,
                $accessReview->id,
                $item->id
            );

        if (!$updatedItem) {
            throw new DomainException(
                'Access review item could not be retrieved.'
            );
        }

        return $updatedItem;
    }

    public function complete(
        AccessReview $accessReview,
        string $actorUserId,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): AccessReview {
        if (!$accessReview->isInProgress()) {
            throw new DomainException(
                'Only access reviews in progress can be completed.'
            );
        }

        $pendingCount = $this
            ->accessReviewItemRepository
            ->countPending(
                $accessReview->tenant_id,
                $accessReview->id
            );

        if ($pendingCount > 0) {
            throw new DomainException(
                'All access review items must be reviewed before completion.'
            );
        }

        $accessReview = $this
            ->accessReviewRepository
            ->update(
                $accessReview,
                [
                    'status' =>
                        AccessReview::STATUS_COMPLETED,
                    'completed_at' => now(),
                ]
            );

        $this
            ->securityEventService
            ->record(
                eventType: 'access_review.completed',
                category: SecurityEventService::CATEGORY_SECURITY,
                tenantId: $accessReview->tenant_id,
                actorUserId: $actorUserId,
                subjectUserId: null,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                description: 'Access review was completed.',
                metadata: [
                    'access_review_id' =>
                        $accessReview->id,
                ]
            );

        return $this->requireReview(
            $accessReview->tenant_id,
            $accessReview->id
        );
    }

    public function cancel(
        AccessReview $accessReview,
        string $actorUserId,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): AccessReview {
        if (
            $accessReview->isCompleted() ||
            $accessReview->isCancelled()
        ) {
            throw new DomainException(
                'This access review can no longer be cancelled.'
            );
        }

        $accessReview = $this
            ->accessReviewRepository
            ->update(
                $accessReview,
                [
                    'status' =>
                        AccessReview::STATUS_CANCELLED,
                ]
            );

        $this
            ->securityEventService
            ->record(
                eventType: 'access_review.cancelled',
                category: SecurityEventService::CATEGORY_SECURITY,
                tenantId: $accessReview->tenant_id,
                actorUserId: $actorUserId,
                subjectUserId: null,
                severity: SecurityEvent::SEVERITY_WARNING,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                description: 'Access review was cancelled.',
                metadata: [
                    'access_review_id' =>
                        $accessReview->id,
                ]
            );

        return $this->requireReview(
            $accessReview->tenant_id,
            $accessReview->id
        );
    }

    private function requireReview(
        string $tenantId,
        string $reviewId
    ): AccessReview {
        $accessReview = $this
            ->accessReviewRepository
            ->findByTenantAndId(
                $tenantId,
                $reviewId
            );

        if (!$accessReview) {
            throw new DomainException(
                'Access review not found.'
            );
        }

        return $accessReview;
    }
}
