<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetFieldValue;
use App\Services\Asset\AssetService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AssetController extends Controller
{
    public function __construct(
        private readonly AssetService $assetService
    ) {
    }

    public function index(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'search' => [
                'nullable',
                'string',
                'max:255',
            ],

            'company_id' => [
                'nullable',
                'uuid',
            ],

            'asset_layout_id' => [
                'nullable',
                'uuid',
            ],

            'status' => [
                'nullable',
                Rule::in(
                    Asset::statuses()
                ),
            ],

            'owner_user_id' => [
                'nullable',
                'uuid',
            ],

            'assigned_user_id' => [
                'nullable',
                'uuid',
            ],

            'tag_ids' => [
                'nullable',
                'array',
                'max:50',
            ],

            'tag_ids.*' => [
                'uuid',
                'distinct',
            ],

            'data_source' => [
                'nullable',
                Rule::in(
                    Asset::dataSources()
                ),
            ],

            'lifecycle_status' => [
                'nullable',
                Rule::in(
                    Asset::lifecycleStatuses()
                ),
            ],

            'warranty_status' => [
                'nullable',
                Rule::in([
                    'active',
                    'expired',
                    'none',
                ]),
            ],

            'archived' => [
                'nullable',
                'boolean',
            ],

            'sort_by' => [
                'nullable',
                Rule::in([
                    'name',
                    'status',
                    'data_source',
                    'lifecycle_status',
                    'warranty_expiration_date',
                    'created_at',
                    'updated_at',
                ]),
            ],

            'sort_direction' => [
                'nullable',
                Rule::in([
                    'asc',
                    'desc',
                ]),
            ],

            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $assets = $this
            ->assetService
            ->getAll(
                tenantId: $tenantId,
                filters: $validated,
                actor: $request->user('api')
            );

        return response()->json([
            'message' =>
                'Assets retrieved successfully.',

            'data' => [
                'assets' =>
                    collect(
                        $assets->items()
                    )
                        ->map(
                            fn (Asset $asset) =>
                                $this->formatAsset(
                                    $asset
                                )
                        )
                        ->values(),

                'pagination' => [
                    'current_page' =>
                        $assets->currentPage(),

                    'last_page' =>
                        $assets->lastPage(),

                    'per_page' =>
                        $assets->perPage(),

                    'total' =>
                        $assets->total(),

                    'from' =>
                        $assets->firstItem(),

                    'to' =>
                        $assets->lastItem(),
                ],
            ],
        ]);
    }

    public function show(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        try {
            $asset = $this
                ->assetService
                ->getById(
                    tenantId: $tenantId,
                    assetId: $assetId,
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
                'Asset retrieved successfully.',

            'data' => [
                'asset' =>
                    $this->formatAsset(
                        $asset,
                        true
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
                'max:200',
            ],

            'company_id' => [
                'required',
                'uuid',
            ],

            'asset_layout_id' => [
                'required',
                'uuid',
            ],

            'status' => [
                'nullable',
                Rule::in(
                    Asset::statuses()
                ),
            ],

            'owner_user_id' => [
                'nullable',
                'uuid',
            ],

            'assigned_user_id' => [
                'nullable',
                'uuid',
            ],

            'tag_ids' => [
                'nullable',
                'array',
                'max:50',
            ],

            'tag_ids.*' => [
                'uuid',
                'distinct',
            ],

            'data_source' => [
                'nullable',
                Rule::in(
                    Asset::dataSources()
                ),
            ],

            'lifecycle_status' => [
                'nullable',
                Rule::in(
                    Asset::lifecycleStatuses()
                ),
            ],

            'warranty_provider' => [
                'nullable',
                'string',
                'max:150',
            ],

            'warranty_start_date' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'warranty_expiration_date' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:20000',
            ],

            'fields' => [
                'nullable',
                'array',
            ],
        ]);

        try {
            $asset = $this
                ->assetService
                ->create(
                    tenantId: $tenantId,
                    data: $validated,
                    actor: $request->user('api'),
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset created successfully.',

            'data' => [
                'asset' =>
                    $this->formatAsset(
                        $asset,
                        true
                    ),
            ],
        ], 201);
    }

    public function update(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:200',
            ],

            'company_id' => [
                'sometimes',
                'required',
                'uuid',
            ],

            'asset_layout_id' => [
                'sometimes',
                'required',
                'uuid',
            ],

            'status' => [
                'sometimes',
                'required',
                Rule::in(
                    Asset::statuses()
                ),
            ],

            'owner_user_id' => [
                'sometimes',
                'nullable',
                'uuid',
            ],

            'assigned_user_id' => [
                'sometimes',
                'nullable',
                'uuid',
            ],

            'tag_ids' => [
                'sometimes',
                'array',
                'max:50',
            ],

            'tag_ids.*' => [
                'uuid',
                'distinct',
            ],

            'data_source' => [
                'sometimes',
                'required',
                Rule::in(
                    Asset::dataSources()
                ),
            ],

            'lifecycle_status' => [
                'sometimes',
                'required',
                Rule::in(
                    Asset::lifecycleStatuses()
                ),
            ],

            'warranty_provider' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'warranty_start_date' => [
                'sometimes',
                'nullable',
                'date_format:Y-m-d',
            ],

            'warranty_expiration_date' => [
                'sometimes',
                'nullable',
                'date_format:Y-m-d',
            ],

            'notes' => [
                'sometimes',
                'nullable',
                'string',
                'max:20000',
            ],

            'fields' => [
                'sometimes',
                'array',
            ],
        ]);

        try {
            $asset = $this
                ->assetService
                ->update(
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
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset updated successfully.',

            'data' => [
                'asset' =>
                    $this->formatAsset(
                        $asset,
                        true
                    ),
            ],
        ]);
    }

    public function destroy(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        $validated = $request->validate([
            'reason' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        try {
            $this
                ->assetService
                ->archive(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    actor: $request->user('api'),
                    reason:
                        $validated['reason']
                        ?? null,
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset archived successfully.',
        ]);
    }

    public function restore(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        try {
            $asset = $this
                ->assetService
                ->restore(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    actor: $request->user('api'),
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset restored successfully.',

            'data' => [
                'asset' =>
                    $this->formatAsset(
                        $asset,
                        true
                    ),
            ],
        ]);
    }

    private function formatAsset(
        Asset $asset,
        bool $includeFields = false
    ): array {
        $data = [
            'id' =>
                $asset->id,

            'tenant_id' =>
                $asset->tenant_id,

            'company_id' =>
                $asset->company_id,

            'asset_layout_id' =>
                $asset->asset_layout_id,

            'asset_layout_version_id' =>
                $asset->asset_layout_version_id,

            'name' =>
                $asset->name,

            'status' =>
                $asset->status,

            'owner_user_id' =>
                $asset->owner_user_id,

            'assigned_user_id' =>
                $asset->assigned_user_id,

            'data_source' =>
                $asset->data_source,

            'warranty_provider' =>
                $asset->warranty_provider,

            'warranty_start_date' =>
                $asset
                    ->warranty_start_date
                    ?->format('Y-m-d'),

            'warranty_expiration_date' =>
                $asset
                    ->warranty_expiration_date
                    ?->format('Y-m-d'),

            'lifecycle_status' =>
                $asset->lifecycle_status,

            'notes' =>
                $asset->notes,

            'created_by' =>
                $asset->created_by,

            'updated_by' =>
                $asset->updated_by,

            'created_at' =>
                $asset
                    ->created_at
                    ?->toISOString(),

            'updated_at' =>
                $asset
                    ->updated_at
                    ?->toISOString(),

            'deleted_at' =>
                $asset
                    ->deleted_at
                    ?->toISOString(),

            'company' =>
                $asset->relationLoaded('company') &&
                $asset->company
                    ? [
                        'id' =>
                            $asset->company->id,

                        'name' =>
                            $asset->company->name,
                    ]
                    : null,

            'layout' =>
                $asset->relationLoaded('layout') &&
                $asset->layout
                    ? [
                        'id' =>
                            $asset->layout->id,

                        'name' =>
                            $asset->layout->name,

                        'slug' =>
                            $asset->layout->slug,

                        'current_version' =>
                            $asset
                                ->layout
                                ->current_version,
                    ]
                    : null,

            'layout_version' =>
                $asset->relationLoaded('layoutVersion') &&
                $asset->layoutVersion
                    ? [
                        'id' =>
                            $asset
                                ->layoutVersion
                                ->id,

                        'version_number' =>
                            $asset
                                ->layoutVersion
                                ->version_number,
                    ]
                    : null,

            'owner' =>
                $asset->relationLoaded('owner') &&
                $asset->owner
                    ? [
                        'id' =>
                            $asset->owner->id,

                        'name' =>
                            $asset->owner->name,

                        'email' =>
                            $asset->owner->email,
                    ]
                    : null,

            'assigned_user' =>
                $asset->relationLoaded('assignedUser') &&
                $asset->assignedUser
                    ? [
                        'id' =>
                            $asset
                                ->assignedUser
                                ->id,

                        'name' =>
                            $asset
                                ->assignedUser
                                ->name,

                        'email' =>
                            $asset
                                ->assignedUser
                                ->email,
                    ]
                    : null,

            'tags' =>
                $asset->relationLoaded('tags')
                    ? $asset
                        ->tags
                        ->map(
                            fn ($tag) => [
                                'id' =>
                                    $tag->id,

                                'name' =>
                                    $tag->name,

                                'slug' =>
                                    $tag->slug,
                            ]
                        )
                        ->values()
                    : [],
        ];

        if ($includeFields) {
            $data['fields'] =
                $asset->relationLoaded('fieldValues')
                    ? $asset
                        ->fieldValues
                        ->map(
                            fn (AssetFieldValue $fieldValue) =>
                                $this->formatFieldValue(
                                    $fieldValue
                                )
                        )
                        ->values()
                    : [];
        }

        return $data;
    }

    private function formatFieldValue(
        AssetFieldValue $fieldValue
    ): array {
        return [
            'id' =>
                $fieldValue->id,

            'asset_layout_field_id' =>
                $fieldValue
                    ->asset_layout_field_id,

            'field_key' =>
                $fieldValue->field_key,

            'field_type' =>
                $fieldValue->field_type,

            'value' =>
                $fieldValue->resolvedValue(),

            'data_source' =>
                $fieldValue->data_source,

            'source_provider' =>
                $fieldValue->source_provider,

            'source_reference' =>
                $fieldValue->source_reference,

            'field' =>
                $fieldValue
                    ->relationLoaded('layoutField') &&
                $fieldValue->layoutField
                    ? [
                        'id' =>
                            $fieldValue
                                ->layoutField
                                ->id,

                        'label' =>
                            $fieldValue
                                ->layoutField
                                ->label,

                        'name' =>
                            $fieldValue
                                ->layoutField
                                ->name,

                        'field_key' =>
                            $fieldValue
                                ->layoutField
                                ->field_key,

                        'field_type' =>
                            $fieldValue
                                ->layoutField
                                ->field_type,

                        'is_required' =>
                            (bool) $fieldValue
                                ->layoutField
                                ->is_required,

                        'is_unique' =>
                            (bool) $fieldValue
                                ->layoutField
                                ->is_unique,

                        'is_visible' =>
                            (bool) $fieldValue
                                ->layoutField
                                ->is_visible,
                    ]
                    : null,

            'created_at' =>
                $fieldValue
                    ->created_at
                    ?->toISOString(),

            'updated_at' =>
                $fieldValue
                    ->updated_at
                    ?->toISOString(),
        ];
    }
}
