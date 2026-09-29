<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\KeeperLink;
use App\Services\Keeper\KeeperLinkService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KeeperLinkController extends Controller
{
    public function __construct(
        private readonly KeeperLinkService $keeperLinkService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | List Keeper Links
    |--------------------------------------------------------------------------
    */

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

            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        try {
            $keeperLinks = $this
                ->keeperLinkService
                ->getAll(
                    tenantId: $tenantId,
                    filters: $validated,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Keeper links retrieved successfully.',

            'data' => [
                'keeper_links' =>
                    collect(
                        $keeperLinks->items()
                    )
                        ->map(
                            fn (KeeperLink $keeperLink) =>
                                $this->formatKeeperLink(
                                    $keeperLink
                                )
                        )
                        ->values()
                        ->all(),

                'pagination' => [
                    'current_page' =>
                        $keeperLinks->currentPage(),

                    'last_page' =>
                        $keeperLinks->lastPage(),

                    'per_page' =>
                        $keeperLinks->perPage(),

                    'total' =>
                        $keeperLinks->total(),

                    'from' =>
                        $keeperLinks->firstItem(),

                    'to' =>
                        $keeperLinks->lastItem(),
                ],
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show Keeper Link
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        string $tenantId,
        string $keeperLinkId
    ): JsonResponse {
        try {
            $keeperLink = $this
                ->keeperLinkService
                ->getById(
                    tenantId: $tenantId,
                    keeperLinkId: $keeperLinkId,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Keeper link retrieved successfully.',

            'data' => [
                'keeper_link' =>
                    $this->formatKeeperLink(
                        $keeperLink,
                        true
                    ),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Keeper Link
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'company_id' => [
                'nullable',
                'uuid',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'username_hint' => [
                'nullable',
                'string',
                'max:255',
            ],

            'keeper_uid' => [
                'nullable',
                'string',
                'max:255',
            ],

            'record_url' => [
                'nullable',
                'url',
                'max:5000',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:10000',
            ],
        ]);

        try {
            $keeperLink = $this
                ->keeperLinkService
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
                'Keeper link created successfully.',

            'data' => [
                'keeper_link' =>
                    $this->formatKeeperLink(
                        $keeperLink,
                        true
                    ),
            ],
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Keeper Link
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        string $tenantId,
        string $keeperLinkId
    ): JsonResponse {
        $validated = $request->validate([
            'company_id' => [
                'sometimes',
                'nullable',
                'uuid',
            ],

            'company_id_clear' => [
                'sometimes',
                'boolean',
            ],

            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'username_hint' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'keeper_uid' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'record_url' => [
                'sometimes',
                'nullable',
                'url',
                'max:5000',
            ],

            'notes' => [
                'sometimes',
                'nullable',
                'string',
                'max:10000',
            ],
        ]);

        try {
            $keeperLink = $this
                ->keeperLinkService
                ->update(
                    tenantId: $tenantId,
                    keeperLinkId: $keeperLinkId,
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
                'Keeper link updated successfully.',

            'data' => [
                'keeper_link' =>
                    $this->formatKeeperLink(
                        $keeperLink,
                        true
                    ),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Keeper Link
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        string $tenantId,
        string $keeperLinkId
    ): JsonResponse {
        try {
            $this
                ->keeperLinkService
                ->delete(
                    tenantId: $tenantId,
                    keeperLinkId: $keeperLinkId,
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
                'Keeper link deleted successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Reveal Keeper URL
    |--------------------------------------------------------------------------
    */

    public function reveal(
        Request $request,
        string $tenantId,
        string $keeperLinkId
    ): JsonResponse {
        try {
            $recordUrl = $this
                ->keeperLinkService
                ->reveal(
                    tenantId: $tenantId,
                    keeperLinkId: $keeperLinkId,
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
                'Keeper link revealed successfully.',

            'data' => [
                'record_url' =>
                    $recordUrl,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Format Keeper Link
    |--------------------------------------------------------------------------
    */

    private function formatKeeperLink(
        KeeperLink $keeperLink,
        bool $includeDetails = false
    ): array {
        $data = [
            'id' =>
                $keeperLink->id,

            'tenant_id' =>
                $keeperLink->tenant_id,

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
                $keeperLink->relationLoaded(
                    'company'
                ) &&
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

            'created_by' =>
                $keeperLink->created_by,

            'updated_by' =>
                $keeperLink->updated_by,

            'creator' =>
                $keeperLink->relationLoaded(
                    'creator'
                ) &&
                $keeperLink->creator
                    ? [
                        'id' =>
                            $keeperLink
                                ->creator
                                ->id,

                        'name' =>
                            $keeperLink
                                ->creator
                                ->name,

                        'email' =>
                            $keeperLink
                                ->creator
                                ->email,
                    ]
                    : null,

            'updater' =>
                $keeperLink->relationLoaded(
                    'updater'
                ) &&
                $keeperLink->updater
                    ? [
                        'id' =>
                            $keeperLink
                                ->updater
                                ->id,

                        'name' =>
                            $keeperLink
                                ->updater
                                ->name,

                        'email' =>
                            $keeperLink
                                ->updater
                                ->email,
                    ]
                    : null,

            'created_at' =>
                $keeperLink
                    ->created_at
                    ?->toISOString(),

            'updated_at' =>
                $keeperLink
                    ->updated_at
                    ?->toISOString(),
        ];

        if ($includeDetails) {
            $data['keeper_uid'] =
                $keeperLink->keeper_uid;

            $data['notes'] =
                $keeperLink->notes;
        }

        /*
        |--------------------------------------------------------------------------
        | record_url is intentionally never returned here.
        | It is available only through the reveal endpoint.
        |--------------------------------------------------------------------------
        */

        return $data;
    }
}
