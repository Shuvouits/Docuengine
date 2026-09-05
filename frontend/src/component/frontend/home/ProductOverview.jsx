import {
    ArrowRight,
    FileText,
    Boxes,
    KeyRound,
    BookOpen,
    ListChecks,
    Network,
    Plug,
    Share2,
} from "lucide-react";

const features = [
    {
        title: "Structured Docs",
        description:
            "Create consistent documentation your team actually follows.",
        action: "Explore docs",
        icon: FileText,
        visual: "docs",
    },
    {
        title: "Assets",
        description:
            "Track devices, vendors, and systems with structured information.",
        action: "Track assets",
        icon: Boxes,
        visual: "assets",
    },
    {
        title: "Passwords",
        description:
            "Store, share, and audit credentials with built-in access controls.",
        action: "Manage passwords",
        icon: KeyRound,
        visual: "passwords",
    },
    {
        title: "Knowledge Base",
        description:
            "Create searchable how-to guides for common tasks and fixes.",
        action: "Browse knowledge",
        icon: BookOpen,
        visual: "knowledge",
    },
    {
        title: "Checklists",
        description:
            "Turn recurring processes into repeatable, trackable workflows.",
        action: "Build workflows",
        icon: ListChecks,
        visual: "checklists",
    },
    {
        title: "IPAM",
        description:
            "Visualize networks, subnets, and IP usage in one place.",
        action: "View networks",
        icon: Network,
        visual: "ipam",
    },
    {
        title: "Integrations",
        description:
            "Connect existing tools so your data stays current everywhere.",
        action: "See integrations",
        icon: Plug,
        visual: "integrations",
    },
    {
        title: "Client Sharing",
        description:
            "Give clients limited access without exposing internal systems.",
        action: "Share with clients",
        icon: Share2,
        visual: "sharing",
    },
];

function FeatureVisual({ type }) {
    if (type === "docs") {
        return (
            <div className="relative h-full w-full">

                <div className="absolute left-5 top-10 h-32 w-24 -rotate-6 rounded-lg border border-violet-200 bg-white shadow-sm" />

                <div className="absolute left-12 top-7 h-36 w-28 rotate-[-2deg] rounded-lg border border-violet-200 bg-white shadow-md">
                    <div className="h-5 rounded-t-lg bg-[#21104d]" />
                    <div className="space-y-2 p-3">
                        <div className="h-2 w-16 rounded bg-violet-100" />
                        <div className="h-2 w-20 rounded bg-slate-100" />
                        <div className="h-8 rounded bg-violet-50" />
                        <div className="h-2 w-14 rounded bg-slate-100" />
                    </div>
                </div>

                <div className="absolute left-24 top-4 h-40 w-32 rounded-lg border border-violet-200 bg-white shadow-lg">
                    <div className="h-6 rounded-t-lg bg-[#2d1762]" />

                    <div className="space-y-3 p-4">
                        <div className="h-3 w-20 rounded bg-violet-100" />
                        <div className="h-2 w-full rounded bg-slate-100" />
                        <div className="h-2 w-4/5 rounded bg-slate-100" />

                        <div className="mt-3 h-14 rounded-md bg-violet-50">
                            <div className="p-3">
                                <div className="h-2 w-16 rounded bg-violet-200" />
                                <div className="mt-2 h-2 w-20 rounded bg-violet-100" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    if (type === "assets") {
        return (
            <div className="relative flex h-full items-center justify-center">

                <div className="w-[85%] rounded-xl border border-violet-200 bg-white p-4 shadow-lg">

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-semibold text-slate-700">
                            Computer Assets
                        </span>

                        <span className="rounded bg-violet-600 px-2 py-1 text-[8px] text-white">
                            + Add Field
                        </span>
                    </div>

                    <div className="mt-3 space-y-2">

                        {[
                            "Model",
                            "Warranty Expiration",
                            "Operating System",
                            "IP Address",
                        ].map((item) => (
                            <div
                                key={item}
                                className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
                            >
                                <div className="text-[7px] text-slate-400">
                                    {item}
                                </div>

                                <div className="mt-1 h-2 w-2/3 rounded bg-slate-200" />
                            </div>
                        ))}

                    </div>
                </div>

                <span className="absolute right-2 top-8 rounded bg-violet-600 px-2 py-1 text-[8px] font-medium text-white">
                    + Add Field
                </span>

            </div>
        );
    }

    if (type === "passwords") {
        return (
            <div className="flex h-full flex-col justify-center gap-3 px-5">

                {[
                    ["Username", "Service Account"],
                    ["Password", "••••••••••"],
                    ["One-time password", "••••••"],
                ].map(([label, value]) => (
                    <div key={label}>
                        <div className="mb-1 text-[9px] text-slate-500">
                            {label}
                        </div>

                        <div className="flex h-8 items-center rounded-md bg-violet-100/70 px-3 text-[9px] font-semibold text-slate-500">
                            {value}
                        </div>
                    </div>
                ))}

                <div className="flex justify-end gap-2 pt-1">
                    <span className="rounded border border-violet-200 px-3 py-1 text-[8px] text-violet-600">
                        Reveal
                    </span>

                    <span className="rounded border border-violet-200 px-3 py-1 text-[8px] text-violet-600">
                        Share
                    </span>
                </div>

            </div>
        );
    }

    if (type === "knowledge") {
        return (
            <div className="h-full p-4">

                <div className="h-full rounded-lg border border-violet-200 bg-white p-3">

                    <div className="text-[10px] font-semibold text-slate-700">
                        Device Setup Procedure
                    </div>

                    <div className="mt-3 rounded-lg bg-violet-50 p-3">

                        <div className="text-[8px] font-semibold text-slate-600">
                            Overview
                        </div>

                        <div className="mt-2 h-2 w-full rounded bg-violet-100" />
                        <div className="mt-2 h-2 w-2/3 rounded bg-violet-100" />

                        <div className="mt-5 text-[8px] font-semibold text-slate-600">
                            Screenshots
                        </div>

                        <div className="mt-2 flex gap-2">
                            <div className="h-10 flex-1 rounded bg-violet-100" />
                            <div className="h-10 w-10 rounded bg-violet-100" />
                        </div>

                        <div className="mt-5 text-[8px] font-semibold text-slate-600">
                            Troubleshooting Steps
                        </div>

                        <div className="mt-2 h-2 w-4/5 rounded bg-violet-100" />

                    </div>

                </div>

            </div>
        );
    }

    if (type === "checklists") {
        return (
            <div className="relative h-full">

                <div className="absolute left-8 top-8 w-36 rounded-lg border border-violet-200 bg-white p-3 shadow-md">
                    <div className="text-[8px] font-medium text-slate-500">
                        New Device Setup
                    </div>

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="mt-2 flex items-center gap-2"
                        >
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            <div className="h-2 flex-1 rounded bg-slate-100" />
                        </div>
                    ))}
                </div>

                <div className="absolute right-5 top-20 w-40 rounded-lg border border-violet-200 bg-white p-3 shadow-lg">
                    <div className="text-[8px] font-medium text-slate-500">
                        Vendor Onboarding
                    </div>

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="mt-2 h-2 rounded bg-violet-100"
                        />
                    ))}
                </div>

            </div>
        );
    }

    if (type === "ipam") {
        return (
            <div className="flex h-full items-center justify-center">

                <div className="relative h-36 w-52">

                    <div className="absolute left-0 top-1/2 h-px w-full bg-violet-300" />

                    <div className="absolute left-1/2 top-0 h-full w-px bg-violet-300" />

                    {[
                        "Server",
                        "Switch",
                        "Desktop",
                        "Mobile",
                    ].map((item, index) => (
                        <div
                            key={item}
                            className={`absolute rounded-lg border border-violet-200 bg-white px-2 py-1 text-[7px] shadow-sm ${
                                index === 0
                                    ? "left-1/2 top-0 -translate-x-1/2"
                                    : index === 1
                                      ? "right-0 top-1/2 -translate-y-1/2"
                                      : index === 2
                                        ? "bottom-0 left-1/2 -translate-x-1/2"
                                        : "left-0 top-1/2 -translate-y-1/2"
                            }`}
                        >
                            {item}
                        </div>
                    ))}

                </div>

            </div>
        );
    }

    if (type === "integrations") {
        return (
            <div className="flex h-full items-center justify-center">

                <div className="relative flex h-36 w-48 items-center justify-center">

                    <div className="absolute h-12 w-12 rounded-2xl bg-violet-600 shadow-lg" />

                    <div className="absolute left-2 top-5 h-9 w-9 rounded-xl border border-violet-200 bg-white shadow-sm" />
                    <div className="absolute right-2 top-5 h-9 w-9 rounded-xl border border-violet-200 bg-white shadow-sm" />
                    <div className="absolute bottom-3 left-1/2 h-9 w-9 -translate-x-1/2 rounded-xl border border-violet-200 bg-white shadow-sm" />

                    <div className="absolute left-10 top-9 h-px w-12 bg-violet-300" />
                    <div className="absolute right-10 top-9 h-px w-12 bg-violet-300" />
                    <div className="absolute left-1/2 top-[76px] h-8 w-px bg-violet-300" />

                </div>

            </div>
        );
    }

    return (
        <div className="flex h-full items-center justify-center p-5">

            <div className="w-full rounded-lg border border-violet-200 bg-white p-3 shadow-md">

                <div className="flex gap-2">

                    <div className="w-1/4 rounded bg-[#21104d]" />

                    <div className="flex-1">

                        <div className="h-4 rounded bg-violet-50" />

                        <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="h-8 rounded bg-violet-50" />
                            <div className="h-8 rounded bg-violet-50" />
                            <div className="h-8 rounded bg-violet-50" />
                        </div>

                        <div className="mt-2 h-8 rounded bg-violet-50" />

                    </div>

                </div>

            </div>

        </div>
    );
}

function ProductOverview() {
    return (
        <section className="relative overflow-hidden bg-white py-24 sm:py-28 lg:py-36">

            <div className="mx-auto max-w-[1550px] px-6 sm:px-10 lg:px-16 xl:px-20">

                {/* =========================================
                    SECTION HEADER
                ========================================== */}

                <div className="mx-auto max-w-3xl text-center">

                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                        Everything connected
                    </div>

                    <h2 className="text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
                        One place for everything
                        <span className="block text-violet-600">
                            your team needs.
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                        Organize documentation, assets, credentials,
                        processes and knowledge inside one connected
                        workspace built for modern teams.
                    </p>

                </div>


                {/* =========================================
                    FEATURE GRID
                ========================================== */}

                <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <article
                                key={feature.title}
                                className="group overflow-hidden rounded-[24px] border border-slate-200 bg-[#f8f9fc] transition-all duration-500 hover:-translate-y-1 hover:border-violet-200 hover:bg-[#fafaff] hover:shadow-[0_20px_50px_rgba(76,50,150,0.10)]"
                            >

                                {/* Text */}
                                <div className="p-7 pb-5">

                                    <div className="flex items-start justify-between">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 group-hover:bg-violet-600">
                                            <Icon
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-violet-600 transition-colors duration-300 group-hover:text-white"
                                            />
                                        </div>

                                    </div>

                                    <h3 className="mt-6 text-xl font-semibold tracking-[-0.025em] text-slate-950">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                                        {feature.description}
                                    </p>

                                    <a
                                        href="#"
                                        className="group/link mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-950"
                                    >
                                        {feature.action}

                                        <ArrowRight
                                            size={16}
                                            className="transition-transform duration-300 group-hover/link:translate-x-1"
                                        />
                                    </a>

                                </div>


                                {/* Visual */}
                                <div className="relative mt-3 h-[230px] overflow-hidden px-4 pb-4">

                                    <div className="h-full overflow-hidden rounded-[16px] border border-violet-100 bg-white/70">

                                        <FeatureVisual type={feature.visual} />

                                    </div>

                                </div>

                            </article>
                        );
                    })}

                </div>

            </div>

        </section>
    );
}

export default ProductOverview;