<?php

namespace App\Services\Company;

use App\Models\Asset;
use App\Models\User;
use App\Repositories\AssetRepository;
use App\Repositories\CompanyRepository;
use DomainException;

class CompanyWorkspaceService
{
    public function __construct(
        protected CompanyRepository $companyRepository,
        protected CompanyAccessService $companyAccessService,
        protected AssetRepository $assetRepository
    ) {
    }

    /**
     * --------------------------------------------------------------------------
     * Company Workspace
     * --------------------------------------------------------------------------
     */
    public function getWorkspace(
        string $tenantId,
        string $companyId,
        User $actor
    ): array {
        $company = $this
            ->companyRepository
            ->findForWorkspace(
                $tenantId,
                $companyId
            );

        if (!$company) {
            throw new DomainException(
                'Company not found.'
            );
        }

        /**
         * --------------------------------------------------------------------------
         * Company Access
         * --------------------------------------------------------------------------
         */

        $this
            ->companyAccessService
            ->requireView(
                $tenantId,
                $actor,
                $companyId
            );

        /**
         * --------------------------------------------------------------------------
         * Asset Workspace Data
         * --------------------------------------------------------------------------
         */

        $companyScope = [
            $companyId,
        ];

        $assetSummary = $this
            ->assetRepository
            ->summaryForTenant(
                $tenantId,
                $companyScope
            );

        $assetCountsByLayout = $this
            ->assetRepository
            ->countByLayout(
                $tenantId,
                $companyScope
            );

        $recentCreatedAssets = $this
            ->assetRepository
            ->recentCreated(
                $tenantId,
                $companyScope,
                5
            );

        $recentUpdatedAssets = $this
            ->assetRepository
            ->recentUpdated(
                $tenantId,
                $companyScope,
                5
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

                'company_id' =>
                    $company->id,

                'company_name' =>
                    $company->name,

                'company_slug' =>
                    $company->slug,

                'status' =>
                    $company->status,

                'resource_type' =>
                    'company',

                'resource_id' =>
                    $company->id,
            ],

            /**
             * --------------------------------------------------------------------------
             * Company Profile
             * --------------------------------------------------------------------------
             */

            'company' => [
                'id' =>
                    $company->id,

                'name' =>
                    $company->name,

                'legal_name' =>
                    $company->legal_name,

                'slug' =>
                    $company->slug,

                'website' =>
                    $company->website,

                'status' =>
                    $company->status,

                'description' =>
                    $company->description,

                'notes' =>
                    $company->notes,
            ],

            /**
             * --------------------------------------------------------------------------
             * Primary Contact
             * --------------------------------------------------------------------------
             */

            'contact' => [
                'name' =>
                    $company->primary_contact_name,

                'email' =>
                    $company->primary_contact_email,

                'phone' =>
                    $company->primary_contact_phone,
            ],

            /**
             * --------------------------------------------------------------------------
             * Location
             * --------------------------------------------------------------------------
             */

            'location' => [
                'address_line1' =>
                    $company->address_line1,

                'address_line2' =>
                    $company->address_line2,

                'city' =>
                    $company->city,

                'state_region' =>
                    $company->state_region,

                'postal_code' =>
                    $company->postal_code,

                'country' =>
                    $company->country,
            ],

            /**
             * --------------------------------------------------------------------------
             * Current Resource Counters
             * --------------------------------------------------------------------------
             */

            'resources' => [
                'asset_layouts' => [
                    'count' =>
                        (int) (
                            $company
                                ->asset_layout_activations_count
                            ?? 0
                        ),

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
                    'count' =>
                        null,

                    'available' =>
                        false,

                    'planned_module' =>
                        7,
                ],
            ],

            /**
             * --------------------------------------------------------------------------
             * Asset Summary
             * --------------------------------------------------------------------------
             */

            'assets' => [
                'summary' =>
                    $assetSummary,

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
             * Company Navigation Context
             * --------------------------------------------------------------------------
             */

            'navigation' => [
                'overview' =>
                    true,

                'company_info' =>
                    true,

                'contacts' =>
                    true,

                'locations' =>
                    true,

                'asset_layouts' =>
                    true,

                'assets' =>
                    true,

                'documentation' =>
                    false,
            ],

            /**
             * --------------------------------------------------------------------------
             * Lifecycle
             * --------------------------------------------------------------------------
             */

            'lifecycle' => [
                'created_at' =>
                    $company->created_at,

                'updated_at' =>
                    $company->updated_at,

                'archived_at' =>
                    $company->archived_at,

                'created_by' =>
                    $company->created_by,

                'updated_by' =>
                    $company->updated_by,

                'archived_by' =>
                    $company->archived_by,
            ],
        ];
    }

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
