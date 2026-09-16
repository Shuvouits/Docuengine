<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Services\Tenant\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenantMiddleware
{
    public function __construct(
        protected TenantContext $tenantContext
    ) {
    }

    public function handle(
        Request $request,
        Closure $next,
        string $parameter = 'tenantId'
    ): Response {
        /*
        |--------------------------------------------------------------------------
        | Authenticated API User
        |--------------------------------------------------------------------------
        */

        $user = $request->user('api');

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate User Status
        |--------------------------------------------------------------------------
        */

        if (!$user->isActive()) {
            return response()->json([
                'message' => 'Your account is not active.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Resolve Tenant ID From Route
        |--------------------------------------------------------------------------
        */

        $tenantId = $request->route($parameter);

        if (!$tenantId) {
            return response()->json([
                'message' => 'Tenant context is required.',
            ], 400);
        }

        /*
        |--------------------------------------------------------------------------
        | Find Tenant
        |--------------------------------------------------------------------------
        */

        $tenant = Tenant::query()
            ->whereKey($tenantId)
            ->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Tenant Status
        |--------------------------------------------------------------------------
        */

        if (!$tenant->isActive()) {
            return response()->json([
                'message' => 'Tenant is not active.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Tenant Membership
        |--------------------------------------------------------------------------
        */

        if (!$user->isPlatformOwner()) {
            $hasAccess = $user->tenantMemberships()
                ->where('tenant_id', $tenant->id)
                ->where('status', 'active')
                ->exists();

            if (!$hasAccess) {
                return response()->json([
                    'message' => 'You do not have access to this tenant.',
                ], 403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Set DocuEngine Tenant Context
        |--------------------------------------------------------------------------
        */

        $this->tenantContext->set($tenant);

        /*
        |--------------------------------------------------------------------------
        | Set Spatie Permission Tenant Context
        |--------------------------------------------------------------------------
        */

        app(PermissionRegistrar::class)
            ->setPermissionsTeamId($tenant->id);

        /*
        |--------------------------------------------------------------------------
        | Clear Cached User Permission Relations
        |--------------------------------------------------------------------------
        */

        $user->unsetRelation('roles');
        $user->unsetRelation('permissions');

        return $next($request);
    }
}
