<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\AuthSessionService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthSessionController extends Controller
{
    public function __construct(
        private AuthSessionService $authSessionService
    ) {
    }

    public function index(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        $payload = JWTAuth::parseToken()
            ->getPayload();

        $jti = (string) $payload->get('jti');

        $currentSession = $this
            ->authSessionService
            ->findActiveByJti($jti);

        $sessions = $this
            ->authSessionService
            ->getActiveSessions($user)
            ->map(function ($session) use ($currentSession) {
                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'device_name' => $session->device_name,
                    'last_activity_at' => $session->last_activity_at,
                    'expires_at' => $session->expires_at,
                    'created_at' => $session->created_at,
                    'is_current' =>
                        $currentSession?->id === $session->id,
                ];
            })
            ->values();

        return response()->json([
            'message' =>
                'Authentication sessions retrieved successfully.',
            'data' => [
                'sessions' => $sessions,
            ],
        ]);
    }

    public function destroy(
        Request $request,
        string $sessionId
    ): JsonResponse {
        try {
            $session = $this
                ->authSessionService
                ->revokeSession(
                    $request->user(),
                    $sessionId,
                    'user_revoked',
                    $request->ip(),
                    $request->userAgent()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Authentication session revoked successfully.',
            'data' => [
                'session' => [
                    'id' => $session->id,
                    'revoked_at' => $session->revoked_at,
                    'revoke_reason' => $session->revoke_reason,
                ],
            ],
        ]);
    }



  public function logoutAll(
    Request $request
): JsonResponse {
    $count = $this
        ->authSessionService
        ->revokeAllSessions(
            $request->user(),
            'logout_all',
            $request->ip(),
            $request->userAgent()
        );

    return response()->json([
        'message' =>
            'All authentication sessions revoked successfully.',
        'data' => [
            'revoked_sessions' => $count,
        ],
    ]);
}



}
