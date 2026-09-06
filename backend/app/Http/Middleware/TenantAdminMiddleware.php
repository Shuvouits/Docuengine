<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantAdminMiddleware
{
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

        if ($user->isPlatformOwner()) {
            return $next($request);
        }

        if (!$user->isTenantAdmin($tenantId)) {
            return response()->json([
                'message' => 'Tenant administrator access required.',
            ], 403);
        }

        return $next($request);
    }
}
