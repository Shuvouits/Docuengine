<?php



namespace App\Http\Controllers\Api\Tenant;



use App\Http\Controllers\Controller;

use App\Models\Asset;

use App\Services\Asset\AssetBulkService;

use DomainException;

use Illuminate\Http\JsonResponse;

use Illuminate\Http\Request;

use Illuminate\Validation\Rule;



class AssetBulkController extends Controller

{

    public function __construct(

        private readonly AssetBulkService $assetBulkService

    ) {

    }




    public function create(

        Request $request,

        string $tenantId

    ): JsonResponse {

        $validated = $request->validate([

            'assets' => [

                'required',

                'array',

                'min:1',

                'max:100',

            ],



            'assets.*.name' => [

                'required',

                'string',

                'max:200',

            ],



            'assets.*.company_id' => [

                'required',

                'uuid',

            ],



            'assets.*.asset_layout_id' => [

                'required',

                'uuid',

            ],



            'assets.*.status' => [

                'nullable',

                Rule::in(

                    Asset::statuses()

                ),

            ],



            'assets.*.owner_user_id' => [

                'nullable',

                'uuid',

            ],



            'assets.*.assigned_user_id' => [

                'nullable',

                'uuid',

            ],



            'assets.*.tag_ids' => [

                'nullable',

                'array',

                'max:50',

            ],



            'assets.*.tag_ids.*' => [

                'uuid',

                'distinct',

            ],



            'assets.*.data_source' => [

                'nullable',

                Rule::in(

                    Asset::dataSources()

                ),

            ],



            'assets.*.lifecycle_status' => [

                'nullable',

                Rule::in(

                    Asset::lifecycleStatuses()

                ),

            ],



            'assets.*.warranty_provider' => [

                'nullable',

                'string',

                'max:150',

            ],



            'assets.*.warranty_start_date' => [

                'nullable',

                'date_format:Y-m-d',

            ],



            'assets.*.warranty_expiration_date' => [

                'nullable',

                'date_format:Y-m-d',

            ],



            'assets.*.notes' => [

                'nullable',

                'string',

                'max:20000',

            ],



            'assets.*.fields' => [

                'nullable',

                'array',

            ],

        ]);



        try {

            $result = $this

                ->assetBulkService

                ->createMany(

                    tenantId: $tenantId,

                    assets: $validated['assets'],

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

                'Assets created successfully.',



            'data' => [

                'count' =>

                    $result['count'],



                'assets' =>

                    collect(

                        $result['assets']

                    )

                        ->map(

                            fn (Asset $asset) =>

                                $this->formatAsset(

                                    $asset

                                )

                        )

                        ->values()

                        ->all(),

            ],

        ], 201);

    }




    public function update(

        Request $request,

        string $tenantId

    ): JsonResponse {

        $validated = $request->validate([

            'items' => [

                'required',

                'array',

                'min:1',

                'max:100',

            ],



            'items.*.asset_id' => [

                'required',

                'uuid',

                'distinct',

            ],



            'items.*.data' => [

                'required',

                'array',

                'min:1',

            ],



            'items.*.data.name' => [

                'sometimes',

                'required',

                'string',

                'max:200',

            ],



            'items.*.data.company_id' => [

                'sometimes',

                'required',

                'uuid',

            ],



            'items.*.data.asset_layout_id' => [

                'sometimes',

                'required',

                'uuid',

            ],



            'items.*.data.status' => [

                'sometimes',

                'required',

                Rule::in(

                    Asset::statuses()

                ),

            ],



            'items.*.data.owner_user_id' => [

                'sometimes',

                'nullable',

                'uuid',

            ],



            'items.*.data.assigned_user_id' => [

                'sometimes',

                'nullable',

                'uuid',

            ],



            'items.*.data.tag_ids' => [

                'sometimes',

                'array',

                'max:50',

            ],



            'items.*.data.tag_ids.*' => [

                'uuid',

                'distinct',

            ],



            'items.*.data.data_source' => [

                'sometimes',

                'required',

                Rule::in(

                    Asset::dataSources()

                ),

            ],



            'items.*.data.lifecycle_status' => [

                'sometimes',

                'required',

                Rule::in(

                    Asset::lifecycleStatuses()

                ),

            ],



            'items.*.data.warranty_provider' => [

                'sometimes',

                'nullable',

                'string',

                'max:150',

            ],



            'items.*.data.warranty_start_date' => [

                'sometimes',

                'nullable',

                'date_format:Y-m-d',

            ],



            'items.*.data.warranty_expiration_date' => [

                'sometimes',

                'nullable',

                'date_format:Y-m-d',

            ],



            'items.*.data.notes' => [

                'sometimes',

                'nullable',

                'string',

                'max:20000',

            ],



            'items.*.data.fields' => [

                'sometimes',

                'array',

            ],

        ]);



        try {

            $result = $this

                ->assetBulkService

                ->updateMany(

                    tenantId: $tenantId,

                    items: $validated['items'],

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

                'Assets updated successfully.',



            'data' => [

                'count' =>

                    $result['count'],



                'assets' =>

                    collect(

                        $result['assets']

                    )

                        ->map(

                            fn (Asset $asset) =>

                                $this->formatAsset(

                                    $asset

                                )

                        )

                        ->values()

                        ->all(),

            ],

        ]);

    }




    public function archive(

        Request $request,

        string $tenantId

    ): JsonResponse {

        $validated = $request->validate([

            'asset_ids' => [

                'required',

                'array',

                'min:1',

                'max:100',

            ],



            'asset_ids.*' => [

                'required',

                'uuid',

                'distinct',

            ],



            'reason' => [

                'nullable',

                'string',

                'max:1000',

            ],

        ]);



        try {

            $result = $this

                ->assetBulkService

                ->archiveMany(

                    tenantId: $tenantId,

                    assetIds: $validated['asset_ids'],

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

                'Assets archived successfully.',



            'data' =>

                $result,

        ]);

    }




    public function export(

        Request $request,

        string $tenantId

    ): JsonResponse {

        $validated = $request->validate([

            'asset_ids' => [

                'nullable',

                'array',

                'max:500',

            ],



            'asset_ids.*' => [

                'uuid',

                'distinct',

            ],



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

        ]);



        try {

            $export = $this

                ->assetBulkService

                ->prepareExport(

                    tenantId: $tenantId,

                    filters: $validated,

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

                'Asset export prepared successfully.',



            'data' =>

                $export,

        ]);

    }




    private function formatAsset(

        Asset $asset

    ): array {

        return [

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



            'company' =>

                $asset->relationLoaded(

                    'company'

                ) &&

                $asset->company

                    ? [

                        'id' =>

                            $asset->company->id,



                        'name' =>

                            $asset->company->name,

                    ]

                    : null,



            'layout' =>

                $asset->relationLoaded(

                    'layout'

                ) &&

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



            'owner' =>

                $asset->relationLoaded(

                    'owner'

                ) &&

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

                $asset->relationLoaded(

                    'assignedUser'

                ) &&

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

                $asset->relationLoaded(

                    'tags'

                )

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

                        ->all()

                    : [],



            'created_at' =>

                $asset

                    ->created_at

                    ?->toISOString(),



            'updated_at' =>

                $asset

                    ->updated_at

                    ?->toISOString(),

        ];

    }

}
