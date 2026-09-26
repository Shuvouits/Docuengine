<?php

namespace App\Services\Company;

use App\Models\User;
use App\Repositories\CompanyRepository;
use DomainException;

class CompanyWorkspaceService
{
    public function __construct(
        protected CompanyRepository $companyRepository,
        protected CompanyAccessService $companyAccessService
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

        /*
        |--------------------------------------------------------------------------
        | Company Access
        |--------------------------------------------------------------------------
        */

        $this
            ->companyAccessService
            ->requireView(
                $tenantId,
                $actor,
                $companyId
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

            /*
            |--------------------------------------------------------------------------
            | Company Profile
            |--------------------------------------------------------------------------
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

            /*
            |--------------------------------------------------------------------------
            | Primary Contact
            |--------------------------------------------------------------------------
            */

            'contact' => [
                'name' =>
                    $company->primary_contact_name,

                'email' =>
                    $company->primary_contact_email,

                'phone' =>
                    $company->primary_contact_phone,
            ],

            /*
            |--------------------------------------------------------------------------
            | Location
            |--------------------------------------------------------------------------
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

            /*
            |--------------------------------------------------------------------------
            | Current Resource Counters
            |--------------------------------------------------------------------------
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
                        null,

                    'available' =>
                        false,

                    'planned_module' =>
                        6,
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

            /*
            |--------------------------------------------------------------------------
            | Company Navigation Context
            |--------------------------------------------------------------------------
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
                    false,

                'documentation' =>
                    false,
            ],

            /*
            |--------------------------------------------------------------------------
            | Lifecycle
            |--------------------------------------------------------------------------
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
}
