import {
    ArrowRight,
    BookOpen,
    Building2,
    FileText,
    Link2,
    Network,
    ShieldCheck,
} from "lucide-react";

const connectedItems = [
    {
        icon: FileText,
        title: "Documentation",
        description: "Keep your most important technical knowledge structured and easy to find.",
    },
    {
        icon: Building2,
        title: "Companies",
        description: "Give every client their own organized workspace and context.",
    },
    {
        icon: Network,
        title: "Assets",
        description: "Connect hardware, software, vendors, sites and operational records.",
    },
    {
        icon: BookOpen,
        title: "Knowledge Base",
        description: "Turn repeatable knowledge into reusable documentation your team can trust.",
    },
];

function ConnectedWorkspaceSection() {
    return (
        <section className="relative overflow-hidden bg-white py-24 sm:py-28 lg:py-32">
            {/* Soft background glow */}
            <div className="pointer-events-none absolute left-1/2 top-20 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-violet-100/40 blur-3xl" />

            <div className="relative mx-auto max-w-[1550px] px-6 sm:px-8 lg:px-12 xl:px-16">
                
                {/* Heading */}
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
                        <Link2 size={16} />
                        Connected documentation
                    </div>

                    <h2 className="text-4xl font-bold tracking-[-0.04em] text-[#10052f] sm:text-5xl lg:text-[56px] lg:leading-[1.08]">
                        Everything your team needs,
                        <span className="block text-violet-600">
                            connected in one place.
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                        Bring documentation, assets, companies, knowledge and
                        operational processes together so your team always has
                        the right context at the right time.
                    </p>
                </div>

                {/* Main visual */}
                <div className="relative mx-auto mt-16 max-w-[1250px]">
                    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[#f8f9fc] p-5 shadow-[0_30px_100px_rgba(37,20,84,0.10)] sm:p-8 lg:p-10">
                        
                        {/* Top bar */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                                    <ShieldCheck size={20} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-[#10052f]">
                                        Docuengaine Workspace
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Connected documentation
                                    </p>
                                </div>
                            </div>

                            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 sm:flex">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-medium text-slate-600">
                                    All systems connected
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr_1fr] lg:items-center">

                            {/* Left cards */}
                            <div className="space-y-4">
                                <ConnectionCard
                                    icon={Building2}
                                    title="Companies"
                                    subtitle="Client workspaces"
                                />

                                <ConnectionCard
                                    icon={FileText}
                                    title="Documentation"
                                    subtitle="Articles & records"
                                />
                            </div>

                            {/* Center */}
                            <div className="relative flex min-h-[310px] items-center justify-center">
                                
                                {/* Connection lines */}
                                <div className="absolute hidden h-px w-full bg-gradient-to-r from-transparent via-violet-300 to-transparent lg:block" />

                                <div className="absolute hidden h-full w-px bg-gradient-to-b from-transparent via-violet-300 to-transparent lg:block" />

                                {/* Outer circle */}
                                <div className="absolute h-[260px] w-[260px] rounded-full border border-violet-200 bg-violet-50/50" />

                                <div className="absolute h-[190px] w-[190px] rounded-full border border-violet-200 bg-white shadow-[0_20px_60px_rgba(112,70,245,0.12)]" />

                                {/* Core */}
                                <div className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-3xl bg-[#10052f] text-white shadow-[0_20px_60px_rgba(16,5,47,0.25)]">
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500">
                                        <Link2 size={21} />
                                    </div>

                                    <span className="text-sm font-semibold">
                                        Docuengaine
                                    </span>
                                </div>

                                {/* Floating nodes */}
                                <div className="absolute left-5 top-7 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-lg lg:block">
                                    <FileText className="text-violet-600" size={18} />
                                </div>

                                <div className="absolute right-5 top-7 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-lg lg:block">
                                    <Building2 className="text-violet-600" size={18} />
                                </div>

                                <div className="absolute bottom-7 left-5 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-lg lg:block">
                                    <Network className="text-violet-600" size={18} />
                                </div>

                                <div className="absolute bottom-7 right-5 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-lg lg:block">
                                    <BookOpen className="text-violet-600" size={18} />
                                </div>
                            </div>

                            {/* Right cards */}
                            <div className="space-y-4">
                                <ConnectionCard
                                    icon={Network}
                                    title="Assets"
                                    subtitle="Hardware & systems"
                                />

                                <ConnectionCard
                                    icon={BookOpen}
                                    title="Knowledge Base"
                                    subtitle="Reusable knowledge"
                                />
                            </div>
                        </div>

                        {/* Bottom status */}
                        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-violet-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-[#10052f]">
                                    One connected source of truth
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Move between related information without losing context.
                                </p>
                            </div>

                            <button className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:gap-3">
                                Explore the platform
                                <ArrowRight size={17} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feature mini cards */}
                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {connectedItems.map((item) => (
                        <div
                            key={item.title}
                            className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_20px_50px_rgba(37,20,84,0.08)]"
                        >
                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                                <item.icon size={20} />
                            </div>

                            <h3 className="text-base font-semibold text-[#10052f]">
                                {item.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ConnectionCard({ icon: Icon, title, subtitle }) {
    return (
        <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_15px_40px_rgba(112,70,245,0.10)]">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                    <Icon size={21} />
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-[#10052f]">
                        {title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* connection dot */}
            <span className="absolute -right-1.5 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-violet-500 lg:block" />
        </div>
    );
}

export default ConnectedWorkspaceSection;