import {
    Building2,
    Palette,
} from "lucide-react";

import SectionCard from "./SectionCard";

function BrandingOverviewCard({
    organization,
    branding,
}) {
    const organizationName =
        branding?.display_name ||
        organization?.name ||
        "Organization";

    return (
        <SectionCard
            title="Organization Branding"
            description="Visual identity configured for this MSP"
            icon={Palette}
            noPadding
        >

            <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_1fr_1fr]">

                {/* Logo */}

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                    <p className="text-xs font-medium text-slate-500">
                        Organization Logo
                    </p>

                    <div className="mt-4 flex items-center gap-4">

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">

                            {branding?.logo_url ? (

                                <img
                                    src={
                                        branding.logo_url
                                    }
                                    alt={`${organizationName} logo`}
                                    className="h-full w-full object-contain p-2"
                                />

                            ) : (

                                <Building2
                                    size={24}
                                    className="text-slate-400"
                                />

                            )}

                        </div>

                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-900">
                                {organizationName}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Tenant branding asset
                            </p>

                        </div>

                    </div>

                </div>

                {/* Primary Color */}

                <BrandColor
                    label="Primary Color"
                    value={
                        branding?.primary_color
                    }
                />

                {/* Secondary Color */}

                <BrandColor
                    label="Secondary Color"
                    value={
                        branding?.secondary_color
                    }
                />

            </div>

        </SectionCard>
    );
}

/*
|--------------------------------------------------------------------------
| Brand Color
|--------------------------------------------------------------------------
*/

function BrandColor({
    label,
    value,
}) {
    return (
        <div className="rounded-2xl border border-slate-100 p-5">

            <p className="text-xs font-medium text-slate-500">
                {label}
            </p>

            <div className="mt-4 flex items-center gap-3">

                <div
                    className="h-12 w-12 shrink-0 rounded-xl border border-slate-200"
                    style={{
                        backgroundColor:
                            value ||
                            "#ffffff",
                    }}
                />

                <div>

                    <p className="text-sm font-semibold text-slate-900">
                        {value || "Not set"}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                        Brand color
                    </p>

                </div>

            </div>

        </div>
    );
}

export default BrandingOverviewCard;