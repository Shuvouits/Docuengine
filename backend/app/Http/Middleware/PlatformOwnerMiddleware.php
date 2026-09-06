<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PlatformOwnerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
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

        if (!$user->isPlatformOwner()) {
            return response()->json([
                'message' => 'Platform owner access required.',
            ], 403);
        }

        return $next($request);
    }
}
