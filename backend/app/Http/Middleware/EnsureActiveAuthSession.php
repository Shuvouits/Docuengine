<?php

namespace App\Http\Middleware;

use App\Services\Auth\AuthSessionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;
use Tymon\JWTAuth\Facades\JWTAuth;

class EnsureActiveAuthSession
{
    public function __construct(
        private AuthSessionService $authSessionService
    ) {
    }

    public function handle(
        Request $request,
        Closure $next
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
        | Read JWT Payload
        |--------------------------------------------------------------------------
        */

        try {
            $payload = JWTAuth::parseToken()
                ->getPayload();

            $jti = (string) $payload->get('jti');
        } catch (Throwable $exception) {
            return response()->json([
                'message' =>
                    'The authentication session is invalid.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate JTI
        |--------------------------------------------------------------------------
        */

        if (!$jti) {
            return response()->json([
                'message' =>
                    'The authentication session is invalid.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Find Active Session
        |--------------------------------------------------------------------------
        */

        $session = $this
            ->authSessionService
            ->findActiveByJti($jti);

        if (
            !$session ||
            $session->user_id !== $user->id
        ) {
            return response()->json([
                'message' =>
                    'The authentication session is no longer active.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Idle Timeout
        |--------------------------------------------------------------------------
        */

        $idleTimeoutMinutes = (int) config(
            'auth_sessions.idle_timeout_minutes',
            30
        );

        if (
            $idleTimeoutMinutes > 0 &&
            $session->last_activity_at
        ) {
            $idleExpiresAt = $session
                ->last_activity_at
                ->copy()
                ->addMinutes(
                    $idleTimeoutMinutes
                );

            if ($idleExpiresAt->lte(now())) {
                $this
                    ->authSessionService
                    ->revokeSession(
                        $user,
                        $session->id,
                        'idle_timeout',
                        $request->ip(),
                        $request->userAgent()
                    );

                return response()->json([
                    'message' =>
                        'The authentication session expired due to inactivity.',
                ], 401);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Update Session Activity
        |--------------------------------------------------------------------------
        */

        $session = $this
            ->authSessionService
            ->recordActivity(
                $session
            );

        /*
        |--------------------------------------------------------------------------
        | Share Current Session
        |--------------------------------------------------------------------------
        */

        $request->attributes->set(
            'auth_session',
            $session
        );

        return $next($request);
    }
}