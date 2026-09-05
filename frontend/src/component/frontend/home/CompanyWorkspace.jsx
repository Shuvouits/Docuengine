import {
    Building2,
    MapPin,
    Users,
    FileText,
    Server,
    ShieldCheck,
    ArrowUpRight,
    CheckCircle2,
} from "lucide-react";

function CompanyWorkspace() {
    return (
        <section className="relative overflow-hidden bg-white py-24 sm:py-28 lg:py-32">

            {/* Background Decoration */}
            <div className="pointer-events-none absolute left-[-180px] top-[20%] h-[420px] w-[420px] rounded-full bg-violet-100/60 blur-3xl" />
            <div className="pointer-events-none absolute right-[-180px] bottom-[5%] h-[420px] w-[420px] rounded-full bg-indigo-100/50 blur-3xl" />

            <div className="relative mx-auto max-w-[1550px] px-6 sm:px-8 lg:px-12">

                <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">

                    {/* =====================================================
                        LEFT CONTENT
                    ====================================================== */}
                    <div className="max-w-[620px]">

                        {/* Eyebrow */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                            <Building2 size={16} />
                            One workspace for every client
                        </div>

                        {/* Heading */}
                        <h2 className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-[#10051f] sm:text-5xl lg:text-[58px]">
                            Keep every client,
                            <span className="block text-violet-600">
                                perfectly organized.
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="mt-7 max-w-[570px] text-lg leading-8 text-slate-600">
                            Give your team a dedicated workspace for every company
                            you manage. Keep locations, contacts, documentation,
                            assets and activity connected without losing control
                            of your data.
                        </p>

                        {/* Feature List */}
                        <div className="mt-9 space-y-4">

                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                                    <CheckCircle2 size={15} />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-[#10051f]">
                                        Isolated company workspaces
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Keep each client environment organized and
                                        permission-aware.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                                    <CheckCircle2 size={15} />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-[#10051f]">
                                        Everything connected
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Locations, contacts, assets and documentation
                                        stay connected in one place.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                                    <CheckCircle2 size={15} />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-[#10051f]">
                                        Permission-aware access
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Your team only sees the companies and records
                                        they are authorized to access.
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* CTA */}
                        <a
                            href="/platform"
                            className="group mt-10 inline-flex items-center gap-2 font-semibold text-[#10051f] transition hover:text-violet-600"
                        >
                            Explore company workspaces

                            <ArrowUpRight
                                size={18}
                                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                        </a>

                    </div>


                    {/* =====================================================
                        RIGHT DASHBOARD MOCKUP
                    ====================================================== */}
                    <div className="relative">

                        {/* Glow */}
                        <div className="absolute inset-10 rounded-[40px] bg-violet-200/40 blur-3xl" />

                        {/* Main Card */}
                        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_-30px_rgba(45,20,90,0.25)]">

                            {/* Top Bar */}
                            <div className="flex items-center justify-between border-b border-slate-200 bg-[#fbfaff] px-5 py-4 sm:px-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
                                        <Building2 size={18} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-[#10051f]">
                                            Acme Corporation
                                        </p>

                                        <p className="text-[11px] text-slate-500">
                                            Client workspace
                                        </p>
                                    </div>

                                </div>

                                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active
                                </div>

                            </div>


                            {/* Dashboard Body */}
                            <div className="grid min-h-[440px] grid-cols-1 sm:grid-cols-[190px_1fr]">

                                {/* Sidebar */}
                                <div className="hidden border-r border-slate-200 bg-[#faf9ff] p-4 sm:block">

                                    <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                        Workspace
                                    </div>

                                    <div className="space-y-1.5">

                                        <div className="flex items-center gap-2.5 rounded-xl bg-violet-100 px-3 py-2.5 text-xs font-semibold text-violet-700">
                                            <Building2 size={15} />
                                            Overview
                                        </div>

                                        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-slate-500">
                                            <MapPin size={15} />
                                            Locations
                                        </div>

                                        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-slate-500">
                                            <Users size={15} />
                                            Contacts
                                        </div>

                                        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-slate-500">
                                            <FileText size={15} />
                                            Documentation
                                        </div>

                                        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-slate-500">
                                            <Server size={15} />
                                            Assets
                                        </div>

                                    </div>

                                </div>


                                {/* Main Dashboard */}
                                <div className="bg-white p-5 sm:p-7">

                                    {/* Header */}
                                    <div className="flex items-start justify-between">

                                        <div>
                                            <p className="text-xs font-medium text-slate-400">
                                                COMPANY OVERVIEW
                                            </p>

                                            <h3 className="mt-1 text-xl font-bold tracking-tight text-[#10051f]">
                                                Acme Corporation
                                            </h3>
                                        </div>

                                        <button className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-violet-200 hover:text-violet-600">
                                            <ArrowUpRight size={17} />
                                        </button>

                                    </div>


                                    {/* Stats */}
                                    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                                <FileText size={16} />
                                            </div>

                                            <p className="mt-4 text-2xl font-bold text-[#10051f]">
                                                248
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Documents
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                                <Server size={16} />
                                            </div>

                                            <p className="mt-4 text-2xl font-bold text-[#10051f]">
                                                84
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Assets
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                                <ShieldCheck size={16} />
                                            </div>

                                            <p className="mt-4 text-2xl font-bold text-[#10051f]">
                                                98%
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Health
                                            </p>
                                        </div>

                                    </div>


                                    {/* Activity */}
                                    <div className="mt-6 rounded-2xl border border-slate-200 p-5">

                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-[#10051f]">
                                                Recent activity
                                            </h4>

                                            <span className="text-xs font-medium text-violet-600">
                                                View all
                                            </span>
                                        </div>

                                        <div className="mt-5 space-y-4">

                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                                    <FileText size={14} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-slate-700">
                                                        Updated Network Documentation
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                                        8 minutes ago
                                                    </p>
                                                </div>

                                                <CheckCircle2
                                                    size={15}
                                                    className="text-emerald-500"
                                                />
                                            </div>


                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                                    <Server size={14} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-slate-700">
                                                        New Asset Added
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                                        24 minutes ago
                                                    </p>
                                                </div>

                                                <CheckCircle2
                                                    size={15}
                                                    className="text-emerald-500"
                                                />
                                            </div>


                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                                    <Users size={14} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-slate-700">
                                                        Contact information updated
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                                        1 hour ago
                                                    </p>
                                                </div>

                                                <CheckCircle2
                                                    size={15}
                                                    className="text-emerald-500"
                                                />
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* Floating Card */}
                        <div className="absolute -bottom-7 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block lg:-left-8">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <ShieldCheck size={19} />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-500">
                                        Access controlled
                                    </p>

                                    <p className="mt-0.5 text-sm font-bold text-[#10051f]">
                                        Permission-aware
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}

export default CompanyWorkspace;