<?php

namespace App\Services\AssetLayout;

use App\Models\AssetLayout;
use App\Models\AuditEvent;
use App\Models\User;
use App\Repositories\AssetLayoutRepository;
use App\Services\Archive\ArchiveService;
use App\Services\Audit\AuditEventService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AssetLayoutService
{
    public function __construct(
        private readonly AssetLayoutRepository $assetLayoutRepository,
        private readonly AuditEventService $auditEventService,
        private readonly ArchiveService $archiveService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Get All Layouts
    |--------------------------------------------------------------------------
    */

    public function getAll(
        string $tenantId
    ): Collection {
        return $this->assetLayoutRepository
            ->getAllByTenant($tenantId);
    }

    /*
    |--------------------------------------------------------------------------
    | Get Layout
    |--------------------------------------------------------------------------
    */

    public function getById(
        string $tenantId,
        string $layoutId
    ): AssetLayout {
        $layout = $this->assetLayoutRepository
            ->findById(
                $tenantId,
                $layoutId
            );

        if (!$layout) {
            throw (new ModelNotFoundException())
                ->setModel(
                    AssetLayout::class,
                    [$layoutId]
                );
        }

        return $layout;
    }

    /*
    |--------------------------------------------------------------------------
    | Create Layout
    |--------------------------------------------------------------------------
    */

    public function create(
        string $tenantId,
        User $actor,
        array $data,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): AssetLayout {
        return DB::transaction(
            function () use (
                $tenantId,
                $actor,
                $data,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $slug = $this->generateUniqueSlug(
                    $tenantId,
                    $data['name']
                );

                $layout = $this->assetLayoutRepository->create([
                    'tenant_id' => $tenantId,
                    'name' => $data['name'],
                    'slug' => $slug,
                    'description' => $data['description'] ?? null,
                    'status' => AssetLayout::STATUS_DRAFT,
                    'current_version' => 1,
                    'is_template' => $data['is_template'] ?? false,
                    'is_active' => false,
                    'created_by' => $actor->id,
                    'updated_by' => $actor->id,
                ]);

                $this->auditEventService->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_CREATED,
                    category: AuditEvent::CATEGORY_RESOURCE,
                    targetType: 'asset_layout',
                    targetId: $layout->id,
                    targetLabel: $layout->name,
                    description: 'Asset layout was created.',
                    changes: [
                        'name' => [
                            'from' => null,
                            'to' => $layout->name,
                        ],
                        'status' => [
                            'from' => null,
                            'to' => $layout->status,
                        ],
                        'is_template' => [
                            'from' => null,
                            'to' => (bool) $layout->is_template,
                        ],
                    ],
                    metadata: [
                        'slug' => $layout->slug,
                        'current_version' => $layout->current_version,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

                return $layout;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Layout
    |--------------------------------------------------------------------------
    */

    public function update(
        string $tenantId,
        string $layoutId,
        User $actor,
        array $data,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): AssetLayout {
        return DB::transaction(
            function () use (
                $tenantId,
                $layoutId,
                $actor,
                $data,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $layout = $this->getById(
                    $tenantId,
                    $layoutId
                );

                $updateData = [];
                $changes = [];

                if (
                    array_key_exists('name', $data) &&
                    $data['name'] !== $layout->name
                ) {
                    $updateData['name'] = $data['name'];

                    $changes['name'] = [
                        'from' => $layout->name,
                        'to' => $data['name'],
                    ];
                }

                if (
                    array_key_exists('description', $data) &&
                    $data['description'] !== $layout->description
                ) {
                    $updateData['description'] = $data['description'];

                    $changes['description'] = [
                        'from' => $layout->description,
                        'to' => $data['description'],
                    ];
                }

                if (
                    array_key_exists('is_template', $data) &&
                    (bool) $data['is_template'] !==
                    (bool) $layout->is_template
                ) {
                    $updateData['is_template'] =
                        $data['is_template'];

                    $changes['is_template'] = [
                        'from' => (bool) $layout->is_template,
                        'to' => (bool) $data['is_template'],
                    ];
                }

                if (empty($changes)) {
                    return $layout;
                }

                $updateData['updated_by'] = $actor->id;

                $updatedLayout =
                    $this->assetLayoutRepository->update(
                        $layout,
                        $updateData
                    );

                $this->auditEventService->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_UPDATED,
                    category: AuditEvent::CATEGORY_RESOURCE,
                    targetType: 'asset_layout',
                    targetId: $updatedLayout->id,
                    targetLabel: $updatedLayout->name,
                    description: 'Asset layout was updated.',
                    changes: $changes,
                    metadata: [
                        'slug' => $updatedLayout->slug,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

                return $updatedLayout;
            }
        );
    }



    /**
|--------------------------------------------------------------------------
| Activate Layout
|--------------------------------------------------------------------------
     */

    public function activate(
        string $tenantId,
        string $layoutId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): AssetLayout {
        return DB::transaction(
            function () use (
                $tenantId,
                $layoutId,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $layout = $this->getById(
                    $tenantId,
                    $layoutId
                );

                $currentVersionNumber =
                    (int) $layout->current_version;

                $hasCurrentVersion =
                    $layout->versions
                    ->contains(
                        fn($version) =>
                        (int) $version->version_number ===
                            $currentVersionNumber
                    );

                if (
                    $currentVersionNumber < 1 ||
                    !$hasCurrentVersion
                ) {
                    throw new \DomainException(
                        'Asset layout must have a valid current version before activation.'
                    );
                }

                if (
                    $layout->status ===
                    AssetLayout::STATUS_ACTIVE &&
                    (bool) $layout->is_active === true
                ) {
                    return $layout;
                }

                $changes = [];

                if (
                    $layout->status !==
                    AssetLayout::STATUS_ACTIVE
                ) {
                    $changes['status'] = [
                        'from' => $layout->status,
                        'to' => AssetLayout::STATUS_ACTIVE,
                    ];
                }

                if (
                    (bool) $layout->is_active !== true
                ) {
                    $changes['is_active'] = [
                        'from' => (bool) $layout->is_active,
                        'to' => true,
                    ];
                }

                $updatedLayout =
                    $this->assetLayoutRepository->update(
                        $layout,
                        [
                            'status' =>
                            AssetLayout::STATUS_ACTIVE,

                            'is_active' => true,

                            'updated_by' =>
                            $actor->id,
                        ]
                    );

                $this->auditEventService->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_UPDATED,
                    category: AuditEvent::CATEGORY_RESOURCE,
                    targetType: 'asset_layout',
                    targetId: $updatedLayout->id,
                    targetLabel: $updatedLayout->name,
                    description: 'Asset layout was activated.',
                    changes: $changes,
                    metadata: [
                        'slug' =>
                        $updatedLayout->slug,

                        'current_version' =>
                        $updatedLayout->current_version,
                    ],
                    ipAddress: $ipAddress,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );

                return $updatedLayout;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Layout
    |--------------------------------------------------------------------------
    */

    public function delete(
        string $tenantId,
        string $layoutId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): void {
        DB::transaction(
            function () use (
                $tenantId,
                $layoutId,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $layout = $this->getById(
                    $tenantId,
                    $layoutId
                );

                $metadata = [
                    'slug' => $layout->slug,
                    'status' => $layout->status,
                    'current_version' =>
                    $layout->current_version,
                    'is_template' =>
                    (bool) $layout->is_template,
                    'is_active' =>
                    (bool) $layout->is_active,
                ];

                $this->assetLayoutRepository
                    ->delete($layout);

                $this->archiveService
                    ->registerArchivedResource(
                        tenantId: $tenantId,
                        resourceType: 'asset_layout',
                        resourceId: $layoutId,
                        resourceLabel: $layout->name,
                        actor: $actor,
                        reason: null,
                        metadata: $metadata,
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Layout
    |--------------------------------------------------------------------------
    */

    public function restore(
        string $tenantId,
        string $layoutId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): AssetLayout {
        return DB::transaction(
            function () use (
                $tenantId,
                $layoutId,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $archiveEntry = $this->archiveService
                    ->getArchivedByResource(
                        $tenantId,
                        'asset_layout',
                        $layoutId
                    );

                $layout = $this->assetLayoutRepository
                    ->restore(
                        $tenantId,
                        $layoutId
                    );

                if (!$layout) {
                    throw (new ModelNotFoundException())
                        ->setModel(
                            AssetLayout::class,
                            [$layoutId]
                        );
                }

                $this->archiveService
                    ->markRestored(
                        tenantId: $tenantId,
                        archiveEntryId: $archiveEntry->id,
                        actor: $actor,
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod: $requestMethod,
                        requestPath: $requestPath
                    );

                return $layout;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Stable Unique Slug
    |--------------------------------------------------------------------------
    */

    private function generateUniqueSlug(
        string $tenantId,
        string $name
    ): string {
        $baseSlug = Str::slug($name);

        if ($baseSlug === '') {
            $baseSlug = 'asset-layout';
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
            $this->assetLayoutRepository
            ->findBySlug(
                $tenantId,
                $slug
            )
        ) {
            $slug = $baseSlug . '-' . $counter;

            $counter++;
        }

        return $slug;
    }
}
