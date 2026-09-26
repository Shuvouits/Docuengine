<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Services\Company\CompanyService;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    public function __construct(
        private CompanyService $companyService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Company List
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

            'status' => [
                'nullable',
                Rule::in(
                    Company::statuses()
                ),
            ],

            'include_archived' => [
                'nullable',
                'boolean',
            ],

            'sort_by' => [
                'nullable',
                Rule::in([
                    'name',
                    'status',
                    'city',
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

        $companies = $this
            ->companyService
            ->getAll(
                $tenantId,
                $validated,
                $request->user('api')
            );

        return response()->json([
            'message' =>
                'Companies retrieved successfully.',

            'data' => [
                'companies' => collect(
                    $companies->items()
                )
                    ->map(
                        fn (Company $company) =>
                            $this->formatCompany(
                                $company
                            )
                    )
                    ->values(),

                'pagination' => [
                    'current_page' =>
                        $companies->currentPage(),

                    'last_page' =>
                        $companies->lastPage(),

                    'per_page' =>
                        $companies->perPage(),

                    'total' =>
                        $companies->total(),

                    'from' =>
                        $companies->firstItem(),

                    'to' =>
                        $companies->lastItem(),
                ],
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Company Details
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        string $tenantId,
        string $companyId
    ): JsonResponse {
        try {
            $company = $this
                ->companyService
                ->getById(
                    $tenantId,
                    $companyId,
                    $request->user('api')
                );
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 403);
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 404);
        }

        return response()->json([
            'message' =>
                'Company retrieved successfully.',

            'data' => [
                'company' =>
                    $this->formatCompany(
                        $company
                    ),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Company
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'legal_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
            ],

            'website' => [
                'nullable',
                'url',
                'max:255',
            ],

            'primary_contact_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'primary_contact_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'primary_contact_phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'address_line1' => [
                'nullable',
                'string',
                'max:255',
            ],

            'address_line2' => [
                'nullable',
                'string',
                'max:255',
            ],

            'city' => [
                'nullable',
                'string',
                'max:150',
            ],

            'state_region' => [
                'nullable',
                'string',
                'max:150',
            ],

            'postal_code' => [
                'nullable',
                'string',
                'max:50',
            ],

            'country' => [
                'nullable',
                'string',
                'max:150',
            ],

            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:20000',
            ],

            'status' => [
                'nullable',
                Rule::in([
                    Company::STATUS_ACTIVE,
                    Company::STATUS_INACTIVE,
                ]),
            ],
        ]);

        try {
            $company = $this
                ->companyService
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
                'Company created successfully.',

            'data' => [
                'company' =>
                    $this->formatCompany(
                        $company
                    ),
            ],
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Company
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        string $tenantId,
        string $companyId
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'legal_name' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'website' => [
                'sometimes',
                'nullable',
                'url',
                'max:255',
            ],

            'primary_contact_name' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'primary_contact_email' => [
                'sometimes',
                'nullable',
                'email',
                'max:255',
            ],

            'primary_contact_phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
            ],

            'address_line1' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'address_line2' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'city' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'state_region' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'postal_code' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
            ],

            'country' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
                'max:5000',
            ],

            'notes' => [
                'sometimes',
                'nullable',
                'string',
                'max:20000',
            ],

            'status' => [
                'sometimes',
                Rule::in([
                    Company::STATUS_ACTIVE,
                    Company::STATUS_INACTIVE,
                ]),
            ],
        ]);

        try {
            $company = $this
                ->companyService
                ->update(
                    tenantId: $tenantId,
                    companyId: $companyId,
                    data: $validated,
                    actor: $request->user('api'),
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 403);
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Company updated successfully.',

            'data' => [
                'company' =>
                    $this->formatCompany(
                        $company
                    ),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Company
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        string $tenantId,
        string $companyId
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
                ->companyService
                ->archive(
                    tenantId: $tenantId,
                    companyId: $companyId,
                    actor: $request->user('api'),
                    reason:
                        $validated['reason']
                        ?? null,
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 403);
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Company archived successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Company
    |--------------------------------------------------------------------------
    */

    public function restore(
        Request $request,
        string $tenantId,
        string $companyId
    ): JsonResponse {
        try {
            $company = $this
                ->companyService
                ->restore(
                    tenantId: $tenantId,
                    companyId: $companyId,
                    actor: $request->user('api'),
                    ipAddress: $request->ip(),
                    userAgent: $request->userAgent(),
                    requestMethod: $request->method(),
                    requestPath: $request->path()
                );
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 403);
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Company restored successfully.',

            'data' => [
                'company' =>
                    $this->formatCompany(
                        $company
                    ),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Status Summary
    |--------------------------------------------------------------------------
    */

    public function summary(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $counters = $this
            ->companyService
            ->getStatusCounters(
                $tenantId,
                $request->user('api')
            );

        return response()->json([
            'message' =>
                'Company summary retrieved successfully.',

            'data' => [
                'summary' =>
                    $counters,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Company Switcher
    |--------------------------------------------------------------------------
    */

    public function options(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $companies = $this
            ->companyService
            ->getAvailableCompanies(
                $tenantId,
                $request->user('api')
            );

        return response()->json([
            'message' =>
                'Company options retrieved successfully.',

            'data' => [
                'companies' =>
                    $companies,

                'count' =>
                    $companies->count(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Formatter
    |--------------------------------------------------------------------------
    */

    private function formatCompany(
        Company $company
    ): array {
        return [
            'id' =>
                $company->id,

            'tenant_id' =>
                $company->tenant_id,

            'name' =>
                $company->name,

            'legal_name' =>
                $company->legal_name,

            'slug' =>
                $company->slug,

            'website' =>
                $company->website,

            'status' =>
                $company->status,

            'contact' => [
                'name' =>
                    $company->primary_contact_name,

                'email' =>
                    $company->primary_contact_email,

                'phone' =>
                    $company->primary_contact_phone,
            ],

            'address' => [
                'line1' =>
                    $company->address_line1,

                'line2' =>
                    $company->address_line2,

                'city' =>
                    $company->city,

                'state_region' =>
                    $company->state_region,

                'postal_code' =>
                    $company->postal_code,

                'country' =>
                    $company->country,
            ],

            'description' =>
                $company->description,

            'notes' =>
                $company->notes,

            'created_by' =>
                $company->created_by,

            'updated_by' =>
                $company->updated_by,

            'archived_by' =>
                $company->archived_by,

            'archived_at' =>
                $company->archived_at,

            'created_at' =>
                $company->created_at,

            'updated_at' =>
                $company->updated_at,

            'deleted_at' =>
                $company->deleted_at,
        ];
    }
}
