<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Tenant\TenantConfigurationService;
use App\Services\Tenant\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TenantConfigurationController extends Controller
{
    public function __construct(
        protected TenantService $tenantService,
        protected TenantConfigurationService $tenantConfigurationService
    ) {
    }

    public function show(
        string $tenantId
    ): JsonResponse {
        $tenant = $this
            ->tenantService
            ->getById($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $tenant = $this
            ->tenantConfigurationService
            ->get($tenant);

        return response()->json([
            'message' => 'Tenant configuration retrieved successfully.',
            'data' => $tenant,
        ]);
    }

    public function updateGeneral(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $tenant = $this
            ->tenantService
            ->getById($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'locale' => [
                'required_without:timezone',
                'string',
                Rule::in(
                    array_keys(
                        config(
                            'docuengine.supported_locales',
                            []
                        )
                    )
                ),
            ],

            'timezone' => [
                'required_without:locale',
                'string',
                'max:100',
                'timezone',
            ],
        ]);

        $tenant = $this
            ->tenantConfigurationService
            ->updateGeneral(
                tenant: $tenant,
                data: $validated,
                actor: $request->user('api'),
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                requestMethod: $request->method(),
                requestPath: $request->path()
            );

        return response()->json([
            'message' => 'Tenant general configuration updated successfully.',
            'data' => $tenant,
        ]);
    }

    public function updateSettings(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $tenant = $this
            ->tenantService
            ->getById($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'date_format' => [
                'sometimes',
                'string',
                Rule::in(
                    array_keys(
                        config(
                            'docuengine.date_formats',
                            []
                        )
                    )
                ),
            ],

            'time_format' => [
                'sometimes',
                'string',
                Rule::in(
                    array_keys(
                        config(
                            'docuengine.time_formats',
                            []
                        )
                    )
                ),
            ],

            'week_start' => [
                'sometimes',
                'string',
                Rule::in(
                    array_keys(
                        config(
                            'docuengine.week_start_options',
                            []
                        )
                    )
                ),
            ],

            'name_prefix' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'name_suffix' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'preferences' => [
                'sometimes',
                'nullable',
                'array',
            ],
        ]);

        $tenant = $this
            ->tenantConfigurationService
            ->updateSettings(
                tenant: $tenant,
                data: $validated,
                actor: $request->user('api'),
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                requestMethod: $request->method(),
                requestPath: $request->path()
            );

        return response()->json([
            'message' => 'Tenant settings updated successfully.',
            'data' => $tenant,
        ]);
    }

    public function updateBranding(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $tenant = $this
            ->tenantService
            ->getById($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'display_name' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'primary_color' => [
                'sometimes',
                'nullable',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'secondary_color' => [
                'sometimes',
                'nullable',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'custom_styles' => [
                'sometimes',
                'nullable',
                'array',
            ],
        ]);

        if (empty($validated)) {
            return response()->json([
                'message' => 'At least one branding field is required.',
            ], 422);
        }

        $tenant = $this
            ->tenantConfigurationService
            ->updateBranding(
                tenant: $tenant,
                data: $validated,
                actor: $request->user('api'),
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                requestMethod: $request->method(),
                requestPath: $request->path()
            );

        return response()->json([
            'message' => 'Tenant branding updated successfully.',
            'data' => $tenant,
        ]);
    }

    public function updateFeatureFlag(
        Request $request,
        string $tenantId,
        string $key
    ): JsonResponse {
        $tenant = $this
            ->tenantService
            ->getById($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'enabled' => [
                'required',
                'boolean',
            ],

            'config' => [
                'nullable',
                'array',
            ],
        ]);

        $tenant = $this
            ->tenantConfigurationService
            ->updateFeatureFlag(
                tenant: $tenant,
                key: $key,
                data: $validated,
                actor: $request->user('api'),
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                requestMethod: $request->method(),
                requestPath: $request->path()
            );

        return response()->json([
            'message' => 'Tenant feature flag updated successfully.',
            'data' => $tenant,
        ]);
    }

    public function updateTerminology(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $tenant = $this
            ->tenantService
            ->getById($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'client' => [
                'sometimes',
                'string',
                'min:1',
                'max:100',
            ],

            'company' => [
                'sometimes',
                'string',
                'min:1',
                'max:100',
            ],

            'asset' => [
                'sometimes',
                'string',
                'min:1',
                'max:100',
            ],

            'contact' => [
                'sometimes',
                'string',
                'min:1',
                'max:100',
            ],

            'document' => [
                'sometimes',
                'string',
                'min:1',
                'max:100',
            ],

            'knowledge_base' => [
                'sometimes',
                'string',
                'min:1',
                'max:100',
            ],
        ]);

        if (empty($validated)) {
            return response()->json([
                'message' => 'At least one terminology field is required.',
            ], 422);
        }

        $tenant = $this
            ->tenantConfigurationService
            ->updateTerminology(
                tenant: $tenant,
                data: $validated,
                actor: $request->user('api'),
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                requestMethod: $request->method(),
                requestPath: $request->path()
            );

        return response()->json([
            'message' => 'Organization terminology updated successfully.',
            'data' => $tenant,
        ]);
    }

    public function updateOrganization(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $tenant = $this
            ->tenantService
            ->getById($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'min:2',
                'max:255',
            ],

            'display_name' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        if (empty($validated)) {
            return response()->json([
                'message' => 'At least one organization field is required.',
            ], 422);
        }

        $tenant = $this
            ->tenantConfigurationService
            ->updateOrganizationIdentity(
                tenant: $tenant,
                data: $validated,
                actor: $request->user('api'),
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                requestMethod: $request->method(),
                requestPath: $request->path()
            );

        return response()->json([
            'message' => 'Organization identity updated successfully.',
            'data' => $tenant,
        ]);
    }

    public function uploadBrandingAssets(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $tenant = $this
            ->tenantService
            ->getById($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $request->validate([
            'logo' => [
                'sometimes',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'favicon' => [
                'sometimes',
                'file',
                'mimes:ico,png,jpg,jpeg,webp',
                'max:2048',
            ],
        ]);

        if (
            !$request->hasFile('logo') &&
            !$request->hasFile('favicon')
        ) {
            return response()->json([
                'message' => 'At least one branding file is required.',
            ], 422);
        }

        $tenant = $this
            ->tenantConfigurationService
            ->uploadBrandingAssets(
                tenant: $tenant,
                logo: $request->file('logo'),
                favicon: $request->file('favicon'),
                actor: $request->user('api'),
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                requestMethod: $request->method(),
                requestPath: $request->path()
            );

        return response()->json([
            'message' => 'Branding assets uploaded successfully.',
            'data' => $tenant,
        ]);
    }

    public function regionalOptions(
        string $tenantId
    ): JsonResponse {
        $tenant = $this
            ->tenantService
            ->getById($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        $settings = $tenant->settings;

        return response()->json([
            'message' => 'Regional setting options retrieved successfully.',

            'data' => [
                'current' => [
                    'locale' => $tenant->locale,
                    'timezone' => $tenant->timezone,
                    'date_format' => $settings?->date_format,
                    'time_format' => $settings?->time_format,
                    'week_start' => $settings?->week_start,
                ],

                'options' => [
                    'locales' => config(
                        'docuengine.supported_locales',
                        []
                    ),

                    'timezones' =>
                        \DateTimeZone::listIdentifiers(),

                    'date_formats' => config(
                        'docuengine.date_formats',
                        []
                    ),

                    'time_formats' => config(
                        'docuengine.time_formats',
                        []
                    ),

                    'week_start' => config(
                        'docuengine.week_start_options',
                        []
                    ),
                ],
            ],
        ]);
    }
}