<?php

namespace App\Http\Middleware;

use App\Services\Security\TenantIpAccessService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceTenantIpAllowlist
{
    public function __construct(
        private TenantIpAccessService $tenantIpAccessService
    ) {
    }

    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Platform Owner Bypass
        |--------------------------------------------------------------------------
        */

        if ($user->isPlatformOwner()) {
            return $next($request);
        }

        $tenantId = $request
            ->route('tenantId');

        if (!$tenantId) {
            return response()->json([
                'message' =>
                    'Tenant context is required for IP access control.',
            ], 400);
        }

        $ipAddress = $request->ip();

        $allowed = $this
            ->tenantIpAccessService
            ->isIpAllowed(
                $tenantId,
                $ipAddress
            );

        if (!$allowed) {
            return response()->json([
                'message' =>
                    'Access from this IP address is not allowed.',
            ], 403);
        }

        return $next($request);
    }
}