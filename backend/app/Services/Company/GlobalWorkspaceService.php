<?php

namespace App\Services\Company;

use App\Models\Asset;
use App\Models\Company;
use App\Models\User;
use App\Repositories\AssetRepository;
use App\Repositories\CompanyRepository;

class GlobalWorkspaceService
{
    public function __construct(
        protected CompanyRepository $companyRepository,
        protected AssetRepository $assetRepository,
        protected CompanyAccessService $companyAccessService
    ) {
    }

    /**
     * --------------------------------------------------------------------------
     * Global Workspace
     * --------------------------------------------------------------------------
     */
    public function getWorkspace(
        string $tenantId,
        User $actor
    ): array {
        /**
         * --------------------------------------------------------------------------
         * Security Group Company Scope
         * --------------------------------------------------------------------------
         */

        $allowedCompanyIds = $this
            ->companyAccessService
            ->allowedCompanyIds(
                $tenantId,
                $actor
            );

        /**
         * --------------------------------------------------------------------------
         * Companies
         * --------------------------------------------------------------------------
         */

        $companies = $this
            ->companyRepository
            ->globalWorkspaceCompanies(
                $tenantId,
                $allowedCompanyIds
            );

        $statusCounters = $this
            ->companyRepository
            ->countByStatus(
                $tenantId,
                $allowedCompanyIds
            );

        /**
         * --------------------------------------------------------------------------
         * Asset Summary
         * --------------------------------------------------------------------------
         */

        $assetSummary = $this
            ->assetRepository
            ->summaryForTenant(
                $tenantId,
                $allowedCompanyIds
            );

        $assetCountsByCompany = $this
            ->assetRepository
            ->countByCompany(
                $tenantId,
                $allowedCompanyIds
            );

        $assetCountsByLayout = $this
            ->assetRepository
            ->countByLayout(
                $tenantId,
                $allowedCompanyIds
            );

        $recentCreatedAssets = $this
            ->assetRepository
            ->recentCreated(
                $tenantId,
                $allowedCompanyIds,
                10
            );

        $recentUpdatedAssets = $this
            ->assetRepository
            ->recentUpdated(
                $tenantId,
                $allowedCompanyIds,
                10
            );

        return [
            /**
             * --------------------------------------------------------------------------
             * Workspace Context
             * --------------------------------------------------------------------------
             */

            'context' => [
                'tenant_id' =>
                    $tenantId,

                'scope' =>
                    'global',

                'company_id' =>
                    null,
            ],

            /**
             * --------------------------------------------------------------------------
             * Global Summary
             * --------------------------------------------------------------------------
             */

            'summary' => [
                'companies' =>
                    $statusCounters,

                'assets' =>
                    $assetSummary,
            ],

            /**
             * --------------------------------------------------------------------------
             * Managed Companies
             * --------------------------------------------------------------------------
             */

            'companies' =>
                $companies
                    ->map(
                        function (
                            Company $company
                        ) use (
                            $assetCountsByCompany
                        ) {
                            return [
                                'id' =>
                                    $company->id,

                                'name' =>
                                    $company->name,

                                'slug' =>
                                    $company->slug,

                                'status' =>
                                    $company->status,

                                'city' =>
                                    $company->city,

                                'state_region' =>
                                    $company->state_region,

                                'country' =>
                                    $company->country,

                                'resource_counts' => [
                                    'asset_layouts' =>
                                        (int) (
                                            $company
                                                ->asset_layout_activations_count
                                            ?? 0
                                        ),

                                    'assets' =>
                                        (int) (
                                            $assetCountsByCompany[
                                                (string) $company->id
                                            ]
                                            ?? 0
                                        ),
                                ],
                            ];
                        }
                    )
                    ->values()
                    ->all(),

            /**
             * --------------------------------------------------------------------------
             * Asset Workspace
             * --------------------------------------------------------------------------
             */

            'assets' => [
                'counts_by_company' =>
                    $assetCountsByCompany,

                'counts_by_layout' =>
                    $assetCountsByLayout,

                'recently_created' =>
                    $recentCreatedAssets
                        ->map(
                            fn (Asset $asset) =>
                                $this->formatAsset(
                                    $asset
                                )
                        )
                        ->values()
                        ->all(),

                'recently_updated' =>
                    $recentUpdatedAssets
                        ->map(
                            fn (Asset $asset) =>
                                $this->formatAsset(
                                    $asset
                                )
                        )
                        ->values()
                        ->all(),
            ],

            /**
             * --------------------------------------------------------------------------
             * Global Resources
             * --------------------------------------------------------------------------
             */

            'resources' => [
                'asset_layouts' => [
                    'available' =>
                        true,
                ],

                'assets' => [
                    'count' =>
                        (int) (
                            $assetSummary['total']
                            ?? 0
                        ),

                    'available' =>
                        true,
                ],

                'documents' => [
                    'available' =>
                        false,

                    'planned_module' =>
                        7,
                ],
            ],
        ];
    }

    /**
     * --------------------------------------------------------------------------
     * Format Workspace Asset
     * --------------------------------------------------------------------------
     */
    private function formatAsset(
        Asset $asset
    ): array {
        return [
            'id' =>
                $asset->id,

            'company_id' =>
                $asset->company_id,

            'asset_layout_id' =>
                $asset->asset_layout_id,

            'asset_layout_version_id' =>
                $asset->asset_layout_version_id,

            'name' =>
                $asset->name,

            'status' =>
                $asset->status,

            'data_source' =>
                $asset->data_source,

            'lifecycle_status' =>
                $asset->lifecycle_status,

            'warranty_expiration_date' =>
                $asset->warranty_expiration_date,

            'company' =>
                $asset->company
                    ? [
                        'id' =>
                            $asset->company->id,

                        'name' =>
                            $asset->company->name,
                    ]
                    : null,

            'layout' =>
                $asset->layout
                    ? [
                        'id' =>
                            $asset->layout->id,

                        'name' =>
                            $asset->layout->name,

                        'slug' =>
                            $asset->layout->slug,

                        'current_version' =>
                            $asset->layout->current_version,
                    ]
                    : null,

            'owner' =>
                $asset->owner
                    ? [
                        'id' =>
                            $asset->owner->id,

                        'name' =>
                            $asset->owner->name,

                        'email' =>
                            $asset->owner->email,
                    ]
                    : null,

            'assigned_user' =>
                $asset->assignedUser
                    ? [
                        'id' =>
                            $asset->assignedUser->id,

                        'name' =>
                            $asset->assignedUser->name,

                        'email' =>
                            $asset->assignedUser->email,
                    ]
                    : null,

            'created_at' =>
                $asset->created_at,

            'updated_at' =>
                $asset->updated_at,
        ];
    }
}
