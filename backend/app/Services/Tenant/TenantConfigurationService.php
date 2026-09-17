<?php

namespace App\Services\Tenant;

use App\Models\AuditEvent;
use App\Models\Tenant;
use App\Models\User;
use App\Repositories\TenantConfigurationRepository;
use App\Services\Audit\AuditEventService;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class TenantConfigurationService
{
    use HandlesImageUploads;

    public function __construct(
        protected TenantConfigurationRepository $tenantConfigurationRepository,
        protected AuditEventService $auditEventService
    ) {
    }

    public function get(Tenant $tenant): Tenant
    {
        return $this
            ->tenantConfigurationRepository
            ->getConfiguration($tenant);
    }

    public function updateGeneral(
        Tenant $tenant,
        array $data,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Tenant {
        $before = $this->configurationSnapshot($tenant);

        return DB::transaction(function () use (
            $tenant,
            $data,
            $before,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $allowed = [
                'locale',
                'timezone',
            ];

            $payload = array_intersect_key(
                $data,
                array_flip($allowed)
            );

            if (!empty($payload)) {
                $this
                    ->tenantConfigurationRepository
                    ->updateTenant(
                        $tenant,
                        $payload
                    );
            }

            $updatedTenant = $this
                ->tenantConfigurationRepository
                ->getConfiguration(
                    $tenant->fresh()
                );

            $changes = $this->buildChanges(
                $before,
                $this->snapshotFromTenant($updatedTenant)
            );

            $this->recordConfigurationAudit(
                tenant: $updatedTenant,
                actor: $actor,
                description: 'Tenant general configuration was updated.',
                section: 'general',
                changes: $changes,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                requestMethod: $requestMethod,
                requestPath: $requestPath
            );

            return $updatedTenant;
        });
    }

    public function updateSettings(
        Tenant $tenant,
        array $data,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Tenant {
        $before = $this->configurationSnapshot($tenant);

        return DB::transaction(function () use (
            $tenant,
            $data,
            $before,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
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

            $this
                ->tenantConfigurationRepository
                ->updateSettings(
                    $tenant,
                    $payload
                );

            $updatedTenant = $this
                ->tenantConfigurationRepository
                ->getConfiguration(
                    $tenant->fresh()
                );

            $changes = $this->buildChanges(
                $before,
                $this->snapshotFromTenant($updatedTenant)
            );

            $this->recordConfigurationAudit(
                tenant: $updatedTenant,
                actor: $actor,
                description: 'Tenant settings were updated.',
                section: 'settings',
                changes: $changes,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                requestMethod: $requestMethod,
                requestPath: $requestPath
            );

            return $updatedTenant;
        });
    }

    public function updateBranding(
        Tenant $tenant,
        array $data,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Tenant {
        $before = $this->configurationSnapshot($tenant);

        return DB::transaction(function () use (
            $tenant,
            $data,
            $before,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
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

            $this
                ->tenantConfigurationRepository
                ->updateBranding(
                    $tenant,
                    $payload
                );

            $updatedTenant = $this
                ->tenantConfigurationRepository
                ->getConfiguration(
                    $tenant->fresh()
                );

            $changes = $this->buildChanges(
                $before,
                $this->snapshotFromTenant($updatedTenant)
            );

            $this->recordConfigurationAudit(
                tenant: $updatedTenant,
                actor: $actor,
                description: 'Tenant branding was updated.',
                section: 'branding',
                changes: $changes,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                requestMethod: $requestMethod,
                requestPath: $requestPath
            );

            return $updatedTenant;
        });
    }

   

    public function updateTerminology(
        Tenant $tenant,
        array $data,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Tenant {
        $before = $this->configurationSnapshot($tenant);

        return DB::transaction(function () use (
            $tenant,
            $data,
            $before,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
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

            $existing =
                $settings?->terminology ?? [];

            if (!is_array($existing)) {
                $existing = [];
            }

            $terminology = array_merge(
                $defaults,
                $existing,
                $payload
            );

            $this
                ->tenantConfigurationRepository
                ->updateSettings(
                    $tenant,
                    [
                        'terminology' =>
                            $terminology,
                    ]
                );

            $updatedTenant = $this
                ->tenantConfigurationRepository
                ->getConfiguration(
                    $tenant->fresh()
                );

            $changes = $this->buildChanges(
                $before,
                $this->snapshotFromTenant($updatedTenant)
            );

            $this->recordConfigurationAudit(
                tenant: $updatedTenant,
                actor: $actor,
                description: 'Organization terminology was updated.',
                section: 'terminology',
                changes: $changes,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                requestMethod: $requestMethod,
                requestPath: $requestPath
            );

            return $updatedTenant;
        });
    }

    public function updateOrganizationIdentity(
        Tenant $tenant,
        array $data,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Tenant {
        $before = $this->configurationSnapshot($tenant);

        return DB::transaction(function () use (
            $tenant,
            $data,
            $before,
            $actor,
            $ipAddress,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            if (array_key_exists('name', $data)) {
                $this
                    ->tenantConfigurationRepository
                    ->updateTenant(
                        $tenant,
                        [
                            'name' =>
                                $data['name'],
                        ]
                    );
            }

            if (array_key_exists('display_name', $data)) {
                $this
                    ->tenantConfigurationRepository
                    ->updateBranding(
                        $tenant,
                        [
                            'display_name' =>
                                $data['display_name'],
                        ]
                    );
            }

            $updatedTenant = $this
                ->tenantConfigurationRepository
                ->getConfiguration(
                    $tenant->fresh()
                );

            $changes = $this->buildChanges(
                $before,
                $this->snapshotFromTenant($updatedTenant)
            );

            $this->recordConfigurationAudit(
                tenant: $updatedTenant,
                actor: $actor,
                description: 'Organization identity was updated.',
                section: 'organization',
                changes: $changes,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                requestMethod: $requestMethod,
                requestPath: $requestPath
            );

            return $updatedTenant;
        });
    }

    public function uploadBrandingAssets(
        Tenant $tenant,
        ?UploadedFile $logo = null,
        ?UploadedFile $favicon = null,
        ?User $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): Tenant {
        $before = $this->configurationSnapshot($tenant);

        $branding = $tenant->branding;

        $oldLogoPath =
            $branding?->logo_path;

        $oldFaviconPath =
            $branding?->favicon_path;

        $newLogoPath = null;
        $newFaviconPath = null;

        try {
            if ($logo) {
                $newLogoPath = $this->uploadImage(
                    $logo,
                    "uploads/tenant-branding/{$tenant->id}/logos",
                    null,
                    'logo'
                );
            }

            if ($favicon) {
                $newFaviconPath = $this->uploadImage(
                    $favicon,
                    "uploads/tenant-branding/{$tenant->id}/favicons",
                    null,
                    'favicon'
                );
            }

            $payload = [];

            if ($newLogoPath) {
                $payload['logo_path'] =
                    $newLogoPath;
            }

            if ($newFaviconPath) {
                $payload['favicon_path'] =
                    $newFaviconPath;
            }

            $updatedTenant = DB::transaction(
                function () use (
                    $tenant,
                    $payload,
                    $before,
                    $actor,
                    $ipAddress,
                    $userAgent,
                    $requestMethod,
                    $requestPath,
                    $newLogoPath,
                    $newFaviconPath
                ) {
                    $this
                        ->tenantConfigurationRepository
                        ->updateBranding(
                            $tenant,
                            $payload
                        );

                    $updatedTenant = $this
                        ->tenantConfigurationRepository
                        ->getConfiguration(
                            $tenant->fresh()
                        );

                    $changes = $this->buildChanges(
                        $before,
                        $this->snapshotFromTenant(
                            $updatedTenant
                        )
                    );

                    $assets = [];

                    if ($newLogoPath) {
                        $assets[] = 'logo';
                    }

                    if ($newFaviconPath) {
                        $assets[] = 'favicon';
                    }

                    $this->recordConfigurationAudit(
                        tenant: $updatedTenant,
                        actor: $actor,
                        description: 'Tenant branding assets were updated.',
                        section: 'branding_assets',
                        changes: $changes,
                        metadata: [
                            'assets' => $assets,
                        ],
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );

                    return $updatedTenant;
                }
            );

            if (
                $newLogoPath &&
                $oldLogoPath
            ) {
                $this->deleteImage(
                    $oldLogoPath
                );
            }

            if (
                $newFaviconPath &&
                $oldFaviconPath
            ) {
                $this->deleteImage(
                    $oldFaviconPath
                );
            }

            return $updatedTenant;
        } catch (Throwable $exception) {
            if ($newLogoPath) {
                $this->deleteImage(
                    $newLogoPath
                );
            }

            if ($newFaviconPath) {
                $this->deleteImage(
                    $newFaviconPath
                );
            }

            throw $exception;
        }
    }

    private function configurationSnapshot(
        Tenant $tenant
    ): array {
        $configuredTenant = $this
            ->tenantConfigurationRepository
            ->getConfiguration($tenant);

        return $this->snapshotFromTenant(
            $configuredTenant
        );
    }

    private function snapshotFromTenant(
        Tenant $tenant
    ): array {
        return $this->normalizeAuditValue(
            $tenant->toArray()
        );
    }

    private function normalizeAuditValue(
        mixed $value
    ): mixed {
        if (!is_array($value)) {
            return $value;
        }

        $normalized = [];

        foreach ($value as $key => $item) {
            if (
                is_string($key) &&
                in_array(
                    $key,
                    [
                        'created_at',
                        'updated_at',
                    ],
                    true
                )
            ) {
                continue;
            }

            $normalized[$key] =
                $this->normalizeAuditValue(
                    $item
                );
        }

        return $normalized;
    }

    private function buildChanges(
        array $before,
        array $after,
        string $prefix = ''
    ): array {
        $changes = [];

        $keys = array_unique(
            array_merge(
                array_keys($before),
                array_keys($after)
            )
        );

        foreach ($keys as $key) {
            $beforeExists =
                array_key_exists(
                    $key,
                    $before
                );

            $afterExists =
                array_key_exists(
                    $key,
                    $after
                );

            $beforeValue =
                $beforeExists
                    ? $before[$key]
                    : null;

            $afterValue =
                $afterExists
                    ? $after[$key]
                    : null;

            $path = $prefix === ''
                ? (string) $key
                : $prefix . '.' . $key;

            if (
                $beforeExists &&
                $afterExists &&
                is_array($beforeValue) &&
                is_array($afterValue) &&
                !array_is_list($beforeValue) &&
                !array_is_list($afterValue)
            ) {
                $changes = array_merge(
                    $changes,
                    $this->buildChanges(
                        $beforeValue,
                        $afterValue,
                        $path
                    )
                );

                continue;
            }

            if (
                !$beforeExists ||
                !$afterExists ||
                $beforeValue !== $afterValue
            ) {
                $changes[$path] = [
                    'from' =>
                        $beforeValue,

                    'to' =>
                        $afterValue,
                ];
            }
        }

        return $changes;
    }

    private function recordConfigurationAudit(
        Tenant $tenant,
        ?User $actor,
        string $description,
        string $section,
        array $changes,
        ?array $metadata = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): void {
        if (
            !$actor ||
            empty($changes)
        ) {
            return;
        }

        $auditMetadata = array_merge(
            [
                'section' => $section,
            ],
            $metadata ?? []
        );

        $this
            ->auditEventService
            ->record(
                tenantId: (string) $tenant->id,
                actor: $actor,
                action: AuditEvent::ACTION_UPDATED,
                category: AuditEvent::CATEGORY_SYSTEM,
                targetType: 'tenant',
                targetId: (string) $tenant->id,
                targetLabel: $tenant->name,
                description: $description,
                changes: $changes,
                metadata: $auditMetadata,
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                requestMethod: $requestMethod,
                requestPath: $requestPath
            );
    }


 

    public function updateFeatureFlag(
    Tenant $tenant,
    string $key,
    array $data,
    ?User $actor = null,
    ?string $ipAddress = null,
    ?string $userAgent = null,
    ?string $requestMethod = null,
    ?string $requestPath = null
): Tenant {
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

    $beforeFlag = $this
        ->tenantConfigurationRepository
        ->findFeatureFlag(
            $tenant,
            $key
        );

    $beforeEnabled = $beforeFlag
        ? (bool) $beforeFlag->enabled
        : null;

    $beforeConfig = $beforeFlag
        ? ($beforeFlag->config ?? [])
        : [];

    return DB::transaction(function () use (
        $tenant,
        $key,
        $data,
        $beforeEnabled,
        $beforeConfig,
        $actor,
        $ipAddress,
        $userAgent,
        $requestMethod,
        $requestPath
    ) {
        $payload = [
            'enabled' => (bool) (
                $data['enabled'] ?? false
            ),
            'config' => $data['config'] ?? [],
        ];

        $this
            ->tenantConfigurationRepository
            ->updateFeatureFlag(
                $tenant,
                $key,
                $payload
            );

        $afterFlag = $this
            ->tenantConfigurationRepository
            ->findFeatureFlag(
                $tenant,
                $key
            );

        $afterEnabled = $afterFlag
            ? (bool) $afterFlag->enabled
            : null;

        $afterConfig = $afterFlag
            ? ($afterFlag->config ?? [])
            : [];

        $changes = [];

        if ($beforeEnabled !== $afterEnabled) {
            $changes["feature_flags.{$key}.enabled"] = [
                'from' => $beforeEnabled,
                'to' => $afterEnabled,
            ];
        }

        if ($beforeConfig !== $afterConfig) {
            $changes["feature_flags.{$key}.config"] = [
                'from' => $beforeConfig,
                'to' => $afterConfig,
            ];
        }

        $updatedTenant = $this
            ->tenantConfigurationRepository
            ->getConfiguration(
                $tenant->fresh()
            );

        $this->recordConfigurationAudit(
            tenant: $updatedTenant,
            actor: $actor,
            description: 'Tenant feature flag was updated.',
            section: 'feature_flag',
            changes: $changes,
            metadata: [
                'feature_flag' => $key,
            ],
            ipAddress: $ipAddress,
            userAgent: $userAgent,
            requestMethod: $requestMethod,
            requestPath: $requestPath
        );

        return $updatedTenant;
    });
}



}