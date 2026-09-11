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
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->isActive()) {
            return response()->json([
                'message' => 'Your account is not active.',
            ], 403);
        }

        $tenantId = $request->route($parameter);

        if (!$tenantId) {
            return response()->json([
                'message' => 'Tenant context is required.',
            ], 400);
        }

        $tenant = Tenant::query()
            ->whereKey($tenantId)
            ->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        if (!$tenant->isActive()) {
            return response()->json([
                'message' => 'Tenant is not active.',
            ], 403);
        }

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
        |
        | From this point onward, role and permission checks will use
        | the currently resolved tenant.
        |
        */

        app(PermissionRegistrar::class)
            ->setPermissionsTeamId($tenant->id);

        /*
        |--------------------------------------------------------------------------
        | Clear Cached User Permission Relations
        |--------------------------------------------------------------------------
        |
        | Important when the same authenticated user may access more than one
        | tenant during its lifetime.
        |
        */

        $user->unsetRelation('roles');
        $user->unsetRelation('permissions');

        return $next($request);
    }
}
