import { useEffect, useMemo, useState } from "react";

import api from "../../../api/axios";


import OverviewStats from "../../../component/admin/organization/overview/OverviewStats";
import OrganizationIdentityCard from "../../../component/admin/organization/overview/OrganizationIdentityCard";
import RegionalSettingsCard from "../../../component/admin/organization/overview/RegionalSettingsCard";
import FeatureFlagsCard from "../../../component/admin/organization/overview/FeatureFlagsCard";
import TerminologyCard from "../../../component/admin/organization/overview/TerminologyCard";
import TenantInformationCard from "../../../component/admin/organization/overview/TenantInformationCard";
import BrandingOverviewCard from "../../../component/admin/organization/overview/BrandingOverviewCard";

import {
    OrganizationErrorState,
    OrganizationLoadingState,
    OrganizationEmptyState,
} from "../../../component/admin/organization/overview/OverviewStates";


import OrganizationHero from "../../../component/admin/organization/overview/OrganizationHero";

function OrganizationOverviewPage({
    authData = null,
    authLoading = false,
}) {
    const user = authData?.user || null;
    const currentTenant = authData?.current_tenant || null;

    const isPlatformOwner =
        Boolean(user?.is_platform_owner);

    const [configuration, setConfiguration] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | Load Configuration
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            authLoading ||
            !authData ||
            !currentTenant?.id
        ) {
            return;
        }

        const loadConfiguration = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.get(
                    `/tenants/${currentTenant.id}/configuration`
                );

                setConfiguration(
                    response.data?.data || null
                );
            } catch (error) {
                console.error(
                    "Organization overview loading failed:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                        "Unable to load organization information."
                );
            } finally {
                setLoading(false);
            }
        };

        loadConfiguration();
    }, [
        authData,
        authLoading,
        currentTenant?.id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Derived Data
    |--------------------------------------------------------------------------
    */

    const organization =
        configuration ||
        currentTenant ||
        null;

    const settings =
        configuration?.settings ||
        currentTenant?.settings ||
        null;

    const branding =
        configuration?.branding ||
        currentTenant?.branding ||
        null;

    const featureFlags =
        configuration?.feature_flags || [];

    const terminology =
        configuration?.settings?.terminology || {};

    const enabledFeatures = useMemo(
        () =>
            featureFlags.filter(
                (feature) =>
                    Boolean(feature?.enabled)
            ),
        [featureFlags]
    );

    /*
    |--------------------------------------------------------------------------
    | States
    |--------------------------------------------------------------------------
    */

    if (authLoading) {
        return <OrganizationLoadingState />;
    }

    if (
        isPlatformOwner &&
        !currentTenant
    ) {
        return <OrganizationEmptyState />;
    }

    if (error) {
        return (
            <OrganizationErrorState
                message={error}
            />
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (
        <div className="space-y-7">

            {/* Header */}

            <div>
                <div className="mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#19b5fe]" />

                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#19b5fe]">
                        Organization
                    </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#07111f] lg:text-3xl">
                    Organization Overview
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Review your organization identity,
                    regional configuration, branding,
                    terminology and platform features.
                </p>
            </div>

            {/* Organization Header */}

            <OrganizationHero
                organization={organization}
                branding={branding}
                membership={
                    currentTenant?.membership
                }
            />

            {/* Stats */}

            <OverviewStats
                organization={organization}
                membership={
                    currentTenant?.membership
                }
                enabledFeatures={
                    enabledFeatures
                }
                totalFeatures={
                    featureFlags.length
                }
                terminology={terminology}
            />

            {/* Identity + Regional */}

            <div className="grid gap-6 xl:grid-cols-2">

                <OrganizationIdentityCard
                    organization={organization}
                    branding={branding}
                />

                <RegionalSettingsCard
                    organization={organization}
                    settings={settings}
                />

            </div>

            {/* Branding */}

            <BrandingOverviewCard
                organization={organization}
                branding={branding}
            />

            {/* Feature Flags + Terminology */}

            <div className="grid gap-6 xl:grid-cols-2">

                <FeatureFlagsCard
                    featureFlags={featureFlags}
                />

                <TerminologyCard
                    terminology={terminology}
                />

            </div>

            {/* Tenant System Info */}

            <TenantInformationCard
                organization={organization}
                user={user}
            />

            {/* Refresh Indicator */}

            {loading && (
                <div className="fixed bottom-6 right-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-600 shadow-lg">
                    Refreshing organization...
                </div>
            )}

        </div>
    );
}

export default OrganizationOverviewPage;