<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\Security\TenantIpAccessService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantIpAccessController extends Controller
{
    public function __construct(
        private TenantIpAccessService $tenantIpAccessService
    ) {
    }

    public function index(
        string $tenantId
    ): JsonResponse {
        $policy = $this
            ->tenantIpAccessService
            ->getPolicy(
                $tenantId
            );

        $entries = $this
            ->tenantIpAccessService
            ->listEntries(
                $tenantId
            )
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'label' => $entry->label,
                    'ip_or_cidr' => $entry->ip_or_cidr,
                    'is_active' => $entry->is_active,
                    'created_by' => $entry->created_by,
                    'created_at' => $entry->created_at,
                    'updated_at' => $entry->updated_at,
                ];
            })
            ->values();

        return response()->json([
            'message' =>
                'IP access settings retrieved successfully.',

            'data' => [
                'policy' => $policy,
                'entries' => $entries,
            ],
        ]);
    }



    public function updatePolicy(
    Request $request,
    string $tenantId
): JsonResponse {
    $validated = $request->validate([
        'enabled' => [
            'required',
            'boolean',
        ],
    ]);

    try {
        $policy = $this
            ->tenantIpAccessService
            ->updatePolicy(
                $tenantId,
                (bool) $validated['enabled'],
                $request->user(),
                $request->ip()
            );
    } catch (DomainException $exception) {
        return response()->json([
            'message' => $exception->getMessage(),
        ], 422);
    }

    return response()->json([
        'message' =>
            'IP access policy updated successfully.',

        'data' => [
            'policy' => [
                'id' => $policy->id,
                'tenant_id' => $policy->tenant_id,
                'enabled' => $policy->enabled,
                'updated_by' => $policy->updated_by,
                'updated_at' => $policy->updated_at,
            ],
        ],
    ]);
}



    public function storeEntry(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'label' => [
                'nullable',
                'string',
                'max:100',
            ],

            'ip_or_cidr' => [
                'required',
                'string',
                'max:64',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        try {
            $entry = $this
                ->tenantIpAccessService
                ->createEntry(
                    $tenantId,
                    $request->user(),
                    $validated['ip_or_cidr'],
                    $validated['label'] ?? null,
                    $validated['is_active'] ?? true
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'IP allowlist entry created successfully.',

            'data' => [
                'entry' => [
                    'id' => $entry->id,
                    'tenant_id' => $entry->tenant_id,
                    'label' => $entry->label,
                    'ip_or_cidr' => $entry->ip_or_cidr,
                    'is_active' => $entry->is_active,
                    'created_by' => $entry->created_by,
                    'created_at' => $entry->created_at,
                ],
            ],
        ], 201);
    }


    public function updateEntry(
    Request $request,
    string $tenantId,
    string $entryId
): JsonResponse {
    $validated = $request->validate([
        'label' => [
            'sometimes',
            'nullable',
            'string',
            'max:100',
        ],

        'ip_or_cidr' => [
            'sometimes',
            'required',
            'string',
            'max:64',
        ],

        'is_active' => [
            'sometimes',
            'boolean',
        ],
    ]);

    try {
        $entry = $this
            ->tenantIpAccessService
            ->updateEntry(
                $tenantId,
                $entryId,
                $validated,
                $request->ip()
            );
    } catch (DomainException $exception) {
        return response()->json([
            'message' => $exception->getMessage(),
        ], 422);
    }

    return response()->json([
        'message' =>
            'IP allowlist entry updated successfully.',

        'data' => [
            'entry' => [
                'id' => $entry->id,
                'tenant_id' => $entry->tenant_id,
                'label' => $entry->label,
                'ip_or_cidr' => $entry->ip_or_cidr,
                'is_active' => $entry->is_active,
                'created_by' => $entry->created_by,
                'updated_at' => $entry->updated_at,
            ],
        ],
    ]);
}



public function destroyEntry(
    Request $request,
    string $tenantId,
    string $entryId
): JsonResponse {
    try {
        $this
            ->tenantIpAccessService
            ->deleteEntry(
                $tenantId,
                $entryId,
                $request->ip()
            );
    } catch (DomainException $exception) {
        return response()->json([
            'message' => $exception->getMessage(),
        ], 422);
    }

    return response()->json([
        'message' =>
            'IP allowlist entry deleted successfully.',
    ]);
}





}
