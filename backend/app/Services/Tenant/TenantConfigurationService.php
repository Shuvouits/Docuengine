<?php

namespace App\Services\Tenant;

use App\Models\Tenant;
use App\Repositories\TenantConfigurationRepository;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class TenantConfigurationService
{
    use HandlesImageUploads;

    public function __construct(
        protected TenantConfigurationRepository $tenantConfigurationRepository
    ) {
    }

    public function get(Tenant $tenant): Tenant
    {
        return $this->tenantConfigurationRepository
            ->getConfiguration($tenant);
    }

    public function updateGeneral(
        Tenant $tenant,
        array $data
    ): Tenant {
        return DB::transaction(function () use ($tenant, $data) {
            $allowed = [
                'locale',
                'timezone',
            ];

            $payload = array_intersect_key(
                $data,
                array_flip($allowed)
            );

            if (!empty($payload)) {
                $this->tenantConfigurationRepository
                    ->updateTenant(
                        $tenant,
                        $payload
                    );
            }

            return $this->tenantConfigurationRepository
                ->getConfiguration(
                    $tenant->fresh()
                );
        });
    }

    public function updateSettings(
        Tenant $tenant,
        array $data
    ): Tenant {
        return DB::transaction(function () use ($tenant, $data) {
            $allowed = [
                'date_format',
                'time_format',
                'week_start',
                'name_prefix',
                'name_suffix',
                'preferences',
            ];

            $payload = array_intersect_key(
                $data,
                array_flip($allowed)
            );

            $this->tenantConfigurationRepository
                ->updateSettings(
                    $tenant,
                    $payload
                );

            return $this->tenantConfigurationRepository
                ->getConfiguration(
                    $tenant->fresh()
                );
        });
    }


    public function updateBranding(
    Tenant $tenant,
    array $data
): Tenant {
    return DB::transaction(function () use ($tenant, $data) {
        $allowed = [
            'display_name',
            'primary_color',
            'secondary_color',
            'custom_styles',
        ];

        $payload = array_intersect_key(
            $data,
            array_flip($allowed)
        );

        $this->tenantConfigurationRepository
            ->updateBranding(
                $tenant,
                $payload
            );

        return $this->tenantConfigurationRepository
            ->getConfiguration(
                $tenant->fresh()
            );
    });
}

    public function updateFeatureFlag(
        Tenant $tenant,
        string $key,
        array $data
    ): Tenant {
        return DB::transaction(function () use (
            $tenant,
            $key,
            $data
        ) {
            $availableFlags = array_keys(
                config('docuengine.feature_flags', [])
            );

            if (!in_array($key, $availableFlags, true)) {
                throw ValidationException::withMessages([
                    'feature_flag' => [
                        'Invalid feature flag.',
                    ],
                ]);
            }

            $payload = [
                'enabled' => (bool) (
                    $data['enabled']
                    ?? false
                ),
                'config' => $data['config'] ?? [],
            ];

            $this->tenantConfigurationRepository
                ->updateFeatureFlag(
                    $tenant,
                    $key,
                    $payload
                );

            return $this->tenantConfigurationRepository
                ->getConfiguration(
                    $tenant->fresh()
                );
        });
    }

    public function updateTerminology(
        Tenant $tenant,
        array $data
    ): Tenant {
        return DB::transaction(function () use ($tenant, $data) {
            $defaults = config(
                'docuengine.terminology_defaults',
                []
            );

            $allowedKeys = array_keys($defaults);

            $payload = array_intersect_key(
                $data,
                array_flip($allowedKeys)
            );

            $settings = $tenant->settings;

            $existing = $settings?->terminology ?? [];

            if (!is_array($existing)) {
                $existing = [];
            }

            $terminology = array_merge(
                $defaults,
                $existing,
                $payload
            );

            $this->tenantConfigurationRepository
                ->updateSettings(
                    $tenant,
                    [
                        'terminology' => $terminology,
                    ]
                );

            return $this->tenantConfigurationRepository
                ->getConfiguration(
                    $tenant->fresh()
                );
        });
    }

    public function updateOrganizationIdentity(
        Tenant $tenant,
        array $data
    ): Tenant {
        return DB::transaction(function () use ($tenant, $data) {
            if (array_key_exists('name', $data)) {
                $this->tenantConfigurationRepository
                    ->updateTenant(
                        $tenant,
                        [
                            'name' => $data['name'],
                        ]
                    );
            }

            if (array_key_exists('display_name', $data)) {
                $this->tenantConfigurationRepository
                    ->updateBranding(
                        $tenant,
                        [
                            'display_name' => $data['display_name'],
                        ]
                    );
            }

            return $this->tenantConfigurationRepository
                ->getConfiguration(
                    $tenant->fresh()
                );
        });
    }



    public function uploadBrandingAssets(
    Tenant $tenant,
    ?UploadedFile $logo = null,
    ?UploadedFile $favicon = null
): Tenant {
    $branding = $tenant->branding;

    $oldLogoPath = $branding?->logo_path;
    $oldFaviconPath = $branding?->favicon_path;

    $newLogoPath = null;
    $newFaviconPath = null;

    try {
        /*
        |--------------------------------------------------------------------------
        | Upload Logo
        |--------------------------------------------------------------------------
        */
        if ($logo) {
            $newLogoPath = $this->uploadImage(
                $logo,
                "uploads/tenant-branding/{$tenant->id}/logos",
                null,
                'logo'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Upload Favicon
        |--------------------------------------------------------------------------
        */
        if ($favicon) {
            $newFaviconPath = $this->uploadImage(
                $favicon,
                "uploads/tenant-branding/{$tenant->id}/favicons",
                null,
                'favicon'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Prepare Database Payload
        |--------------------------------------------------------------------------
        */
        $payload = [];

        if ($newLogoPath) {
            $payload['logo_path'] = $newLogoPath;
        }

        if ($newFaviconPath) {
            $payload['favicon_path'] = $newFaviconPath;
        }

        /*
        |--------------------------------------------------------------------------
        | Update Branding
        |--------------------------------------------------------------------------
        */
        $this->tenantConfigurationRepository
            ->updateBranding(
                $tenant,
                $payload
            );

        /*
        |--------------------------------------------------------------------------
        | Delete Previous Images
        |--------------------------------------------------------------------------
        */
        if ($newLogoPath && $oldLogoPath) {
            $this->deleteImage($oldLogoPath);
        }

        if ($newFaviconPath && $oldFaviconPath) {
            $this->deleteImage($oldFaviconPath);
        }

        return $this->tenantConfigurationRepository
            ->getConfiguration(
                $tenant->fresh()
            );

    } catch (Throwable $exception) {

        /*
        |--------------------------------------------------------------------------
        | Remove New Files If Database Update Fails
        |--------------------------------------------------------------------------
        */
        if ($newLogoPath) {
            $this->deleteImage($newLogoPath);
        }

        if ($newFaviconPath) {
            $this->deleteImage($newFaviconPath);
        }

        throw $exception;
    }
}





}
