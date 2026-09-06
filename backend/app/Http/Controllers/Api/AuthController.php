<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantUser;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
            ],
            'password' => [
                'required',
                'string',
            ],
        ]);

        $token = $this->authService->login(
            $validated['email'],
            $validated['password']
        );

        if (!$token) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Authenticated User
    |--------------------------------------------------------------------------
    */

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Tenant Memberships
        |--------------------------------------------------------------------------
        */

        $tenantMemberships = TenantUser::query()
            ->with([
                'tenant.branding',
                'tenant.settings',
            ])
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Tenant Data
        |--------------------------------------------------------------------------
        */

        $tenants = $tenantMemberships
            ->filter(fn ($membership) => $membership->tenant !== null)
            ->map(function ($membership) {
                $tenant = $membership->tenant;

                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'status' => $tenant->status,
                    'locale' => $tenant->locale,
                    'timezone' => $tenant->timezone,

                    'membership' => [
                        'role' => $membership->role,
                        'status' => $membership->status,
                        'joined_at' => $membership->joined_at,
                    ],

                    'branding' => $tenant->branding
                        ? [
                            'display_name' => $tenant->branding->display_name,
                            'logo_path' => $tenant->branding->logo_path,
                            'favicon_path' => $tenant->branding->favicon_path,
                            'logo_url' => $tenant->branding->logo_url,
                            'favicon_url' => $tenant->branding->favicon_url,
                            'primary_color' => $tenant->branding->primary_color,
                            'secondary_color' => $tenant->branding->secondary_color,
                        ]
                        : null,

                    'settings' => $tenant->settings
                        ? [
                            'date_format' => $tenant->settings->date_format,
                            'time_format' => $tenant->settings->time_format,
                            'week_start' => $tenant->settings->week_start,
                        ]
                        : null,
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Current Tenant
        |--------------------------------------------------------------------------
        |
        | For now:
        | - Tenant Admin with one MSP => that MSP becomes current tenant
        | - Platform Owner => no current tenant until one is selected
        |
        */

        $currentTenant = null;

        if (!$user->is_platform_owner && $tenants->count() === 1) {
            $currentTenant = $tenants->first();
        }

        return response()->json([
            'message' => 'Authenticated user retrieved successfully.',

            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'is_platform_owner' => (bool) $user->is_platform_owner,
                ],

                'current_tenant' => $currentTenant,

                'tenants' => $tenants,
            ],
        ]);
    }
}
