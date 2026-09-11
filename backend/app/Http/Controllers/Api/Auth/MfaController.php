<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\Security\MfaService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MfaController extends Controller
{
    public function __construct(
        private MfaService $mfaService
    ) {
    }

    public function status(
        Request $request
    ): JsonResponse {
        $status = $this
            ->mfaService
            ->getStatus(
                $request->user()
            );

        return response()->json([
            'message' => 'MFA status retrieved successfully.',

            'data' => [
                'mfa' => $status,
            ],
        ]);
    }

    public function setup(
        Request $request
    ): JsonResponse {
        try {
            $result = $this
                ->mfaService
                ->beginSetup(
                    $request->user()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'MFA setup started successfully.',

            'data' => [
                'secret' =>
                    $result['secret'],

                'otp_auth_uri' =>
                    $result['otp_auth_uri'],
            ],
        ]);
    }

    public function confirm(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'regex:/^\d{6}$/',
            ],
        ]);

        try {
            $result = $this
                ->mfaService
                ->confirmSetup(
                    $request->user(),
                    $validated['code']
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'MFA enabled successfully.',

            'data' => [
                'enabled' =>
                    $result['enabled'],

                /*
                |--------------------------------------------------------------------------
                | Recovery Codes
                |--------------------------------------------------------------------------
                |
                | These are returned only once.
                |
                */

                'recovery_codes' =>
                    $result['recovery_codes'],
            ],
        ]);
    }

    public function disable(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'regex:/^\d{6}$/',
            ],
        ]);

        try {
            $this
                ->mfaService
                ->disable(
                    $request->user(),
                    $validated['code']
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'MFA disabled successfully.',
        ]);
    }


    public function regenerateRecoveryCodes(
    Request $request
): JsonResponse {
    $validated = $request->validate([
        'code' => [
            'required',
            'string',
            'digits:6',
        ],
    ]);

    try {
        $result = $this
            ->mfaService
            ->regenerateRecoveryCodes(
                $request->user(),
                $validated['code']
            );
    } catch (DomainException $exception) {
        return response()->json([
            'message' =>
                $exception->getMessage(),
        ], 422);
    }

    return response()->json([
        'message' =>
            'Recovery codes regenerated successfully.',

        'data' => $result,
    ]);
}



    
}
