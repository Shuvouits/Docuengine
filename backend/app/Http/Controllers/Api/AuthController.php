<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantUser;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;

use App\Services\Auth\AuthLoginService;
use DomainException;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    public function login(
        Request $request,
        AuthLoginService $authLoginService
    ): JsonResponse {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'password' => [
                'required',
                'string',
            ],
        ]);

        try {
            $result = $authLoginService->login(
                $validated['email'],
                $validated['password'],
                $request->ip(),
                $request->userAgent()
            );
        } catch (DomainException $exception) {
            $status = $exception->getMessage()
                === 'Invalid email or password.'
                ? 401
                : 403;

            return response()->json([
                'message' => $exception->getMessage(),
            ], $status);
        }

        /*
    |--------------------------------------------------------------------------
    | MFA Required
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | No JWT is issued at this stage.
    |
    */

        if ($result['mfa_required']) {
            return response()->json([
                'message' => 'MFA verification required.',

                'mfa_required' => true,

                'challenge_token' =>
                $result['challenge']['challenge_token'],

                'expires_at' =>
                $result['challenge']['expires_at'],

                'expires_in' =>
                $result['challenge']['expires_in'],

                'methods' =>
                $result['challenge']['methods'],
            ]);
        }

        /*
    |--------------------------------------------------------------------------
    | Normal JWT Login
    |--------------------------------------------------------------------------
    */

        $user = $result['user'];

        return response()->json([
            'message' => 'Login successful.',

            'mfa_required' => false,

            /*
        |--------------------------------------------------------------------------
        | Keep Existing Frontend Contract
        |--------------------------------------------------------------------------
        */

            'token' => $result['token'],

            'token_type' => 'bearer',

            'expires_in' => auth('api')
                ->factory()
                ->getTTL() * 60,

            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,

                'is_platform_owner' =>
                $user->is_platform_owner,
            ],
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

        $tenantMemberships = TenantUser::query()
            ->with([
                'tenant.branding',
                'tenant.settings',
            ])
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->get();

        $tenants = $tenantMemberships
            ->filter(
                fn($membership) =>
                $membership->tenant !== null
            )
            ->map(function ($membership) use ($user) {
                $tenant = $membership->tenant;

                /*
            |--------------------------------------------------------------------------
            | Set Spatie Tenant Context
            |--------------------------------------------------------------------------
            */

                app(PermissionRegistrar::class)
                    ->setPermissionsTeamId(
                        $tenant->id
                    );

                /*
            |--------------------------------------------------------------------------
            | Clear Cached Permission Relations
            |--------------------------------------------------------------------------
            */

                $user->unsetRelation('roles');
                $user->unsetRelation('permissions');

                /*
            |--------------------------------------------------------------------------
            | Tenant Scoped Roles & Permissions
            |--------------------------------------------------------------------------
            */

                $roles = $user
                    ->getRoleNames()
                    ->values()
                    ->all();

                $permissions = $user
                    ->getAllPermissions()
                    ->pluck('name')
                    ->values()
                    ->all();

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

                    /*
                |--------------------------------------------------------------------------
                | Module 2 Access Context
                |--------------------------------------------------------------------------
                */

                    'access' => [
                        'roles' => $roles,
                        'permissions' => $permissions,
                    ],

                    'branding' => $tenant->branding
                        ? [
                            'display_name' =>
                            $tenant->branding->display_name,

                            'logo_path' =>
                            $tenant->branding->logo_path,

                            'favicon_path' =>
                            $tenant->branding->favicon_path,

                            'logo_url' =>
                            $tenant->branding->logo_url,

                            'favicon_url' =>
                            $tenant->branding->favicon_url,

                            'primary_color' =>
                            $tenant->branding->primary_color,

                            'secondary_color' =>
                            $tenant->branding->secondary_color,
                        ]
                        : null,

                    'settings' => $tenant->settings
                        ? [
                            'date_format' =>
                            $tenant->settings->date_format,

                            'time_format' =>
                            $tenant->settings->time_format,

                            'week_start' =>
                            $tenant->settings->week_start,
                        ]
                        : null,
                ];
            })
            ->values();

        /*
    |--------------------------------------------------------------------------
    | Current Tenant
    |--------------------------------------------------------------------------
    */

        $currentTenant = null;

        if (
            !$user->is_platform_owner &&
            $tenants->count() === 1
        ) {
            $currentTenant = $tenants->first();
        }

        /*
    |--------------------------------------------------------------------------
    | Clear Relations Again
    |--------------------------------------------------------------------------
    */

        $user->unsetRelation('roles');
        $user->unsetRelation('permissions');

        return response()->json([
            'message' =>
            'Authenticated user retrieved successfully.',

            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,

                    'is_platform_owner' =>
                    (bool) $user->is_platform_owner,
                ],

                'current_tenant' =>
                $currentTenant,

                'tenants' =>
                $tenants,
            ],
        ]);
    }

    
}
