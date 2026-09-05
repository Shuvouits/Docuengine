import {
    Building2,
    Users,
    FileText,
    ShieldCheck,
    ArrowUpRight,
    Plus,
    Activity,
    CheckCircle2,
    Clock3,
} from "lucide-react";

import StatCard from "../../component/admin/StartCard";

function DashboardPage() {

    /*
    |--------------------------------------------------------------------------
    | STATIC DASHBOARD DATA
    |--------------------------------------------------------------------------
    | Later these values will come from Laravel APIs.
    |--------------------------------------------------------------------------
    */

    const stats = [
        {
            title: "Total Tenants",
            value: "24",
            change: "+12.5%",
            description: "from last month",
            icon: Building2,
        },
        {
            title: "Active Users",
            value: "186",
            change: "+8.2%",
            description: "from last month",
            icon: Users,
        },
        {
            title: "Documentation",
            value: "1,284",
            change: "+18.4%",
            description: "from last month",
            icon: FileText,
        },
        {
            title: "Security Score",
            value: "94%",
            change: "+4.6%",
            description: "from last month",
            icon: ShieldCheck,
        },
    ];


    const recentActivity = [
        {
            title: "New tenant created",
            description: "Acme Corporation joined the platform",
            time: "12 minutes ago",
            type: "tenant",
        },
        {
            title: "Documentation updated",
            description: "Network Infrastructure documentation was updated",
            time: "38 minutes ago",
            type: "documentation",
        },
        {
            title: "New user invited",
            description: "John Smith was invited to Acme Corporation",
            time: "1 hour ago",
            type: "user",
        },
        {
            title: "Security policy updated",
            description: "Workspace security settings were updated",
            time: "2 hours ago",
            type: "security",
        },
    ];


    const tenants = [
        {
            name: "Acme Corporation",
            users: 32,
            documents: 248,
            status: "Active",
            initials: "AC",
        },
        {
            name: "Northstar IT",
            users: 24,
            documents: 184,
            status: "Active",
            initials: "NI",
        },
        {
            name: "Vertex Solutions",
            users: 18,
            documents: 126,
            status: "Active",
            initials: "VS",
        },
        {
            name: "BluePeak Systems",
            users: 12,
            documents: 94,
            status: "Pending",
            initials: "BS",
        },
    ];


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
                        Welcome back, Admin
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Here’s what’s happening across your DocuEngine platform.
                    </p>
                </div>


                {/* Quick Action */}

                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7046f5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7046f5]/20 transition hover:bg-[#825cf7]"
                >
                    <Plus size={18} />

                    Add tenant
                </button>

            </div>


            {/* =====================================================
                STATISTICS
            ====================================================== */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {stats.map((stat) => (
                    <StatCard
                        key={stat.title}
                        {...stat}
                    />
                ))}

            </div>


            {/* =====================================================
                MAIN GRID
            ====================================================== */}

            <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">


                {/* =================================================
                    TENANTS
                ================================================== */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                    {/* Section Header */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Recent tenants
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Organizations currently using the platform.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#7046f5] transition hover:text-[#5f38df]"
                        >
                            View all

                            <ArrowUpRight size={14} />
                        </button>

                    </div>


                    {/* Tenant List */}

                    <div className="divide-y divide-slate-100">

                        {tenants.map((tenant) => (
                            <div
                                key={tenant.name}
                                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                            >

                                <div className="flex min-w-0 items-center gap-3">

                                    {/* Avatar */}

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe]/15 to-[#7c3aed]/15 text-xs font-bold text-[#7046f5]">
                                        {tenant.initials}
                                    </div>


                                    <div className="min-w-0">

                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {tenant.name}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {tenant.users} users · {tenant.documents} documents
                                        </p>

                                    </div>

                                </div>


                                {/* Status */}

                                <div className="shrink-0">

                                    <span
                                        className={`
                                            inline-flex items-center gap-1.5
                                            rounded-full px-2.5 py-1
                                            text-[10px] font-semibold
                                            ${
                                                tenant.status === "Active"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-amber-50 text-amber-600"
                                            }
                                        `}
                                    >
                                        <span
                                            className={`
                                                h-1.5 w-1.5 rounded-full
                                                ${
                                                    tenant.status === "Active"
                                                        ? "bg-emerald-500"
                                                        : "bg-amber-500"
                                                }
                                            `}
                                        />

                                        {tenant.status}
                                    </span>

                                </div>

                            </div>
                        ))}

                    </div>

                </section>


                {/* =================================================
                    RECENT ACTIVITY
                ================================================== */}

                <section className="rounded-2xl border border-slate-200 bg-white">

                    {/* Header */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Recent activity
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Latest platform events.
                            </p>
                        </div>

                        <Activity
                            size={18}
                            className="text-[#7046f5]"
                        />

                    </div>


                    {/* Activity */}

                    <div className="px-6">

                        {recentActivity.map((activity, index) => (

                            <div
                                key={activity.title}
                                className={`
                                    relative flex gap-3 py-5
                                    ${
                                        index !== recentActivity.length - 1
                                            ? "border-b border-slate-100"
                                            : ""
                                    }
                                `}
                            >

                                {/* Icon */}

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">

                                    {activity.type === "tenant" && (
                                        <Building2
                                            size={16}
                                            className="text-[#19b5fe]"
                                        />
                                    )}

                                    {activity.type === "documentation" && (
                                        <FileText
                                            size={16}
                                            className="text-[#7046f5]"
                                        />
                                    )}

                                    {activity.type === "user" && (
                                        <Users
                                            size={16}
                                            className="text-emerald-500"
                                        />
                                    )}

                                    {activity.type === "security" && (
                                        <ShieldCheck
                                            size={16}
                                            className="text-amber-500"
                                        />
                                    )}

                                </div>


                                {/* Content */}

                                <div className="min-w-0 flex-1">

                                    <p className="text-sm font-semibold text-slate-900">
                                        {activity.title}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {activity.description}
                                    </p>

                                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">

                                        <Clock3 size={11} />

                                        {activity.time}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </section>

            </div>


            {/* =====================================================
                PLATFORM HEALTH
            ====================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                    <div>
                        <div className="flex items-center gap-2">

                            <CheckCircle2
                                size={19}
                                className="text-emerald-500"
                            />

                            <h2 className="text-base font-bold text-slate-900">
                                Platform health
                            </h2>

                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                            Your platform is operating normally.
                        </p>
                    </div>


                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">

                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        All systems operational

                    </span>

                </div>


                {/* Health Bars */}

                <div className="mt-6 grid gap-5 md:grid-cols-3">

                    <div>
                        <div className="mb-2 flex justify-between text-xs">

                            <span className="font-medium text-slate-600">
                                API Services
                            </span>

                            <span className="font-semibold text-slate-900">
                                99.9%
                            </span>

                        </div>

                        <div className="h-2 rounded-full bg-slate-100">
                            <div className="h-full w-[99%] rounded-full bg-emerald-500" />
                        </div>
                    </div>


                    <div>
                        <div className="mb-2 flex justify-between text-xs">

                            <span className="font-medium text-slate-600">
                                Database
                            </span>

                            <span className="font-semibold text-slate-900">
                                99.8%
                            </span>

                        </div>

                        <div className="h-2 rounded-full bg-slate-100">
                            <div className="h-full w-[98%] rounded-full bg-[#19b5fe]" />
                        </div>
                    </div>


                    <div>
                        <div className="mb-2 flex justify-between text-xs">

                            <span className="font-medium text-slate-600">
                                Security
                            </span>

                            <span className="font-semibold text-slate-900">
                                94%
                            </span>

                        </div>

                        <div className="h-2 rounded-full bg-slate-100">
                            <div className="h-full w-[94%] rounded-full bg-[#7046f5]" />
                        </div>
                    </div>

                </div>

            </section>

        </div>
    );
}

export default DashboardPage;