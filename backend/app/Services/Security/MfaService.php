<?php

namespace App\Services\Security;

use App\Models\User;
use App\Models\UserMfaSetting;
use App\Repositories\UserMfaRepository;
use DomainException;
use Illuminate\Support\Facades\DB;

class MfaService
{
    public function __construct(
        private UserMfaRepository $userMfaRepository
    ) {}

    public function getStatus(
        User $user
    ): array {
        $setting = $this
            ->userMfaRepository
            ->findByUserId($user->id);

        return [
            'enabled' =>
            $setting?->isEnabled() ?? false,

            'confirmed_at' =>
            $setting?->confirmed_at,

            'last_used_at' =>
            $setting?->last_used_at,
        ];
    }

    public function beginSetup(
        User $user
    ): array {
        $existing = $this
            ->userMfaRepository
            ->findByUserId($user->id);

        if (
            $existing &&
            $existing->isEnabled()
        ) {
            throw new DomainException(
                'MFA is already enabled for this account.'
            );
        }

        $google2fa = app(
            'pragmarx.google2fa'
        );

        /*
        |--------------------------------------------------------------------------
        | Generate TOTP Secret
        |--------------------------------------------------------------------------
        */

        $secret = $google2fa
            ->generateSecretKey();

        /*
        |--------------------------------------------------------------------------
        | Generate Authenticator Provisioning URI
        |--------------------------------------------------------------------------
        */

        $issuer = config(
            'app.name',
            'DocuEngine'
        );

        $otpAuthUri = $google2fa
            ->getQRCodeUrl(
                $issuer,
                $user->email,
                $secret
            );

        /*
        |--------------------------------------------------------------------------
        | Store Encrypted Secret
        |--------------------------------------------------------------------------
        |
        | UserMfaSetting model uses Laravel encrypted cast.
        |
        */

        $this
            ->userMfaRepository
            ->createOrUpdateSetup(
                $user,
                [
                    'enabled' => false,

                    'secret_encrypted' =>
                    $secret,

                    'recovery_codes_encrypted' =>
                    null,

                    'confirmed_at' =>
                    null,

                    'last_used_at' =>
                    null,
                ]
            );

        return [
            'secret' => $secret,
            'otp_auth_uri' => $otpAuthUri,
        ];
    }

    public function confirmSetup(
        User $user,
        string $code
    ): array {
        $setting = $this
            ->userMfaRepository
            ->findByUserId($user->id);

        if (
            !$setting ||
            empty($setting->secret_encrypted)
        ) {
            throw new DomainException(
                'MFA setup has not been started.'
            );
        }

        if ($setting->isEnabled()) {
            throw new DomainException(
                'MFA is already enabled for this account.'
            );
        }

        if (
            !$this->verifySecretCode(
                $setting->secret_encrypted,
                $code
            )
        ) {
            throw new DomainException(
                'The MFA verification code is invalid.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Recovery Codes
        |--------------------------------------------------------------------------
        |
        | Plain recovery codes are returned once.
        | Only SHA-256 hashes are stored inside the encrypted DB field.
        |
        */

        $recovery = $this
            ->generateRecoveryCodes();

        DB::transaction(function () use (
            $setting,
            $recovery
        ) {
            $this
                ->userMfaRepository
                ->update(
                    $setting,
                    [
                        'enabled' => true,

                        'confirmed_at' =>
                        now(),

                        'last_used_at' =>
                        now(),

                        'recovery_codes_encrypted' =>
                        $recovery['hashes'],
                    ]
                );
        });

        return [
            'enabled' => true,

            'recovery_codes' =>
            $recovery['plain'],
        ];
    }

    public function verifyTotp(
        User $user,
        string $code
    ): bool {
        $setting = $this
            ->requireEnabledSetting(
                $user
            );

        $valid = $this
            ->verifySecretCode(
                $setting->secret_encrypted,
                $code
            );

        if (!$valid) {
            return false;
        }

        $this
            ->userMfaRepository
            ->update(
                $setting,
                [
                    'last_used_at' =>
                    now(),
                ]
            );

        return true;
    }

    public function verifyRecoveryCode(
        User $user,
        string $code
    ): bool {
        $setting = $this
            ->requireEnabledSetting(
                $user
            );

        $code = strtoupper(
            trim($code)
        );

        $codeHash = hash(
            'sha256',
            $code
        );

        $storedHashes =
            $setting
            ->recovery_codes_encrypted
            ?? [];

        $matchedIndex = null;

        foreach (
            $storedHashes as $index => $storedHash
        ) {
            if (
                hash_equals(
                    $storedHash,
                    $codeHash
                )
            ) {
                $matchedIndex = $index;

                break;
            }
        }

        if ($matchedIndex === null) {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | Recovery Code Is One-Time Use
        |--------------------------------------------------------------------------
        */

        unset(
            $storedHashes[$matchedIndex]
        );

        $storedHashes =
            array_values(
                $storedHashes
            );

        $this
            ->userMfaRepository
            ->update(
                $setting,
                [
                    'recovery_codes_encrypted' =>
                    $storedHashes,

                    'last_used_at' =>
                    now(),
                ]
            );

        return true;
    }

    public function disable(
        User $user,
        string $code
    ): void {
        $setting = $this
            ->requireEnabledSetting(
                $user
            );

        $valid = $this
            ->verifySecretCode(
                $setting->secret_encrypted,
                $code
            );

        if (!$valid) {
            throw new DomainException(
                'The MFA verification code is invalid.'
            );
        }

        DB::transaction(function () use (
            $setting
        ) {
            $this
                ->userMfaRepository
                ->update(
                    $setting,
                    [
                        'enabled' => false,

                        'secret_encrypted' =>
                        null,

                        'recovery_codes_encrypted' =>
                        null,

                        'confirmed_at' =>
                        null,

                        'last_used_at' =>
                        null,
                    ]
                );
        });
    }

    private function requireEnabledSetting(
        User $user
    ): UserMfaSetting {
        $setting = $this
            ->userMfaRepository
            ->findByUserId($user->id);

        if (
            !$setting ||
            !$setting->isEnabled()
        ) {
            throw new DomainException(
                'MFA is not enabled for this account.'
            );
        }

        return $setting;
    }

    private function verifySecretCode(
        string $secret,
        string $code
    ): bool {
        $code = preg_replace(
            '/\s+/',
            '',
            trim($code)
        );

        if (
            !preg_match(
                '/^\d{6}$/',
                $code
            )
        ) {
            return false;
        }

        $google2fa = app(
            'pragmarx.google2fa'
        );

        /*
        |--------------------------------------------------------------------------
        | Window = 1
        |--------------------------------------------------------------------------
        |
        | Allows a small amount of clock drift around the current TOTP period.
        |
        */

        return $google2fa
            ->verifyKey(
                $secret,
                $code,
                1
            );
    }

    private function generateRecoveryCodes(): array
    {
        $plain = [];
        $hashes = [];

        for ($i = 0; $i < 8; $i++) {
            $raw = strtoupper(
                bin2hex(
                    random_bytes(8)
                )
            );

            $code =
                substr($raw, 0, 8)
                . '-'
                . substr($raw, 8, 8);

            $plain[] = $code;

            $hashes[] = hash(
                'sha256',
                $code
            );
        }

        return [
            'plain' => $plain,
            'hashes' => $hashes,
        ];
    }


   



    public function regenerateRecoveryCodes(
    User $user,
    string $code
): array {
    $setting = $this->requireEnabledSetting(
        $user
    );

    /*
    |--------------------------------------------------------------------------
    | Verify Current TOTP
    |--------------------------------------------------------------------------
    */

    if (
        !$this->verifySecretCode(
            $setting->secret_encrypted,
            $code
        )
    ) {
        throw new DomainException(
            'The MFA verification code is invalid.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Generate New Recovery Codes
    |--------------------------------------------------------------------------
    */

    $recovery = $this
        ->generateRecoveryCodes();

    /*
    |--------------------------------------------------------------------------
    | Replace Existing Recovery Codes
    |--------------------------------------------------------------------------
    */

    DB::transaction(function () use (
        $setting,
        $recovery
    ) {
        $this
            ->userMfaRepository
            ->update(
                $setting,
                [
                    'recovery_codes_encrypted' =>
                        $recovery['hashes'],

                    'last_used_at' =>
                        now(),
                ]
            );
    });

    /*
    |--------------------------------------------------------------------------
    | Plain Codes Are Returned Only Once
    |--------------------------------------------------------------------------
    */

    return [
        'recovery_codes' =>
            $recovery['plain'],
    ];
}




}
