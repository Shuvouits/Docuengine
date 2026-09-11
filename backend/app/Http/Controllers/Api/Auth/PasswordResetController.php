<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\PasswordResetService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PasswordResetController extends Controller
{
    public function __construct(
        private PasswordResetService $passwordResetService
    ) {
    }

    public function forgotPassword(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
            ],
        ]);

        $result = $this
            ->passwordResetService
            ->requestReset(
                $validated['email']
            );

        $response = [
            'message' =>
                'If an active account exists for this email, a password reset link has been issued.',
        ];

        /*
        |--------------------------------------------------------------------------
        | Local Development Only
        |--------------------------------------------------------------------------
        */

        if (
            app()->environment('local') &&
            $result['issued'] &&
            $result['token']
        ) {
            $response['data'] = [
                'reset_token' => $result['token'],
            ];
        }

        return response()->json(
            $response
        );
    }

    public function validateToken(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'token' => [
                'required',
                'string',
            ],
        ]);

        try {
            $reset = $this
                ->passwordResetService
                ->validateToken(
                    $validated['token']
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Password reset token is valid.',
            'data' => [
                'email' => $reset->email,
                'expires_at' => $reset->expires_at,
            ],
        ]);
    }

    public function resetPassword(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'token' => [
                'required',
                'string',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        try {
            $this
                ->passwordResetService
                ->resetPassword(
                    $validated['token'],
                    $validated['password'],
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
                'Password reset successfully.',
        ]);
    }
}
