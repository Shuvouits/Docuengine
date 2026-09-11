<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\AuthLoginService;
use App\Services\Auth\MfaLoginChallengeService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MfaLoginChallengeController extends Controller
{
    public function __construct(
        private MfaLoginChallengeService $mfaChallengeService,
        private AuthLoginService $authLoginService
    ) {
    }

    public function verify(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'challenge_token' => [
                'required',
                'string',
            ],

            'method' => [
                'required',
                'string',
                Rule::in([
                    'totp',
                    'recovery_code',
                ]),
            ],

            'code' => [
                'required',
                'string',
                'max:100',
            ],
        ]);

        try {
            /*
            |--------------------------------------------------------------------------
            | Verify Selected MFA Method
            |--------------------------------------------------------------------------
            */

            if ($validated['method'] === 'totp') {
                $user = $this
                    ->mfaChallengeService
                    ->verifyTotp(
                        $validated['challenge_token'],
                        $validated['code']
                    );
            } else {
                $user = $this
                    ->mfaChallengeService
                    ->verifyRecoveryCode(
                        $validated['challenge_token'],
                        $validated['code']
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | MFA Passed, Issue JWT + Register Session
            |--------------------------------------------------------------------------
            */

            $token = $this
                ->authLoginService
                ->issueJwtAfterMfa(
                    $user,
                    $request->ip(),
                    $request->userAgent()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'MFA verification successful.',

            'mfa_required' => false,

            'token' => $token,

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
}
