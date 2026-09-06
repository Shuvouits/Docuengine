import {
    Building2,
    Clock3,
    Globe2,
    ShieldCheck,
} from "lucide-react";

function OrganizationHero({
    organization,
    branding,
    membership,
}) {
    const organizationName =
        branding?.display_name ||
        organization?.name ||
        "Organization";

    const organizationLogo =
        branding?.logo_url || null;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="relative overflow-hidden p-6 lg:p-7">

                {/* Decorative Background */}

                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#19b5fe]/5 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 right-24 h-64 w-64 rounded-full bg-[#7046f5]/5 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

                    {/* Organization */}

                    <div className="flex items-center gap-4">

                        {/* Logo */}

                        <div className="flex h-[74px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            {organizationLogo ? (

                                <img
                                    src={organizationLogo}
                                    alt={`${organizationName} logo`}
                                    className="h-full w-full object-contain p-2.5"
                                />

                            ) : (

                                <Building2
                                    size={30}
                                    strokeWidth={1.7}
                                    className="text-slate-400"
                                />

                            )}

                        </div>

                        {/* Identity */}

                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                                <h2 className="truncate text-xl font-bold text-slate-900 lg:text-2xl">
                                    {organizationName}
                                </h2>

                                <StatusBadge
                                    status={
                                        organization?.status
                                    }
                                />

                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                {organization?.name}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">

                                <MetaItem
                                    icon={Globe2}
                                    value={
                                        organization?.locale ||
                                        "Not set"
                                    }
                                />

                                <MetaItem
                                    icon={Clock3}
                                    value={
                                        organization?.timezone ||
                                        "Not set"
                                    }
                                />

                                <MetaItem
                                    icon={ShieldCheck}
                                    value={capitalize(
                                        membership?.role
                                    )}
                                />

                            </div>

                        </div>

                    </div>

                    {/* Tenant ID */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:min-w-[260px]">

                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Tenant ID
                        </p>

                        <p className="mt-1 break-all text-xs font-medium text-slate-600">
                            {organization?.id || "Not available"}
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

function StatusBadge({
    status,
}) {
    const value =
        String(status || "").toLowerCase();

    const active =
        value === "active";

    const suspended =
        value === "suspended";

    const inactive =
        value === "inactive";

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full px-2.5 py-1
                text-[10px] font-semibold

                ${
                    active
                        ? "bg-emerald-50 text-emerald-600"
                        : suspended
                        ? "bg-amber-50 text-amber-600"
                        : inactive
                        ? "bg-red-50 text-red-600"
                        : "bg-slate-100 text-slate-600"
                }
            `}
        >
            <span
                className={`
                    h-1.5 w-1.5 rounded-full

                    ${
                        active
                            ? "bg-emerald-500"
                            : suspended
                            ? "bg-amber-500"
                            : inactive
                            ? "bg-red-500"
                            : "bg-slate-400"
                    }
                `}
            />

            {capitalize(status)}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| Meta Item
|--------------------------------------------------------------------------
*/

function MetaItem({
    icon: Icon,
    value,
}) {
    return (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">

            <Icon
                size={13}
                strokeWidth={1.8}
            />

            <span>
                {value}
            </span>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

function capitalize(value) {
    if (!value) {
        return "Unknown";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

export default OrganizationHero;