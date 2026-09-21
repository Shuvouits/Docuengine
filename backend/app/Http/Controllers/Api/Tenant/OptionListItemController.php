<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssetLayout\StoreOptionListItemRequest;
use App\Http\Requests\AssetLayout\UpdateOptionListItemRequest;
use App\Models\OptionListItem;
use App\Services\AssetLayout\OptionListItemService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class OptionListItemController extends Controller
{
    public function __construct(
        private OptionListItemService $optionListItemService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | List Items
    |--------------------------------------------------------------------------
    */

    public function index(
        string $tenantId,
        string $optionListId
    ): JsonResponse {
        try {
            $items = $this
                ->optionListItemService
                ->getAll(
                    $tenantId,
                    $optionListId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Option list not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Option list items retrieved successfully.',

            'data' => [
                'items' => $items
                    ->map(
                        fn (OptionListItem $item) =>
                            $this->formatItem($item)
                    )
                    ->values(),

                'count' => $items->count(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show Item
    |--------------------------------------------------------------------------
    */

    public function show(
        string $tenantId,
        string $optionListId,
        string $itemId
    ): JsonResponse {
        try {
            $item = $this
                ->optionListItemService
                ->getById(
                    $tenantId,
                    $optionListId,
                    $itemId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Option list item not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Option list item retrieved successfully.',

            'data' => [
                'item' => $this->formatItem($item),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Item
    |--------------------------------------------------------------------------
    */

    public function store(
        StoreOptionListItemRequest $request,
        string $tenantId,
        string $optionListId
    ): JsonResponse {
        try {
            $item = $this
                ->optionListItemService
                ->create(
                    tenantId: $tenantId,
                    optionListId: $optionListId,
                    userId: $request->user('api')->id,
                    data: $request->validated()
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Option list not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Option list item created successfully.',

            'data' => [
                'item' => $this->formatItem($item),
            ],
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Item
    |--------------------------------------------------------------------------
    */

    public function update(
        UpdateOptionListItemRequest $request,
        string $tenantId,
        string $optionListId,
        string $itemId
    ): JsonResponse {
        try {
            $item = $this
                ->optionListItemService
                ->update(
                    tenantId: $tenantId,
                    optionListId: $optionListId,
                    itemId: $itemId,
                    userId: $request->user('api')->id,
                    data: $request->validated()
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Option list item not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Option list item updated successfully.',

            'data' => [
                'item' => $this->formatItem($item),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Item
    |--------------------------------------------------------------------------
    */

    public function destroy(
        string $tenantId,
        string $optionListId,
        string $itemId
    ): JsonResponse {
        try {
            $this
                ->optionListItemService
                ->delete(
                    $tenantId,
                    $optionListId,
                    $itemId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Option list item not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Option list item archived successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Item
    |--------------------------------------------------------------------------
    */

    public function restore(
        string $tenantId,
        string $optionListId,
        string $itemId
    ): JsonResponse {
        try {
            $item = $this
                ->optionListItemService
                ->restore(
                    $tenantId,
                    $optionListId,
                    $itemId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Archived option list item not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Option list item restored successfully.',

            'data' => [
                'item' => $this->formatItem($item),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Formatter
    |--------------------------------------------------------------------------
    */

    private function formatItem(
        OptionListItem $item
    ): array {
        return [
            'id' => $item->id,
            'tenant_id' => $item->tenant_id,
            'option_list_id' => $item->option_list_id,
            'label' => $item->label,
            'value' => $item->value,
            'sort_order' => $item->sort_order,
            'is_active' => $item->is_active,
            'created_by' => $item->created_by,
            'updated_by' => $item->updated_by,
            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at,
        ];
    }
}
