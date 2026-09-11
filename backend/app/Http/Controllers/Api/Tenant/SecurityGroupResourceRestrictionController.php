<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\SecurityGroupResourceRestriction;
use App\Services\Security\SecurityGroupResourceRestrictionService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecurityGroupResourceRestrictionController extends Controller
{
    public function __construct(
        private SecurityGroupResourceRestrictionService $restrictionService
    ) {
    }

    public function index(
        string $tenantId,
        string $groupId
    ): JsonResponse {
        try {
            $restrictions = $this
                ->restrictionService
                ->getAll(
                    $tenantId,
                    $groupId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Resource restrictions retrieved successfully.',

            'data' => [
                'restrictions' => $restrictions
                    ->map(
                        fn (
                            SecurityGroupResourceRestriction $restriction
                        ) => $this->formatRestriction(
                            $restriction
                        )
                    )
                    ->values(),

                'count' => $restrictions->count(),
            ],
        ]);
    }

    public function show(
        string $tenantId,
        string $groupId,
        string $restrictionId
    ): JsonResponse {
        try {
            $restriction = $this
                ->restrictionService
                ->getById(
                    $tenantId,
                    $groupId,
                    $restrictionId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        if (!$restriction) {
            return response()->json([
                'message' => 'Resource restriction not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Resource restriction retrieved successfully.',

            'data' => [
                'restriction' =>
                    $this->formatRestriction(
                        $restriction
                    ),
            ],
        ]);
    }

    public function store(
        Request $request,
        string $tenantId,
        string $groupId
    ): JsonResponse {
        $validated = $request->validate([
            'resource_type' => [
                'required',
                'string',
                'max:50',
            ],

            'resource_id' => [
                'required',
                'uuid',
            ],

            'access_level' => [
                'nullable',
                'string',
                'max:20',
            ],
        ]);

        try {
            $restriction = $this
                ->restrictionService
                ->create(
                    $tenantId,
                    $groupId,
                    $request->user()->id,
                    $validated
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Resource restriction created successfully.',

            'data' => [
                'restriction' =>
                    $this->formatRestriction(
                        $restriction
                    ),
            ],
        ], 201);
    }

    public function update(
        Request $request,
        string $tenantId,
        string $groupId,
        string $restrictionId
    ): JsonResponse {
        $validated = $request->validate([
            'access_level' => [
                'required',
                'string',
                'max:20',
            ],
        ]);

        try {
            $restriction = $this
                ->restrictionService
                ->update(
                    $tenantId,
                    $groupId,
                    $restrictionId,
                    $validated
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Resource restriction updated successfully.',

            'data' => [
                'restriction' =>
                    $this->formatRestriction(
                        $restriction
                    ),
            ],
        ]);
    }

    public function destroy(
        string $tenantId,
        string $groupId,
        string $restrictionId
    ): JsonResponse {
        try {
            $this
                ->restrictionService
                ->delete(
                    $tenantId,
                    $groupId,
                    $restrictionId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Resource restriction deleted successfully.',
        ]);
    }

    private function formatRestriction(
        SecurityGroupResourceRestriction $restriction
    ): array {
        return [
            'id' => $restriction->id,

            'tenant_id' =>
                $restriction->tenant_id,

            'security_group_id' =>
                $restriction->security_group_id,

            'resource_type' =>
                $restriction->resource_type,

            'resource_id' =>
                $restriction->resource_id,

            'access_level' =>
                $restriction->access_level,

            'created_by' => $restriction->creator
                ? [
                    'id' => $restriction->creator->id,
                    'name' => $restriction->creator->name,
                    'email' => $restriction->creator->email,
                ]
                : null,

            'created_at' =>
                $restriction->created_at,

            'updated_at' =>
                $restriction->updated_at,
        ];
    }
}
