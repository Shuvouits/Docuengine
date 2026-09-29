<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\AssetKeeperLink;
use App\Services\Asset\AssetKeeperLinkService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetKeeperLinkController extends Controller
{
    public function __construct(
        private readonly AssetKeeperLinkService $assetKeeperLinkService
    ) {
    }

    public function index(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        try {
            $relationships = $this
                ->assetKeeperLinkService
                ->getAll(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset Keeper links retrieved successfully.',

            'data' => [
                'keeper_links' => $relationships
                    ->map(
                        fn (AssetKeeperLink $relationship) =>
                            $this->formatRelationship(
                                $relationship
                            )
                    )
                    ->values(),

                'count' =>
                    $relationships->count(),
            ],
        ]);
    }

    public function store(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        $validated = $request->validate([
            'keeper_link_id' => [
                'required',
                'uuid',
            ],
        ]);

        try {
            $relationship = $this
                ->assetKeeperLinkService
                ->attach(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    keeperLinkId:
                        $validated['keeper_link_id'],
                    actor:
                        $request->user('api'),
                    ipAddress:
                        $request->ip(),
                    userAgent:
                        $request->userAgent(),
                    requestMethod:
                        $request->method(),
                    requestPath:
                        $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Keeper link attached to asset successfully.',

            'data' => [
                'asset_keeper_link' =>
                    $this->formatRelationship(
                        $relationship
                    ),
            ],
        ], 201);
    }

    public function destroy(
        Request $request,
        string $tenantId,
        string $assetId,
        string $relationshipId
    ): JsonResponse {
        try {
            $this
                ->assetKeeperLinkService
                ->detach(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    relationshipId:
                        $relationshipId,
                    actor:
                        $request->user('api'),
                    ipAddress:
                        $request->ip(),
                    userAgent:
                        $request->userAgent(),
                    requestMethod:
                        $request->method(),
                    requestPath:
                        $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Keeper link detached from asset successfully.',
        ]);
    }

    private function formatRelationship(
        AssetKeeperLink $relationship
    ): array {
        $keeperLink =
            $relationship->keeperLink;

        return [
            'id' =>
                $relationship->id,

            'tenant_id' =>
                $relationship->tenant_id,

            'asset_id' =>
                $relationship->asset_id,

            'keeper_link_id' =>
                $relationship->keeper_link_id,

            'keeper_link' =>
                $keeperLink
                    ? [
                        'id' =>
                            $keeperLink->id,

                        'company_id' =>
                            $keeperLink->company_id,

                        'name' =>
                            $keeperLink->name,

                        'username_hint' =>
                            $keeperLink->username_hint,

                        'has_keeper_uid' =>
                            $keeperLink->hasKeeperUid(),

                        'has_record_url' =>
                            $keeperLink->hasRecordUrl(),

                        'company' =>
                            $keeperLink->company
                                ? [
                                    'id' =>
                                        $keeperLink
                                            ->company
                                            ->id,

                                    'name' =>
                                        $keeperLink
                                            ->company
                                            ->name,
                                ]
                                : null,
                    ]
                    : null,

            'created_by' =>
                $relationship->created_by,

            'creator' =>
                $relationship->creator
                    ? [
                        'id' =>
                            $relationship
                                ->creator
                                ->id,

                        'name' =>
                            $relationship
                                ->creator
                                ->name,

                        'email' =>
                            $relationship
                                ->creator
                                ->email,
                    ]
                    : null,

            'created_at' =>
                $relationship
                    ->created_at
                    ?->toISOString(),

            'updated_at' =>
                $relationship
                    ->updated_at
                    ?->toISOString(),
        ];
    }
}
