import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    FileText,
    FolderOpen,
    Search,
    Sparkles,
} from "lucide-react";

function KnowledgeBaseSection() {
    return (
        <section className="relative overflow-hidden bg-[#f7f5ff] py-24 sm:py-28 lg:py-32">

            {/* Background decoration */}
            <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-violet-200/40 blur-3xl" />

            <div className="pointer-events-none absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-indigo-200/30 blur-3xl" />

            <div className="relative mx-auto max-w-[1550px] px-6 sm:px-8 lg:px-12 xl:px-16">

                <div className="grid items-center gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">

                    {/* =====================================================
                        LEFT CONTENT
                    ====================================================== */}

                    <div className="max-w-[600px]">

                        {/* Eyebrow */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
                            <BookOpen size={16} />
                            Knowledge base
                        </div>

                        {/* Heading */}
                        <h2 className="text-4xl font-bold leading-[1.08] tracking-[-0.045em] text-[#10052f] sm:text-5xl lg:text-[58px]">
                            Turn knowledge into
                            <span className="block text-violet-600">
                                something useful.
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="mt-7 max-w-[560px] text-lg leading-8 text-slate-600">
                            Capture the knowledge your team already has and turn
                            it into structured, searchable documentation that
                            everyone can use.
                        </p>

                        {/* Benefits */}
                        <div className="mt-9 space-y-5">

                            <Benefit
                                title="Find information faster"
                                description="Search across your documentation and get to the information you need without digging through folders."
                            />

                            <Benefit
                                title="Create reusable knowledge"
                                description="Turn recurring procedures, guides and technical information into resources your whole team can use."
                            />

                            <Benefit
                                title="Keep documentation current"
                                description="Make updates visible and keep important operational knowledge from becoming outdated."
                            />

                        </div>

                        {/* CTA */}
                        <a
                            href="/knowledge-base"
                            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-[#10052f] px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-violet-600"
                        >
                            Explore knowledge base

                            <ArrowRight
                                size={17}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </a>

                    </div>


                    {/* =====================================================
                        RIGHT PRODUCT UI
                    ====================================================== */}

                    <div className="relative">

                        {/* Glow */}
                        <div className="absolute inset-8 rounded-[40px] bg-violet-300/30 blur-3xl" />

                        {/* Main application */}
                        <div className="relative overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-[0_30px_90px_-25px_rgba(70,45,140,0.25)]">

                            {/* Browser bar */}
                            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                                </div>

                                <div className="hidden text-[11px] font-medium text-slate-400 sm:block">
                                    app.docuengaine.com
                                </div>

                                <div className="h-6 w-6 rounded-full bg-violet-100" />

                            </div>


                            {/* Application */}
                            <div className="grid min-h-[500px] grid-cols-1 sm:grid-cols-[190px_1fr]">

                                {/* Sidebar */}
                                <aside className="hidden border-r border-slate-200 bg-[#fbfaff] p-5 sm:block">

                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
                                            <BookOpen size={16} />
                                        </div>

                                        <span className="text-xs font-bold text-[#10052f]">
                                            Knowledge
                                        </span>
                                    </div>

                                    <div className="mt-8">

                                        <p className="px-2 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                            Collections
                                        </p>

                                        <div className="mt-3 space-y-1">

                                            <SidebarLink
                                                icon={FolderOpen}
                                                label="Getting Started"
                                                active
                                            />

                                            <SidebarLink
                                                icon={FolderOpen}
                                                label="Networking"
                                            />

                                            <SidebarLink
                                                icon={FolderOpen}
                                                label="Security"
                                            />

                                            <SidebarLink
                                                icon={FolderOpen}
                                                label="Procedures"
                                            />

                                            <SidebarLink
                                                icon={FolderOpen}
                                                label="Troubleshooting"
                                            />

                                        </div>

                                    </div>

                                </aside>


                                {/* Main */}
                                <main className="bg-white p-5 sm:p-7 lg:p-8">

                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4">

                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet-600">
                                                Knowledge Base
                                            </p>

                                            <h3 className="mt-1 text-xl font-bold tracking-tight text-[#10052f] sm:text-2xl">
                                                Getting Started
                                            </h3>

                                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                                Everything your team needs to get up and running.
                                            </p>
                                        </div>

                                        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-violet-200 hover:text-violet-600">
                                            <Sparkles size={16} />
                                        </button>

                                    </div>


                                    {/* Search */}
                                    <div className="relative mt-7">

                                        <Search
                                            size={16}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4">
                                            <div className="flex h-full items-center text-xs text-slate-400">
                                                Search documentation...
                                            </div>
                                        </div>

                                        <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[9px] text-slate-400 sm:block">
                                            ⌘ K
                                        </div>

                                    </div>


                                    {/* Articles */}
                                    <div className="mt-7">

                                        <div className="mb-3 flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-[#10052f]">
                                                Popular articles
                                            </h4>

                                            <span className="text-[10px] font-medium text-violet-600">
                                                View all
                                            </span>
                                        </div>


                                        <div className="space-y-2.5">

                                            <Article
                                                title="Setting up a new client"
                                                category="Getting Started"
                                            />

                                            <Article
                                                title="Network documentation guidelines"
                                                category="Networking"
                                            />

                                            <Article
                                                title="Password management procedure"
                                                category="Security"
                                            />

                                            <Article
                                                title="Employee onboarding checklist"
                                                category="Procedures"
                                            />

                                            <Article
                                                title="Common troubleshooting steps"
                                                category="Troubleshooting"
                                            />

                                        </div>

                                    </div>


                                    {/* Bottom stats */}
                                    <div className="mt-6 grid grid-cols-2 gap-3">

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-xl font-bold text-[#10052f]">
                                                142
                                            </p>

                                            <p className="mt-1 text-[10px] text-slate-500">
                                                Published articles
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-xl font-bold text-[#10052f]">
                                                98%
                                            </p>

                                            <p className="mt-1 text-[10px] text-slate-500">
                                                Documentation health
                                            </p>
                                        </div>

                                    </div>

                                </main>

                            </div>

                        </div>


                        {/* Floating Search Card */}
                        <div className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-violet-100 bg-white p-4 shadow-[0_20px_50px_rgba(60,35,130,0.15)] sm:block lg:-left-8">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                    <Search size={18} />
                                </div>

                                <div>
                                    <p className="text-[11px] font-medium text-slate-400">
                                        Search
                                    </p>

                                    <p className="text-sm font-bold text-[#10052f]">
                                        Find anything instantly
                                    </p>
                                </div>

                            </div>

                        </div>


                        {/* Floating Updated Card */}
                        <div className="absolute -right-4 top-[25%] hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(60,35,130,0.12)] xl:block">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 size={17} />
                                </div>

                                <div>
                                    <p className="text-[10px] text-slate-400">
                                        Documentation
                                    </p>

                                    <p className="text-xs font-bold text-[#10052f]">
                                        Up to date
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


/* =========================================================
   BENEFIT
========================================================= */

function Benefit({ title, description }) {
    return (
        <div className="flex gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <CheckCircle2 size={15} />
            </div>

            <div>
                <h3 className="text-sm font-semibold text-[#10052f]">
                    {title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}


/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({ icon: Icon, label, active = false }) {
    return (
        <div
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[11px] font-medium transition ${
                active
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-500 hover:bg-slate-100 hover:text-[#10052f]"
            }`}
        >
            <Icon size={14} />
            {label}
        </div>
    );
}


/* =========================================================
   ARTICLE
========================================================= */

function Article({ title, category }) {
    return (
        <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition hover:border-violet-200 hover:bg-violet-50/40">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <FileText size={15} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">
                    {title}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                    {category}
                </p>
            </div>

            <ArrowRight
                size={14}
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-600"
            />

        </div>
    );
}

export default KnowledgeBaseSection;