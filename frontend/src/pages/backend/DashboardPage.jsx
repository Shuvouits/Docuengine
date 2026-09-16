import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
    Activity,
    AlertCircle,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Flag,
    Globe2,
    Languages,
    LoaderCircle,
    Palette,
    Plus,
    Settings2,
    ShieldCheck,
} from "lucide-react";

import api from "../../api/axios";
import TenantWorkspaceDashboard from "../../component/admin/dashboard/TenantWorkspaceDashboard";

function DashboardPage({
    authData = null,
    authLoading = false,
}) {
    const navigate = useNavigate();

    /*
    |--------------------------------------------------------------------------
    | Authenticated User
    |--------------------------------------------------------------------------
    */

    const user = authData?.user || null;

    const currentTenant =
        authData?.current_tenant || null;

    const isPlatformOwner =
        Boolean(user?.is_platform_owner);

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [tenants, setTenants] = useState([]);

    const [configuration, setConfiguration] =
        useState(null);

    const [dashboardLoading, setDashboardLoading] =
        useState(false);

    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Load Dashboard Data
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (authLoading || !authData) {
            return;
        }

        const loadDashboard = async () => {
            setDashboardLoading(true);
            setError("");

            try {
                /*
                |--------------------------------------------------------------------------
                | Platform Owner
                |--------------------------------------------------------------------------
                */

                if (isPlatformOwner) {
                    const response =
                        await api.get("/tenants");

                    const payload =
                        response.data?.data;

                    let tenantRows = [];

                    if (Array.isArray(payload)) {
                        tenantRows = payload;
                    } else if (
                        Array.isArray(payload?.data)
                    ) {
                        tenantRows = payload.data;
                    }

                    setTenants(tenantRows);

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | Tenant Administrator
                |--------------------------------------------------------------------------
                */

                if (currentTenant?.id) {
                    const response =
                        await api.get(
                            `/tenants/${currentTenant.id}/configuration`
                        );

                    setConfiguration(
                        response.data?.data || null
                    );
                }
            } catch (error) {
                console.error(
                    "Dashboard loading failed:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                        "Unable to load dashboard data."
                );
            } finally {
                setDashboardLoading(false);
            }
        };

        loadDashboard();
    }, [
        authData,
        authLoading,
        currentTenant?.id,
        isPlatformOwner,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Platform Statistics
    |--------------------------------------------------------------------------
    */

    const platformStats = useMemo(() => {
        const statuses = {
            active: 0,
            suspended: 0,
            archived: 0,
            inactive: 0,
        };

        tenants.forEach((tenant) => {
            const status =
                String(
                    tenant?.status || ""
                ).toLowerCase();

            if (
                Object.prototype.hasOwnProperty.call(
                    statuses,
                    status
                )
            ) {
                statuses[status] += 1;
            }
        });

        return {
            total: tenants.length,
            ...statuses,
        };
    }, [tenants]);

    /*
    |--------------------------------------------------------------------------
    | Tenant Configuration
    |--------------------------------------------------------------------------
    */

    const tenant =
        configuration || currentTenant || null;

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

    const enabledFeatures =
        featureFlags.filter(
            (feature) => Boolean(feature?.enabled)
        ).length;

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const formatStatus = (status) => {
        if (!status) {
            return "Unknown";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    };

    const statusClasses = (status) => {
        switch (
            String(status || "").toLowerCase()
        ) {
            case "active":
                return "bg-emerald-50 text-emerald-700";

            case "suspended":
                return "bg-amber-50 text-amber-700";

            case "archived":
                return "bg-slate-100 text-slate-600";

            case "inactive":
                return "bg-red-50 text-red-600";

            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    const statusDotClasses = (status) => {
        switch (
            String(status || "").toLowerCase()
        ) {
            case "active":
                return "bg-emerald-500";

            case "suspended":
                return "bg-amber-500";

            case "archived":
                return "bg-slate-400";

            case "inactive":
                return "bg-red-500";

            default:
                return "bg-slate-400";
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return "Not available";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (authLoading) {
        return <DashboardLoader />;
    }

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                <div className="flex items-start gap-3">

                    <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-500"
                    />

                    <div>
                        <h2 className="font-semibold text-red-700">
                            Dashboard unavailable
                        </h2>

                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>
                    </div>

                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Platform Owner Dashboard
    |--------------------------------------------------------------------------
    */

    if (isPlatformOwner) {
        return (
            <div className="space-y-8">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                    <div>

                        <div className="mb-2 flex items-center gap-2">

                            <span className="h-2 w-2 rounded-full bg-[#19b5fe]" />

                            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#19b5fe]">
                                Platform Overview
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-[#07111f] lg:text-3xl">
                            Welcome back,{" "}
                            {user?.name || "Platform Owner"}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Live overview of the MSP organizations currently registered in DocuEngine.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/tenants/create"
                            )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7046f5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7046f5]/20 transition hover:bg-[#825cf7]"
                    >
                        <Plus size={18} />

                        Add MSP
                    </button>

                </div>

                {/* =====================================================
                    PLATFORM STATISTICS
                ====================================================== */}

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    <MetricCard
                        title="Total MSPs"
                        value={platformStats.total}
                        description="Registered organizations"
                        icon={Building2}
                    />

                    <MetricCard
                        title="Active MSPs"
                        value={platformStats.active}
                        description="Currently active"
                        icon={CheckCircle2}
                    />

                    <MetricCard
                        title="Suspended"
                        value={platformStats.suspended}
                        description="Temporarily restricted"
                        icon={ShieldCheck}
                    />

                    <MetricCard
                        title="Archived"
                        value={platformStats.archived}
                        description="Archived organizations"
                        icon={Activity}
                    />

                </div>

                {/* =====================================================
                    MSP ORGANIZATIONS
                ====================================================== */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">

                        <div>

                            <h2 className="text-base font-bold text-slate-900">
                                MSP Organizations
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Live tenant data from the DocuEngine platform.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/tenants"
                                )
                            }
                            className="text-xs font-semibold text-[#7046f5] transition hover:text-[#5f38df]"
                        >
                            Manage organizations
                        </button>

                    </div>

                    {dashboardLoading ? (

                        <div className="flex items-center justify-center p-12">
                            <LoaderCircle
                                size={26}
                                className="animate-spin text-[#19b5fe]"
                            />
                        </div>

                    ) : tenants.length ? (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead>

                                    <tr className="border-b border-slate-100 bg-slate-50/70">

                                        <TableHead>
                                            Organization
                                        </TableHead>

                                        <TableHead>
                                            Status
                                        </TableHead>

                                        <TableHead>
                                            Locale
                                        </TableHead>

                                        <TableHead>
                                            Timezone
                                        </TableHead>

                                        <TableHead>
                                            Created
                                        </TableHead>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {tenants
                                        .slice(0, 8)
                                        .map((tenant) => (

                                            <tr
                                                key={tenant.id}
                                                className="transition hover:bg-slate-50"
                                            >

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-xs font-bold text-[#19b5fe]">

                                                            {(
                                                                tenant.name ||
                                                                "MSP"
                                                            )
                                                                .slice(
                                                                    0,
                                                                    2
                                                                )
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {tenant.name}
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {tenant.slug}
                                                            </p>

                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses(
                                                            tenant.status
                                                        )}`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${statusDotClasses(
                                                                tenant.status
                                                            )}`}
                                                        />

                                                        {formatStatus(
                                                            tenant.status
                                                        )}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {tenant.locale ||
                                                        "—"}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {tenant.timezone ||
                                                        "—"}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {formatDate(
                                                        tenant.created_at
                                                    )}
                                                </td>

                                            </tr>
                                        ))}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <EmptyState
                            title="No MSP organizations found"
                            description="Create the first MSP organization to start using the platform."
                        />

                    )}

                </section>

                {/* =====================================================
                    MODULE 1 FOUNDATION
                ====================================================== */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6">

                    <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                            <ShieldCheck
                                size={20}
                                className="text-emerald-600"
                            />
                        </div>

                        <div>

                            <h2 className="font-bold text-slate-900">
                                Multi-tenant foundation active
                            </h2>

                            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                                Tenant lifecycle, tenant isolation,
                                platform administration,
                                organization configuration,
                                branding and feature controls are
                                available in the current Module 1
                                platform.
                            </p>

                        </div>

                    </div>

                </section>

            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Administrator Dashboard
    |--------------------------------------------------------------------------
    */

    return (

          <TenantWorkspaceDashboard
        authData={authData}
        user={user}
        tenant={tenant}
        currentTenant={currentTenant}
    />


    );
}

/*
|--------------------------------------------------------------------------
| Metric Card
|--------------------------------------------------------------------------
*/

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    compact = false,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe]/10 to-[#7046f5]/10">

                    <Icon
                        size={20}
                        className="text-[#7046f5]"
                    />

                </div>

            </div>

            <p className="mt-5 text-xs font-medium text-slate-500">
                {title}
            </p>

            <p
                className={`mt-1 font-bold text-[#07111f] ${
                    compact
                        ? "text-lg"
                        : "text-2xl"
                }`}
            >
                {value}
            </p>

            <p className="mt-2 text-xs text-slate-400">
                {description}
            </p>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Information Section
|--------------------------------------------------------------------------
*/

function InfoSection({
    title,
    description,
    icon: Icon,
    children,
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white">

            <SectionHeader
                title={title}
                description={description}
                icon={Icon}
            />

            <div className="px-6 py-2">
                {children}
            </div>

        </section>
    );
}

/*
|--------------------------------------------------------------------------
| Section Header
|--------------------------------------------------------------------------
*/

function SectionHeader({
    title,
    description,
    icon: Icon,
}) {
    return (
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10">

                <Icon
                    size={17}
                    className="text-[#19b5fe]"
                />

            </div>

            <div>

                <h2 className="text-sm font-bold text-slate-900">
                    {title}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                    {description}
                </p>

            </div>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Information Row
|--------------------------------------------------------------------------
*/

function InfoRow({
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between gap-6 border-b border-slate-100 py-3.5 last:border-0">

            <span className="text-xs text-slate-500">
                {label}
            </span>

            <span className="max-w-[65%] truncate text-right text-xs font-semibold text-slate-800">
                {value || "Not set"}
            </span>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Color Card
|--------------------------------------------------------------------------
*/

function ColorCard({
    label,
    color,
}) {
    return (
        <div className="rounded-2xl border border-slate-100 p-4">

            <p className="text-xs text-slate-500">
                {label}
            </p>

            <div className="mt-3 flex items-center gap-3">

                <div
                    className="h-9 w-9 rounded-xl border border-slate-200"
                    style={{
                        backgroundColor:
                            color || "#ffffff",
                    }}
                />

                <span className="text-sm font-semibold text-slate-800">
                    {color || "Not set"}
                </span>

            </div>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Table Header
|--------------------------------------------------------------------------
*/

function TableHead({ children }) {
    return (
        <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {children}
        </th>
    );
}

/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

function EmptyState({
    title,
    description,
}) {
    return (
        <div className="px-6 py-14 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">

                <Building2
                    size={20}
                    className="text-slate-400"
                />

            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
                {title}
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                {description}
            </p>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Dashboard Loader
|--------------------------------------------------------------------------
*/

function DashboardLoader() {
    return (
        <div className="flex min-h-[450px] items-center justify-center">

            <div className="text-center">

                <LoaderCircle
                    size={30}
                    className="mx-auto animate-spin text-[#19b5fe]"
                />

                <p className="mt-3 text-sm text-slate-500">
                    Loading dashboard...
                </p>

            </div>

        </div>
    );
}

export default DashboardPage;