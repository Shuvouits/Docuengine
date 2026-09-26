<?php

namespace App\Services\Company;

use App\Models\Company;
use App\Repositories\CompanyRepository;

class GlobalWorkspaceService
{
    public function __construct(
        protected CompanyRepository $companyRepository
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Global Workspace
    |--------------------------------------------------------------------------
    */

    public function getWorkspace(
        string $tenantId
    ): array {
        $companies = $this
            ->companyRepository
            ->globalWorkspaceCompanies(
                $tenantId
            );

        $statusCounters = $this
            ->companyRepository
            ->countByStatus(
                $tenantId
            );

        return [
            /*
            |--------------------------------------------------------------------------
            | Workspace Context
            |--------------------------------------------------------------------------
            */

            'context' => [
                'tenant_id' =>
                    $tenantId,

                'scope' =>
                    'global',

                'company_id' =>
                    null,
            ],

            /*
            |--------------------------------------------------------------------------
            | Company Summary
            |--------------------------------------------------------------------------
            */

            'summary' => [
                'companies' =>
                    $statusCounters,
            ],

            /*
            |--------------------------------------------------------------------------
            | Managed Companies
            |--------------------------------------------------------------------------
            */

            'companies' =>
                $companies
                    ->map(
                        fn (Company $company) => [
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
                            ],
                        ]
                    )
                    ->values(),

            /*
            |--------------------------------------------------------------------------
            | Future Global Resources
            |--------------------------------------------------------------------------
            */

            'resources' => [
                'asset_layouts' => [
                    'available' =>
                        true,
                ],

                'assets' => [
                    'available' =>
                        false,

                    'planned_module' =>
                        6,
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
}
