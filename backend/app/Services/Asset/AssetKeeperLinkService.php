<?php

namespace App\Services\Asset;

use App\Models\Asset;
use App\Models\AssetKeeperLink;
use App\Models\AuditEvent;
use App\Models\KeeperLink;
use App\Models\User;
use App\Repositories\AssetKeeperLinkRepository;
use App\Repositories\AssetRepository;
use App\Repositories\KeeperLinkRepository;
use App\Services\Audit\AuditEventService;
use App\Services\Company\CompanyAccessService;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssetKeeperLinkService
{
    public function __construct(
        private readonly AssetKeeperLinkRepository $assetKeeperLinkRepository,
        private readonly AssetRepository $assetRepository,
        private readonly KeeperLinkRepository $keeperLinkRepository,
        private readonly CompanyAccessService $companyAccessService,
        private readonly AuditEventService $auditEventService
    ) {
    }

    public function getAll(
        string $tenantId,
        string $assetId,
        User $actor
    ): Collection {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this->companyAccessService->requireView(
            $tenantId,
            $actor,
            $asset->company_id
        );

        return $this
            ->assetKeeperLinkRepository
            ->getForAsset(
                $tenantId,
                $assetId
            );
    }

    public function attach(
        string $tenantId,
        string $assetId,
        string $keeperLinkId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): AssetKeeperLink {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this->companyAccessService->requireEdit(
            $tenantId,
            $actor,
            $asset->company_id
        );

        $keeperLink = $this->requireKeeperLink(
            $tenantId,
            $keeperLinkId
        );

        $this->validateCompanyCompatibility(
            $asset,
            $keeperLink
        );

        $exists = $this
            ->assetKeeperLinkRepository
            ->existsForAssetAndKeeperLink(
                $tenantId,
                $assetId,
                $keeperLinkId
            );

        if ($exists) {
            throw ValidationException::withMessages([
                'keeper_link_id' => [
                    'This Keeper link is already attached to the asset.',
                ],
            ]);
        }

        return DB::transaction(
            function () use (
                $tenantId,
                $asset,
                $keeperLink,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $relationship = $this
                    ->assetKeeperLinkRepository
                    ->create([
                        'tenant_id' =>
                            $tenantId,

                        'asset_id' =>
                            $asset->id,

                        'keeper_link_id' =>
                            $keeperLink->id,

                        'created_by' =>
                            $actor->id,
                    ]);

                $this
                    ->assetRepository
                    ->update(
                        $asset,
                        [
                            'updated_by' =>
                                $actor->id,
                        ]
                    );

                $this
                    ->auditEventService
                    ->record(
                        tenantId: $tenantId,
                        actor: $actor,
                        action:
                            AuditEvent::ACTION_UPDATED,
                        category:
                            AuditEvent::CATEGORY_RESOURCE,
                        targetType: 'asset',
                        targetId:
                            (string) $asset->id,
                        targetLabel:
                            $asset->name,
                        description:
                            'Keeper link was attached to asset.',
                        changes: [
                            'keeper_link_id' => [
                                'from' => null,
                                'to' =>
                                    $keeperLink->id,
                            ],
                        ],
                        metadata: [
                            'relationship_id' =>
                                $relationship->id,

                            'keeper_link_id' =>
                                $keeperLink->id,

                            'keeper_link_name' =>
                                $keeperLink->name,

                            'company_id' =>
                                $asset->company_id,
                        ],
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod:
                            $requestMethod,
                        requestPath: $requestPath
                    );

                return $relationship;
            }
        );
    }

    public function detach(
        string $tenantId,
        string $assetId,
        string $relationshipId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): void {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this->companyAccessService->requireEdit(
            $tenantId,
            $actor,
            $asset->company_id
        );

        $relationship = $this
            ->assetKeeperLinkRepository
            ->findByTenantAssetAndId(
                $tenantId,
                $assetId,
                $relationshipId
            );

        if (!$relationship) {
            throw new DomainException(
                'Asset Keeper relationship not found.'
            );
        }

        $keeperLink = $relationship->keeperLink;

        DB::transaction(
            function () use (
                $tenantId,
                $asset,
                $relationship,
                $keeperLink,
                $actor,
                $ipAddress,
                $userAgent,
                $requestMethod,
                $requestPath
            ) {
                $relationshipId =
                    $relationship->id;

                $keeperLinkId =
                    $relationship->keeper_link_id;

                $keeperLinkName =
                    $keeperLink?->name;

                $this
                    ->assetKeeperLinkRepository
                    ->delete(
                        $relationship
                    );

                $this
                    ->assetRepository
                    ->update(
                        $asset,
                        [
                            'updated_by' =>
                                $actor->id,
                        ]
                    );

                $this
                    ->auditEventService
                    ->record(
                        tenantId: $tenantId,
                        actor: $actor,
                        action:
                            AuditEvent::ACTION_UPDATED,
                        category:
                            AuditEvent::CATEGORY_RESOURCE,
                        targetType: 'asset',
                        targetId:
                            (string) $asset->id,
                        targetLabel:
                            $asset->name,
                        description:
                            'Keeper link was detached from asset.',
                        changes: [
                            'keeper_link_id' => [
                                'from' =>
                                    $keeperLinkId,
                                'to' => null,
                            ],
                        ],
                        metadata: [
                            'relationship_id' =>
                                $relationshipId,

                            'keeper_link_id' =>
                                $keeperLinkId,

                            'keeper_link_name' =>
                                $keeperLinkName,

                            'company_id' =>
                                $asset->company_id,
                        ],
                        ipAddress: $ipAddress,
                        userAgent: $userAgent,
                        requestMethod:
                            $requestMethod,
                        requestPath: $requestPath
                    );
            }
        );
    }

    private function requireAsset(
        string $tenantId,
        string $assetId
    ): Asset {
        $asset = $this
            ->assetRepository
            ->findByTenantAndId(
                $tenantId,
                $assetId
            );

        if (!$asset) {
            throw new DomainException(
                'Asset not found.'
            );
        }

        return $asset;
    }

    private function requireKeeperLink(
        string $tenantId,
        string $keeperLinkId
    ): KeeperLink {
        $keeperLink = $this
            ->keeperLinkRepository
            ->findByTenantAndId(
                $tenantId,
                $keeperLinkId
            );

        if (!$keeperLink) {
            throw ValidationException::withMessages([
                'keeper_link_id' => [
                    'The selected Keeper link was not found.',
                ],
            ]);
        }

        return $keeperLink;
    }

    private function validateCompanyCompatibility(
        Asset $asset,
        KeeperLink $keeperLink
    ): void {
        if (
            (string) $keeperLink->company_id !==
            (string) $asset->company_id
        ) {
            throw ValidationException::withMessages([
                'keeper_link_id' => [
                    'The Keeper link must belong to the same company as the asset.',
                ],
            ]);
        }
    }
}
