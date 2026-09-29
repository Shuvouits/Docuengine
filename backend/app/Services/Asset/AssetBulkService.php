<?php



namespace App\Services\Asset;



use App\Models\Asset;

use App\Models\AuditEvent;

use App\Models\User;

use App\Repositories\AssetRepository;

use App\Services\Audit\AuditEventService;

use App\Services\Company\CompanyAccessService;

use Illuminate\Support\Collection;

use Illuminate\Support\Facades\DB;

use Illuminate\Validation\ValidationException;



class AssetBulkService

{

    public function __construct(

        private readonly AssetService $assetService,

        private readonly AssetRepository $assetRepository,

        private readonly CompanyAccessService $companyAccessService,

        private readonly AuditEventService $auditEventService

    ) {

    }




    public function createMany(

        string $tenantId,

        array $assets,

        User $actor,

        ?string $ipAddress = null,

        ?string $userAgent = null,

        ?string $requestMethod = null,

        ?string $requestPath = null

    ): array {

        $this->validateBulkCount(

            $assets,

            'assets'

        );



        return DB::transaction(function () use (

            $tenantId,

            $assets,

            $actor,

            $ipAddress,

            $userAgent,

            $requestMethod,

            $requestPath

        ) {

            $createdAssets = collect();



            foreach ($assets as $assetData) {

                $createdAssets->push(

                    $this->assetService->create(

                        tenantId: $tenantId,

                        data: $assetData,

                        actor: $actor,

                        ipAddress: $ipAddress,

                        userAgent: $userAgent,

                        requestMethod: $requestMethod,

                        requestPath: $requestPath

                    )

                );

            }



            $this->auditEventService->record(

                tenantId: $tenantId,

                actor: $actor,

                action: AuditEvent::ACTION_CREATED,

                category: AuditEvent::CATEGORY_RESOURCE,

                targetType: 'asset_bulk',

                targetId: null,

                targetLabel: 'Bulk Asset Create',

                description: 'Bulk asset create completed.',

                changes: null,

                metadata: [

                    'operation' => 'create',

                    'record_count' => $createdAssets->count(),

                    'asset_ids' => $createdAssets

                        ->pluck('id')

                        ->values()

                        ->all(),

                    'company_ids' => $createdAssets

                        ->pluck('company_id')

                        ->filter()

                        ->unique()

                        ->values()

                        ->all(),

                ],

                ipAddress: $ipAddress,

                userAgent: $userAgent,

                requestMethod: $requestMethod,

                requestPath: $requestPath

            );



            return [

                'count' =>

                    $createdAssets->count(),



                'assets' =>

                    $createdAssets,

            ];

        });

    }




    public function updateMany(

        string $tenantId,

        array $items,

        User $actor,

        ?string $ipAddress = null,

        ?string $userAgent = null,

        ?string $requestMethod = null,

        ?string $requestPath = null

    ): array {

        $this->validateBulkCount(

            $items,

            'items'

        );



        return DB::transaction(function () use (

            $tenantId,

            $items,

            $actor,

            $ipAddress,

            $userAgent,

            $requestMethod,

            $requestPath

        ) {

            $updatedAssets = collect();



            foreach ($items as $index => $item) {

                $assetId = trim(

                    (string) (

                        $item['asset_id']

                        ?? ''

                    )

                );



                if ($assetId === '') {

                    throw ValidationException::withMessages([

                        "items.{$index}.asset_id" => [

                            'Asset ID is required.',

                        ],

                    ]);

                }



                $data =

                    $item['data']

                    ?? [];



                if (

                    !is_array($data) ||

                    empty($data)

                ) {

                    throw ValidationException::withMessages([

                        "items.{$index}.data" => [

                            'At least one asset field must be provided.',

                        ],

                    ]);

                }



                $updatedAssets->push(

                    $this->assetService->update(

                        tenantId: $tenantId,

                        assetId: $assetId,

                        data: $data,

                        actor: $actor,

                        ipAddress: $ipAddress,

                        userAgent: $userAgent,

                        requestMethod: $requestMethod,

                        requestPath: $requestPath

                    )

                );

            }



            $this->auditEventService->record(

                tenantId: $tenantId,

                actor: $actor,

                action: AuditEvent::ACTION_UPDATED,

                category: AuditEvent::CATEGORY_RESOURCE,

                targetType: 'asset_bulk',

                targetId: null,

                targetLabel: 'Bulk Asset Update',

                description: 'Bulk asset update completed.',

                changes: null,

                metadata: [

                    'operation' => 'update',

                    'record_count' => $updatedAssets->count(),

                    'asset_ids' => $updatedAssets

                        ->pluck('id')

                        ->values()

                        ->all(),

                    'company_ids' => $updatedAssets

                        ->pluck('company_id')

                        ->filter()

                        ->unique()

                        ->values()

                        ->all(),

                ],

                ipAddress: $ipAddress,

                userAgent: $userAgent,

                requestMethod: $requestMethod,

                requestPath: $requestPath

            );



            return [

                'count' =>

                    $updatedAssets->count(),



                'assets' =>

                    $updatedAssets,

            ];

        });

    }




    public function archiveMany(

        string $tenantId,

        array $assetIds,

        User $actor,

        ?string $reason = null,

        ?string $ipAddress = null,

        ?string $userAgent = null,

        ?string $requestMethod = null,

        ?string $requestPath = null

    ): array {

        $assetIds = array_values(

            array_unique(

                array_filter(

                    array_map(

                        fn ($assetId) =>

                            trim(

                                (string) $assetId

                            ),

                        $assetIds

                    )

                )

            )

        );



        $this->validateBulkCount(

            $assetIds,

            'asset_ids'

        );



        return DB::transaction(function () use (

            $tenantId,

            $assetIds,

            $actor,

            $reason,

            $ipAddress,

            $userAgent,

            $requestMethod,

            $requestPath

        ) {

            $archivedAssets = [];



            foreach ($assetIds as $assetId) {

                $asset = $this

                    ->assetService

                    ->getById(

                        tenantId: $tenantId,

                        assetId: $assetId,

                        actor: $actor

                    );



                $archivedAssets[] = [

                    'id' =>

                        $asset->id,



                    'name' =>

                        $asset->name,



                    'company_id' =>

                        $asset->company_id,

                ];



                $this

                    ->assetService

                    ->archive(

                        tenantId: $tenantId,

                        assetId: $assetId,

                        actor: $actor,

                        reason: $reason,

                        ipAddress: $ipAddress,

                        userAgent: $userAgent,

                        requestMethod: $requestMethod,

                        requestPath: $requestPath

                    );

            }



            $this->auditEventService->record(

                tenantId: $tenantId,

                actor: $actor,

                action: AuditEvent::ACTION_ARCHIVED,

                category: AuditEvent::CATEGORY_ARCHIVE,

                targetType: 'asset_bulk',

                targetId: null,

                targetLabel: 'Bulk Asset Archive',

                description: 'Bulk asset archive completed.',

                changes: null,

                metadata: [

                    'operation' => 'archive',

                    'record_count' => count(

                        $archivedAssets

                    ),

                    'asset_ids' => collect(

                        $archivedAssets

                    )

                        ->pluck('id')

                        ->values()

                        ->all(),

                    'company_ids' => collect(

                        $archivedAssets

                    )

                        ->pluck('company_id')

                        ->filter()

                        ->unique()

                        ->values()

                        ->all(),

                    'reason' =>

                        $reason,

                ],

                ipAddress: $ipAddress,

                userAgent: $userAgent,

                requestMethod: $requestMethod,

                requestPath: $requestPath

            );



            return [

                'count' =>

                    count(

                        $archivedAssets

                    ),



                'assets' =>

                    $archivedAssets,

            ];

        });

    }




    public function prepareExport(

        string $tenantId,

        array $filters,

        User $actor,

        ?string $ipAddress = null,

        ?string $userAgent = null,

        ?string $requestMethod = null,

        ?string $requestPath = null

    ): array {

        $selectedAssetIds =

            $filters['asset_ids']

            ?? null;



        unset(

            $filters['asset_ids']

        );



        if (

            is_array($selectedAssetIds) &&

            !empty($selectedAssetIds)

        ) {

            $selectedAssetIds = array_values(

                array_unique(

                    array_filter(

                        array_map(

                            fn ($assetId) =>

                                trim(

                                    (string) $assetId

                                ),

                            $selectedAssetIds

                        )

                    )

                )

            );



            if (

                count($selectedAssetIds) >

                500

            ) {

                throw ValidationException::withMessages([

                    'asset_ids' => [

                        'A maximum of 500 selected assets can be exported at once.',

                    ],

                ]);

            }



            $assets = collect();



            foreach (

                $selectedAssetIds

                as $assetId

            ) {

                $assets->push(

                    $this

                        ->assetService

                        ->getById(

                            tenantId: $tenantId,

                            assetId: $assetId,

                            actor: $actor

                        )

                );

            }

        } else {

            $allowedCompanyIds = $this

                ->companyAccessService

                ->allowedCompanyIds(

                    $tenantId,

                    $actor

                );



            if (

                $allowedCompanyIds !== null

            ) {

                $filters['company_ids'] =

                    $allowedCompanyIds;

            }



            $assets = $this

                ->assetRepository

                ->getForExport(

                    tenantId: $tenantId,

                    filters: $filters,

                    maxRows: 10000

                );

        }



        $rows = $assets

            ->map(

                fn (Asset $asset) =>

                    $this->formatExportRow(

                        $asset

                    )

            )

            ->values();



        $this->auditEventService->record(

            tenantId: $tenantId,

            actor: $actor,

            action: AuditEvent::ACTION_EXPORTED,

            category: AuditEvent::CATEGORY_EXPORT,

            targetType: 'asset',

            targetId: null,

            targetLabel: 'Asset Export',

            description: 'Asset records were exported.',

            changes: null,

            metadata: [

                'operation' => 'export',

                'record_count' =>

                    $rows->count(),

                'filters' =>

                    $this->cleanExportFilters(

                        $filters

                    ),

                'selected_asset_ids' =>

                    $selectedAssetIds,

            ],

            ipAddress: $ipAddress,

            userAgent: $userAgent,

            requestMethod: $requestMethod,

            requestPath: $requestPath

        );



        return [

            'count' =>

                $rows->count(),



            'columns' => [

                'id',

                'company_id',

                'company_name',

                'asset_layout_id',

                'asset_layout_name',

                'asset_layout_version_id',

                'asset_layout_version',

                'name',

                'status',

                'owner_user_id',

                'owner_name',

                'assigned_user_id',

                'assigned_user_name',

                'data_source',

                'warranty_provider',

                'warranty_start_date',

                'warranty_expiration_date',

                'lifecycle_status',

                'notes',

                'tags',

                'dynamic_fields',

                'created_at',

                'updated_at',

            ],



            'rows' =>

                $rows->all(),

        ];

    }




    private function formatExportRow(

        Asset $asset

    ): array {

        $dynamicFields = [];



        if (

            $asset->relationLoaded(

                'fieldValues'

            )

        ) {

            foreach (

                $asset->fieldValues

                as $fieldValue

            ) {

                $key =

                    $fieldValue->field_key

                    ?: (

                        $fieldValue

                            ->layoutField

                            ?->field_key

                        ?? $fieldValue

                            ->asset_layout_field_id

                    );



                $dynamicFields[$key] =

                    $fieldValue

                        ->resolvedValue();

            }

        }



        $tags = $asset

            ->relationLoaded('tags')

            ? $asset

                ->tags

                ->pluck('name')

                ->values()

                ->all()

            : [];



        return [

            'id' =>

                $asset->id,



            'company_id' =>

                $asset->company_id,



            'company_name' =>

                $asset->company?->name,



            'asset_layout_id' =>

                $asset->asset_layout_id,



            'asset_layout_name' =>

                $asset->layout?->name,



            'asset_layout_version_id' =>

                $asset->asset_layout_version_id,



            'asset_layout_version' =>

                $asset

                    ->layoutVersion

                    ?->version_number,



            'name' =>

                $asset->name,



            'status' =>

                $asset->status,



            'owner_user_id' =>

                $asset->owner_user_id,



            'owner_name' =>

                $asset->owner?->name,



            'assigned_user_id' =>

                $asset->assigned_user_id,



            'assigned_user_name' =>

                $asset

                    ->assignedUser

                    ?->name,



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



            'tags' =>

                implode(

                    '; ',

                    $tags

                ),



            'dynamic_fields' =>

                json_encode(

                    $dynamicFields,

                    JSON_UNESCAPED_UNICODE |

                    JSON_UNESCAPED_SLASHES

                ),



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




    private function validateBulkCount(

        array $items,

        string $field

    ): void {

        if (empty($items)) {

            throw ValidationException::withMessages([

                $field => [

                    'At least one asset is required.',

                ],

            ]);

        }



        if (count($items) > 100) {

            throw ValidationException::withMessages([

                $field => [

                    'A maximum of 100 assets can be processed at once.',

                ],

            ]);

        }

    }




    private function cleanExportFilters(

        array $filters

    ): array {

        $allowedKeys = [

            'search',

            'company_id',

            'asset_layout_id',

            'status',

            'owner_user_id',

            'assigned_user_id',

            'tag_ids',

            'data_source',

            'lifecycle_status',

            'warranty_status',

            'archived',

            'sort_by',

            'sort_direction',

        ];



        return collect(

            $filters

        )

            ->only(

                $allowedKeys

            )

            ->all();

    }

}
