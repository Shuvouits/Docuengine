<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssetLayout\StoreAssetLayoutFieldRequest;
use App\Http\Requests\AssetLayout\UpdateAssetLayoutFieldRequest;
use App\Models\AssetLayoutField;
use App\Services\AssetLayout\AssetLayoutFieldService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AssetLayoutFieldController extends Controller
{
    public function __construct(
        private AssetLayoutFieldService $assetLayoutFieldService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | List Fields
    |--------------------------------------------------------------------------
    */

    public function index(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): JsonResponse {
        try {
            $fields = $this
                ->assetLayoutFieldService
                ->getAll(
                    $tenantId,
                    $layoutId,
                    $sectionId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout section not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout fields retrieved successfully.',
            'data' => [
                'fields' => $fields
                    ->map(
                        fn (AssetLayoutField $field) =>
                            $this->formatField($field)
                    )
                    ->values(),

                'count' => $fields->count(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show Field
    |--------------------------------------------------------------------------
    */

    public function show(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $fieldId
    ): JsonResponse {
        try {
            $field = $this
                ->assetLayoutFieldService
                ->getById(
                    $tenantId,
                    $layoutId,
                    $sectionId,
                    $fieldId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout field not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout field retrieved successfully.',
            'data' => [
                'field' => $this->formatField($field),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Field
    |--------------------------------------------------------------------------
    */

    public function store(
        StoreAssetLayoutFieldRequest $request,
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): JsonResponse {
        try {
            $field = $this
                ->assetLayoutFieldService
                ->create(
                    tenantId: $tenantId,
                    layoutId: $layoutId,
                    sectionId: $sectionId,
                    userId: $request->user('api')->id,
                    data: $request->validated()
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout section not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout field created successfully.',
            'data' => [
                'field' => $this->formatField($field),
            ],
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Field
    |--------------------------------------------------------------------------
    */

    public function update(
        UpdateAssetLayoutFieldRequest $request,
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $fieldId
    ): JsonResponse {
        try {
            $field = $this
                ->assetLayoutFieldService
                ->update(
                    tenantId: $tenantId,
                    layoutId: $layoutId,
                    sectionId: $sectionId,
                    fieldId: $fieldId,
                    userId: $request->user('api')->id,
                    data: $request->validated()
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout field not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout field updated successfully.',
            'data' => [
                'field' => $this->formatField($field),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Field
    |--------------------------------------------------------------------------
    */

    public function destroy(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $fieldId
    ): JsonResponse {
        try {
            $this
                ->assetLayoutFieldService
                ->delete(
                    $tenantId,
                    $layoutId,
                    $sectionId,
                    $fieldId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Asset layout field not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout field archived successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Field
    |--------------------------------------------------------------------------
    */

    public function restore(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $fieldId
    ): JsonResponse {
        try {
            $field = $this
                ->assetLayoutFieldService
                ->restore(
                    $tenantId,
                    $layoutId,
                    $sectionId,
                    $fieldId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Archived asset layout field not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Asset layout field restored successfully.',
            'data' => [
                'field' => $this->formatField($field),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Formatter
    |--------------------------------------------------------------------------
    */

    private function formatField(
        AssetLayoutField $field
    ): array {
        $optionList = null;

        if (
            $field->option_list_id
            && $field->relationLoaded('optionList')
            && $field->optionList
        ) {
            $optionList = [
                'id' => $field->optionList->id,
                'name' => $field->optionList->name,
                'slug' => $field->optionList->slug,
                'is_active' => $field->optionList->is_active,

                'items' => $field->optionList
                    ->relationLoaded('items')
                    ? $field->optionList->items
                        ->map(fn ($item) => [
                            'id' => $item->id,
                            'label' => $item->label,
                            'value' => $item->value,
                            'sort_order' => $item->sort_order,
                            'is_active' => $item->is_active,
                        ])
                        ->values()
                    : [],
            ];
        }

        return [
            'id' => $field->id,
            'tenant_id' => $field->tenant_id,
            'asset_layout_id' => $field->asset_layout_id,
            'section_id' => $field->section_id,

            'name' => $field->name,
            'field_key' => $field->field_key,
            'field_type' => $field->field_type,
            'label' => $field->label,

            'description' => $field->description,
            'placeholder' => $field->placeholder,

            'sort_order' => $field->sort_order,

            'is_required' => $field->is_required,
            'is_unique' => $field->is_unique,
            'is_visible' => $field->is_visible,

            'default_value' => $field->default_value,
            'validation_rules' => $field->validation_rules,
            'visibility_rules' => $field->visibility_rules,
            'settings' => $field->settings,

            'option_list_id' => $field->option_list_id,
            'option_list' => $optionList,

            'created_by' => $field->created_by,
            'updated_by' => $field->updated_by,

            'created_at' => $field->created_at,
            'updated_at' => $field->updated_at,
        ];
    }
}