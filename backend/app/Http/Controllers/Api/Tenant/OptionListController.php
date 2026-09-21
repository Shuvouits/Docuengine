<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssetLayout\StoreOptionListRequest;
use App\Http\Requests\AssetLayout\UpdateOptionListRequest;
use App\Models\OptionList;
use App\Services\AssetLayout\OptionListService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OptionListController extends Controller
{
    public function __construct(
        private OptionListService $optionListService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | List Option Lists
    |--------------------------------------------------------------------------
    */

    public function index(
        string $tenantId
    ): JsonResponse {
        $optionLists = $this
            ->optionListService
            ->getAll($tenantId);

        return response()->json([
            'message' => 'Option lists retrieved successfully.',

            'data' => [
                'option_lists' => $optionLists
                    ->map(
                        fn (OptionList $optionList) =>
                            $this->formatOptionList($optionList)
                    )
                    ->values(),

                'count' => $optionLists->count(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show Option List
    |--------------------------------------------------------------------------
    */

    public function show(
        string $tenantId,
        string $optionListId
    ): JsonResponse {
        try {
            $optionList = $this
                ->optionListService
                ->getById(
                    $tenantId,
                    $optionListId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Option list not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Option list retrieved successfully.',

            'data' => [
                'option_list' =>
                    $this->formatOptionList($optionList),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Option List
    |--------------------------------------------------------------------------
    */

    public function store(
        StoreOptionListRequest $request,
        string $tenantId
    ): JsonResponse {
        $actor = $request->user('api');

        $optionList = $this
            ->optionListService
            ->create(
                tenantId: $tenantId,
                userId: $actor->id,
                data: $request->validated()
            );

        $optionList->load('items');

        return response()->json([
            'message' => 'Option list created successfully.',

            'data' => [
                'option_list' =>
                    $this->formatOptionList($optionList),
            ],
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Option List
    |--------------------------------------------------------------------------
    */

    public function update(
        UpdateOptionListRequest $request,
        string $tenantId,
        string $optionListId
    ): JsonResponse {
        try {
            $optionList = $this
                ->optionListService
                ->update(
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

        $optionList->load('items');

        return response()->json([
            'message' => 'Option list updated successfully.',

            'data' => [
                'option_list' =>
                    $this->formatOptionList($optionList),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Option List
    |--------------------------------------------------------------------------
    */

    public function destroy(
        string $tenantId,
        string $optionListId
    ): JsonResponse {
        try {
            $this
                ->optionListService
                ->delete(
                    $tenantId,
                    $optionListId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Option list not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Option list archived successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Option List
    |--------------------------------------------------------------------------
    */

    public function restore(
        string $tenantId,
        string $optionListId
    ): JsonResponse {
        try {
            $optionList = $this
                ->optionListService
                ->restore(
                    $tenantId,
                    $optionListId
                );
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Archived option list not found.',
            ], 404);
        }

        $optionList->load('items');

        return response()->json([
            'message' => 'Option list restored successfully.',

            'data' => [
                'option_list' =>
                    $this->formatOptionList($optionList),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Formatter
    |--------------------------------------------------------------------------
    */

    private function formatOptionList(
        OptionList $optionList
    ): array {
        return [
            'id' => $optionList->id,
            'tenant_id' => $optionList->tenant_id,
            'name' => $optionList->name,
            'slug' => $optionList->slug,
            'description' => $optionList->description,
            'is_active' => $optionList->is_active,

            'items' => $optionList->relationLoaded('items')
                ? $optionList->items
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'label' => $item->label,
                            'value' => $item->value,
                            'sort_order' => $item->sort_order,
                            'is_active' => $item->is_active,
                            'created_at' => $item->created_at,
                            'updated_at' => $item->updated_at,
                        ];
                    })
                    ->values()
                : [],

            'items_count' => $optionList->relationLoaded('items')
                ? $optionList->items->count()
                : 0,

            'created_by' => $optionList->created_by,
            'updated_by' => $optionList->updated_by,
            'created_at' => $optionList->created_at,
            'updated_at' => $optionList->updated_at,
        ];
    }
}
