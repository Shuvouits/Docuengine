<?php

namespace App\Services\Company;

use App\Models\Company;
use App\Models\TenantUser;
use App\Models\User;
use App\Repositories\CompanyContextRepository;
use App\Repositories\CompanyRepository;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;

class CompanyContextService
{
    public function __construct(
        protected CompanyContextRepository $companyContextRepository,
        protected CompanyRepository $companyRepository,
        protected CompanyAccessService $companyAccessService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Current Context
    |--------------------------------------------------------------------------
    */

    public function getContext(
        string $tenantId,
        User $actor
    ): array {
        $membership = $this
            ->requireMembership(
                $tenantId,
                (string) $actor->id
            );

        $currentCompany = null;
        $selectionReset = false;

        /*
        |--------------------------------------------------------------------------
        | Resolve Saved Company
        |--------------------------------------------------------------------------
        */

        if ($membership->current_company_id) {
            $currentCompany = $this
                ->companyRepository
                ->findByTenantAndId(
                    $tenantId,
                    $membership->current_company_id
                );

            /*
            |--------------------------------------------------------------------------
            | Company Was Archived / Removed
            |--------------------------------------------------------------------------
            */

            if (!$currentCompany) {
                $this
                    ->companyContextRepository
                    ->clearCurrentCompany(
                        $membership
                    );

                $currentCompany = null;
                $selectionReset = true;
            }

            /*
            |--------------------------------------------------------------------------
            | Security Access Was Removed
            |--------------------------------------------------------------------------
            */

            if ($currentCompany) {
                try {
                    $this
                        ->companyAccessService
                        ->requireView(
                            $tenantId,
                            $actor,
                            $currentCompany->id
                        );
                } catch (AuthorizationException) {
                    $this
                        ->companyContextRepository
                        ->clearCurrentCompany(
                            $membership
                        );

                    $currentCompany = null;
                    $selectionReset = true;
                }
            }
        }

        $availableCompanies = $this
            ->getAvailableCompanies(
                $tenantId,
                $actor
            );

        return [
            'scope' =>
                $currentCompany
                    ? 'company'
                    : 'global',

            'current_company' =>
                $currentCompany
                    ? $this->formatCompany(
                        $tenantId,
                        $actor,
                        $currentCompany
                    )
                    : null,

            'selection_reset' =>
                $selectionReset,

            'available_companies' =>
                $availableCompanies,

            'available_company_count' =>
                $availableCompanies->count(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Switch Company
    |--------------------------------------------------------------------------
    */

    public function switchCompany(
        string $tenantId,
        User $actor,
        ?string $companyId
    ): array {
        $membership = $this
            ->requireMembership(
                $tenantId,
                (string) $actor->id
            );

        /*
        |--------------------------------------------------------------------------
        | Switch To Global Workspace
        |--------------------------------------------------------------------------
        */

        if ($companyId === null) {
            $this
                ->companyContextRepository
                ->clearCurrentCompany(
                    $membership
                );

            return $this->getContext(
                $tenantId,
                $actor
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Tenant Company Validation
        |--------------------------------------------------------------------------
        */

        $company = $this
            ->companyRepository
            ->findByTenantAndId(
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
        | Security Group Validation
        |--------------------------------------------------------------------------
        */

        $this
            ->companyAccessService
            ->requireView(
                $tenantId,
                $actor,
                $companyId
            );

        /*
        |--------------------------------------------------------------------------
        | Persist Selection
        |--------------------------------------------------------------------------
        */

        $this
            ->companyContextRepository
            ->updateCurrentCompany(
                $membership,
                $companyId
            );

        return $this->getContext(
            $tenantId,
            $actor
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Available Companies
    |--------------------------------------------------------------------------
    */

    private function getAvailableCompanies(
        string $tenantId,
        User $actor
    ) {
        $companyIds = $this
            ->companyAccessService
            ->allowedCompanyIds(
                $tenantId,
                $actor
            );

        return $this
            ->companyRepository
            ->allAvailableForTenant(
                $tenantId,
                $companyIds
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Require Membership
    |--------------------------------------------------------------------------
    */

    private function requireMembership(
        string $tenantId,
        string $userId
    ): TenantUser {
        $membership = $this
            ->companyContextRepository
            ->findMembership(
                $tenantId,
                $userId
            );

        if (!$membership) {
            throw new DomainException(
                'Tenant membership not found.'
            );
        }

        if (!$membership->isActive()) {
            throw new DomainException(
                'Tenant membership is not active.'
            );
        }

        return $membership;
    }

    /*
    |--------------------------------------------------------------------------
    | Format Company
    |--------------------------------------------------------------------------
    */

    private function formatCompany(
        string $tenantId,
        User $actor,
        Company $company
    ): array {
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

            'access_level' =>
                $this
                    ->companyAccessService
                    ->effectiveAccessLevel(
                        $tenantId,
                        $actor,
                        $company->id
                    ),
        ];
    }
}
