<?php

namespace App\Services\AssetLayout;

use App\Models\AuditEvent;
use App\Models\User;
use App\Repositories\AssetLayoutRepository;
use App\Repositories\AssetLayoutVersionRepository;
use App\Services\Audit\AuditEventService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AssetLayoutVersionService
{
    public function __construct(
        protected AssetLayoutBuilderService $builderService,
        protected AssetLayoutVersionRepository $versionRepository,
        protected AssetLayoutRepository $assetLayoutRepository,
        protected AuditEventService $auditEventService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Build Immutable Schema Snapshot
    |--------------------------------------------------------------------------
    */

    public function buildSchemaSnapshot(
        string $tenantId,
        string $layoutId
    ): ?array {
        $builder = $this->builderService->getBuilderData(
            $tenantId,
            $layoutId
        );

        if (!$builder) {
            return null;
        }

        return [
            'layout' => [
                'id' => $builder['id'],
                'name' => $builder['name'],
                'slug' => $builder['slug'],
                'description' => $builder['description'],
                'is_template' => $builder['is_template'],
            ],
            'sections' => $builder['sections'],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Version History
    |--------------------------------------------------------------------------
    */

    public function getVersionHistory(
        string $tenantId,
        string $layoutId
    ): array {
        $versions = $this->versionRepository->getAllByLayout(
            $tenantId,
            $layoutId
        );

        return [
            'versions' => $versions,
            'count' => $versions->count(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Get Version
    |--------------------------------------------------------------------------
    */

    public function getVersion(
        string $tenantId,
        string $layoutId,
        string $versionId
    ): array {
        $version = $this->versionRepository->findById(
            $tenantId,
            $layoutId,
            $versionId
        );

        if (!$version) {
            return [
                'success' => false,
                'message' => 'Asset layout version not found.',
                'version' => null,
            ];
        }

        return [
            'success' => true,
            'message' => 'Asset layout version retrieved successfully.',
            'version' => $version,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Create Version
    |--------------------------------------------------------------------------
    */

    public function createVersion(
        string $tenantId,
        string $layoutId,
        ?string $changeSummary,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): array {
        $snapshot = $this->buildSchemaSnapshot(
            $tenantId,
            $layoutId
        );

        if (!$snapshot) {
            return [
                'success' => false,
                'message' => 'Asset layout not found.',
                'version' => null,
            ];
        }

        return DB::transaction(
            function () use (
                $tenantId,
                $layoutId,
                $changeSummary,
                $actor,
                $snapshot,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $nextVersionNumber = $this->versionRepository
                    ->getNextVersionNumber(
                        $tenantId,
                        $layoutId
                    );

                $previousVersionNumber = max(
                    0,
                    $nextVersionNumber - 1
                );

                $version = $this->versionRepository->create([
                    'tenant_id' => $tenantId,
                    'asset_layout_id' => $layoutId,
                    'version_number' => $nextVersionNumber,
                    'schema_snapshot' => $snapshot,
                    'change_summary' => $changeSummary,
                    'created_by' => $actor->id,
                    'created_at' => now(),
                ]);

                $updated = $this->assetLayoutRepository
                    ->updateCurrentVersion(
                        $tenantId,
                        $layoutId,
                        $nextVersionNumber
                    );

                if (!$updated) {
                    throw new RuntimeException(
                        'Failed to synchronize the asset layout current version.'
                    );
                }

                $this->auditEventService->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_CREATED,
                    category: AuditEvent::CATEGORY_RESOURCE,
                    targetType: 'asset_layout_version',
                    targetId: $version->id,
                    targetLabel:
                        ($snapshot['layout']['name'] ?? 'Asset Layout')
                        . ' v'
                        . $nextVersionNumber,
                    description: 'Asset layout version was created.',
                    changes: [
                        'current_version' => [
                            'from' => $previousVersionNumber,
                            'to' => $nextVersionNumber,
                        ],
                    ],
                    metadata: [
                        'asset_layout_id' => $layoutId,
                        'asset_layout_name' =>
                            $snapshot['layout']['name'] ?? null,
                        'version_number' => $nextVersionNumber,
                        'change_summary' => $changeSummary,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

                return [
                    'success' => true,
                    'message' => 'Asset layout version created successfully.',
                    'version' => $version,
                ];
            }
        );
    }
}
