<?php

namespace App\Services\Company;

use App\Models\SecurityGroupResourceRestriction;
use App\Models\User;
use App\Repositories\SecurityGroupResourceRestrictionRepository;
use Illuminate\Auth\Access\AuthorizationException;

class CompanyAccessService
{
    public function __construct(
        protected SecurityGroupResourceRestrictionRepository $restrictionRepository
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Require View
    |--------------------------------------------------------------------------
    */

    public function requireView(
        string $tenantId,
        User $user,
        string $companyId
    ): void {
        $this->requireAccess(
            $tenantId,
            $user,
            $companyId,
            SecurityGroupResourceRestriction::ACCESS_VIEW
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Require Edit
    |--------------------------------------------------------------------------
    */

    public function requireEdit(
        string $tenantId,
        User $user,
        string $companyId
    ): void {
        $this->requireAccess(
            $tenantId,
            $user,
            $companyId,
            SecurityGroupResourceRestriction::ACCESS_EDIT
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Require Manage
    |--------------------------------------------------------------------------
    */

    public function requireManage(
        string $tenantId,
        User $user,
        string $companyId
    ): void {
        $this->requireAccess(
            $tenantId,
            $user,
            $companyId,
            SecurityGroupResourceRestriction::ACCESS_MANAGE
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Allowed Company IDs
    |--------------------------------------------------------------------------
    |
    | null = unrestricted
    | []   = restricted but no accessible companies
    |
    */

    public function allowedCompanyIds(
        string $tenantId,
        User $user
    ): ?array {
        if (
            $this->isTenantAdmin(
                $user
            )
        ) {
            return null;
        }

        $groupIds = $this
            ->restrictionRepository
            ->groupIdsForUser(
                $tenantId,
                (string) $user->id
            );

        if (empty($groupIds)) {
            return null;
        }

        $hasRestrictions = $this
            ->restrictionRepository
            ->hasRestrictionsForGroupsAndType(
                $tenantId,
                $groupIds,
                'company'
            );

        if (!$hasRestrictions) {
            return null;
        }

        return $this
            ->restrictionRepository
            ->resourceIdsForGroups(
                $tenantId,
                $groupIds,
                'company'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve Effective Access
    |--------------------------------------------------------------------------
    */

    public function effectiveAccessLevel(
        string $tenantId,
        User $user,
        string $companyId
    ): ?string {
        if (
            $this->isTenantAdmin(
                $user
            )
        ) {
            return SecurityGroupResourceRestriction::ACCESS_MANAGE;
        }

        $groupIds = $this
            ->restrictionRepository
            ->groupIdsForUser(
                $tenantId,
                (string) $user->id
            );

        /*
        |--------------------------------------------------------------------------
        | No Security Groups = Unrestricted
        |--------------------------------------------------------------------------
        */

        if (empty($groupIds)) {
            return SecurityGroupResourceRestriction::ACCESS_MANAGE;
        }

        $hasRestrictions = $this
            ->restrictionRepository
            ->hasRestrictionsForGroupsAndType(
                $tenantId,
                $groupIds,
                'company'
            );

        /*
        |--------------------------------------------------------------------------
        | Groups Exist But Company Restrictions Do Not
        |--------------------------------------------------------------------------
        */

        if (!$hasRestrictions) {
            return SecurityGroupResourceRestriction::ACCESS_MANAGE;
        }

        /*
        |--------------------------------------------------------------------------
        | Restricted Mode
        |--------------------------------------------------------------------------
        */

        $restrictions = $this
            ->restrictionRepository
            ->matchingForGroups(
                $tenantId,
                $groupIds,
                'company',
                $companyId
            );

        if ($restrictions->isEmpty()) {
            return null;
        }

        $highestLevel = null;
        $highestRank = 0;

        foreach ($restrictions as $restriction) {
            $rank = $this->accessRank(
                $restriction->access_level
            );

            if ($rank > $highestRank) {
                $highestRank = $rank;
                $highestLevel =
                    $restriction->access_level;
            }
        }

        return $highestLevel;
    }

    /*
    |--------------------------------------------------------------------------
    | Require Access
    |--------------------------------------------------------------------------
    */

    private function requireAccess(
        string $tenantId,
        User $user,
        string $companyId,
        string $requiredLevel
    ): void {
        $effectiveLevel = $this
            ->effectiveAccessLevel(
                $tenantId,
                $user,
                $companyId
            );

        if ($effectiveLevel === null) {
            throw new AuthorizationException(
                'You do not have access to this company.'
            );
        }

        if (
            $this->accessRank(
                $effectiveLevel
            ) <
            $this->accessRank(
                $requiredLevel
            )
        ) {
            throw new AuthorizationException(
                'You do not have sufficient access to this company.'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Access Ranking
    |--------------------------------------------------------------------------
    */

    private function accessRank(
        string $level
    ): int {
        return match ($level) {
            SecurityGroupResourceRestriction::ACCESS_VIEW =>
                1,

            SecurityGroupResourceRestriction::ACCESS_EDIT =>
                2,

            SecurityGroupResourceRestriction::ACCESS_MANAGE =>
                3,

            default =>
                0,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | MSP Admin Bypass
    |--------------------------------------------------------------------------
    */

    private function isTenantAdmin(
        User $user
    ): bool {
        return $user->hasRole(
            'MSP Admin'
        );
    }
}
