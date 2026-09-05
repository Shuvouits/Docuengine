import {
    ArrowRight,
    BookOpen,
    Building2,
    FileText,
    KeyRound,
    Network,
    Settings2,
    ShieldCheck,
} from "lucide-react";

function ConnectedWorkspace() {
    return (
        <section className="relative overflow-hidden bg-white py-4 sm:py-8 lg:py-2">
            {/* Background Glow */}
            <div className="pointer-events-none absolute left-1/2 top-20 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#7046f5]/5 blur-3xl" />

            <div className="relative mx-auto max-w-[1550px] px-6 xl:px-10">
                {/* =========================================
                    SECTION HEADING
                ========================================== */}
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7046f5]/15 bg-[#7046f5]/5 px-4 py-2 text-sm font-medium text-[#7046f5]">
                        <Network size={16} />
                        Connected workspace
                    </div>

                    <h2 className="text-4xl font-bold tracking-[-0.04em] text-[#0d0224] sm:text-5xl lg:text-6xl">
                        Everything your team needs,
                        <span className="block text-[#7046f5]">
                            connected in one place.
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                        Keep documentation, assets, credentials, processes,
                        and company information connected, organized, and
                        easy to find.
                    </p>
                </div>

                {/* =========================================
                    WORKSPACE VISUAL
                ========================================== */}
                <div className="relative mx-auto mt-16 max-w-[1250px]">
                    {/* Soft outer glow */}
                    <div className="absolute inset-x-20 top-10 h-[420px] rounded-full bg-[#7046f5]/10 blur-3xl" />

                    {/* Main workspace */}
                    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[#f7f8fc] shadow-[0_30px_100px_rgba(13,2,36,0.10)]">

                        {/* Top bar */}
                        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-7">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7046f5] text-white">
                                    <Building2 size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-[#0d0224]">
                                        Acme Workspace
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        Company knowledge & operations
                                    </p>
                                </div>
                            </div>

                            <div className="hidden items-center gap-2 sm:flex">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-xs text-slate-500">
                                    All systems connected
                                </span>
                            </div>
                        </div>

                        {/* Workspace body */}
                        <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[210px_1fr]">

                            {/* Sidebar */}
                            <aside className="hidden border-r border-slate-200 bg-white p-5 lg:block">
                                <p className="mb-4 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    Workspace
                                </p>

                                <div className="space-y-1.5">
                                    <SidebarItem
                                        icon={Building2}
                                        label="Overview"
                                        active
                                    />

                                    <SidebarItem
                                        icon={FileText}
                                        label="Documents"
                                    />

                                    <SidebarItem
                                        icon={Settings2}
                                        label="Assets"
                                    />

                                    <SidebarItem
                                        icon={KeyRound}
                                        label="Passwords"
                                    />

                                    <SidebarItem
                                        icon={BookOpen}
                                        label="Knowledge"
                                    />
                                </div>

                                <div className="mt-8 border-t border-slate-100 pt-6">
                                    <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                        Connected
                                    </p>

                                    <div className="space-y-3 px-2">
                                        <ConnectionItem
                                            label="Documentation"
                                        />
                                        <ConnectionItem label="Assets" />
                                        <ConnectionItem label="Processes" />
                                    </div>
                                </div>
                            </aside>

                            {/* Main content */}
                            <div className="relative overflow-hidden p-5 sm:p-7 lg:p-10">

                                {/* Dashboard heading */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-[#7046f5]">
                                            COMPANY
                                        </p>

                                        <h3 className="mt-1 text-xl font-bold tracking-tight text-[#0d0224] sm:text-2xl">
                                            Operations Hub
                                        </h3>

                                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                            A connected view of your team's
                                            essential information.
                                        </p>
                                    </div>

                                    <button className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#7046f5]/30 hover:text-[#7046f5] sm:block">
                                        View workspace
                                    </button>
                                </div>

                                {/* Connected cards */}
                                <div className="relative mt-8 grid gap-4 sm:grid-cols-2">

                                    {/* Documents */}
                                    <WorkspaceCard
                                        icon={FileText}
                                        title="Documentation"
                                        description="Structured company docs and procedures."
                                        meta="24 documents"
                                    />

                                    {/* Assets */}
                                    <WorkspaceCard
                                        icon={Settings2}
                                        title="Assets"
                                        description="Track devices, systems, and resources."
                                        meta="86 assets"
                                    />

                                    {/* Knowledge */}
                                    <WorkspaceCard
                                        icon={BookOpen}
                                        title="Knowledge Base"
                                        description="Searchable guides and internal knowledge."
                                        meta="142 articles"
                                    />

                                    {/* Passwords */}
                                    <WorkspaceCard
                                        icon={KeyRound}
                                        title="Credentials"
                                        description="Secure access to important services."
                                        meta="38 credentials"
                                    />
                                </div>

                                {/* Connection line decoration */}
                                <div className="pointer-events-none absolute bottom-8 right-8 hidden h-36 w-52 lg:block">
                                    <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-[#7046f5]/30 to-transparent" />

                                    <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#7046f5]/20 to-transparent" />

                                    <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7046f5] shadow-[0_0_0_6px_rgba(112,70,245,0.08)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =========================================
                        FLOATING CONNECTION CARDS
                    ========================================== */}

                    {/* Left floating card */}
                    <div className="absolute -left-5 top-[34%] hidden w-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(13,2,36,0.10)] xl:block">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-[#7046f5]">
                                <Network size={19} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[#0d0224]">
                                    Connected
                                </p>
                                <p className="text-xs text-slate-400">
                                    6 modules linked
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full w-[82%] rounded-full bg-[#7046f5]" />
                        </div>
                    </div>

                    {/* Right floating card */}
                    <div className="absolute -right-5 bottom-[15%] hidden w-60 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(13,2,36,0.10)] xl:block">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <ShieldCheck size={19} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[#0d0224]">
                                    Secure by design
                                </p>
                                <p className="text-xs text-slate-400">
                                    Access controlled
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-emerald-100" />
                            <span className="text-[10px] font-semibold text-emerald-600">
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* =========================================
                    BOTTOM CTA
                ========================================== */}
                <div className="mt-14 flex justify-center">
                    <a
                        href="/platform"
                        className="group inline-flex items-center gap-2 rounded-full bg-[#0d0224] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0d0224]/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#7046f5]"
                    >
                        Explore the workspace
                        <ArrowRight
                            size={17}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </a>
                </div>
            </div>
        </section>
    );
}

/* =========================================
   SIDEBAR ITEM
========================================= */

function SidebarItem({ icon: Icon, label, active = false }) {
    return (
        <div
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                    ? "bg-[#7046f5]/8 text-[#7046f5]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0d0224]"
            }`}
        >
            <Icon size={16} />
            {label}
        </div>
    );
}

/* =========================================
   CONNECTION ITEM
========================================= */

function ConnectionItem({ label }) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7046f5]" />

            <span className="text-xs text-slate-500">
                {label}
            </span>
        </div>
    );
}

/* =========================================
   WORKSPACE CARD
========================================= */

function WorkspaceCard({
    icon: Icon,
    title,
    description,
    meta,
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#7046f5]/25 hover:shadow-[0_15px_40px_rgba(112,70,245,0.08)]">
            {/* Hover glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#7046f5]/5 blur-2xl transition duration-300 group-hover:bg-[#7046f5]/10" />

            <div className="relative">
                <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7046f5]/7 text-[#7046f5]">
                        <Icon size={19} strokeWidth={1.8} />
                    </div>

                    <ArrowRight
                        size={16}
                        className="text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-[#7046f5]"
                    />
                </div>

                <h4 className="mt-5 text-sm font-semibold text-[#0d0224]">
                    {title}
                </h4>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                    {description}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-medium text-slate-400">
                        {meta}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ConnectedWorkspace;