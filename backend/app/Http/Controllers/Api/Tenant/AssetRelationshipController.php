<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetRelationship;
use App\Services\Asset\AssetRelationshipService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetRelationshipController extends Controller
{
    public function __construct(
        private readonly AssetRelationshipService $assetRelationshipService
    ) {
    }

    public function index(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        try {
            $relationships = $this
                ->assetRelationshipService
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
                'Asset relationships retrieved successfully.',

            'data' => [
                'relationships' => $relationships
                    ->map(
                        fn (AssetRelationship $relationship) =>
                            $this->formatRelationship(
                                $relationship,
                                $assetId
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
            'related_asset_id' => [
                'required',
                'uuid',
            ],

            'relationship_type' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'label' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'notes' => [
                'sometimes',
                'nullable',
                'string',
                'max:10000',
            ],
        ]);

        try {
            $relationship = $this
                ->assetRelationshipService
                ->create(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    data: $validated,
                    actor: $request->user('api'),
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset relationship created successfully.',

            'data' => [
                'relationship' =>
                    $this->formatRelationship(
                        $relationship,
                        $assetId
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
                ->assetRelationshipService
                ->delete(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    relationshipId: $relationshipId,
                    actor: $request->user('api'),
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset relationship removed successfully.',
        ]);
    }

    private function formatRelationship(
        AssetRelationship $relationship,
        string $contextAssetId
    ): array {
        $isOutgoing =
            (string) $relationship->source_asset_id ===
            (string) $contextAssetId;

        $counterpartAsset = $isOutgoing
            ? $relationship->relatedAsset
            : $relationship->sourceAsset;

        return [
            'id' =>
                $relationship->id,

            'tenant_id' =>
                $relationship->tenant_id,

            'source_asset_id' =>
                $relationship->source_asset_id,

            'related_asset_id' =>
                $relationship->related_asset_id,

            'relationship_type' =>
                $relationship->relationship_type,

            'label' =>
                $relationship->label,

            'notes' =>
                $relationship->notes,

            'direction' =>
                $isOutgoing
                    ? 'outgoing'
                    : 'incoming',

            'source_asset' =>
                $this->formatAsset(
                    $relationship->sourceAsset
                ),

            'related_asset' =>
                $this->formatAsset(
                    $relationship->relatedAsset
                ),

            'counterpart_asset' =>
                $this->formatAsset(
                    $counterpartAsset
                ),

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

    private function formatAsset(
        ?Asset $asset
    ): ?array {
        if (!$asset) {
            return null;
        }

        return [
            'id' =>
                $asset->id,

            'company_id' =>
                $asset->company_id,

            'name' =>
                $asset->name,

            'status' =>
                $asset->status,

            'lifecycle_status' =>
                $asset->lifecycle_status,

            'data_source' =>
                $asset->data_source,

            'company' =>
                $asset->company
                    ? [
                        'id' =>
                            $asset
                                ->company
                                ->id,

                        'name' =>
                            $asset
                                ->company
                                ->name,
                    ]
                    : null,
        ];
    }
}
