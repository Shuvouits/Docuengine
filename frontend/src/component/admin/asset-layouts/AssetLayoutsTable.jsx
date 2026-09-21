import {
    Archive,
    ChevronRight,
    FileText,
    Layers3,
    MoreHorizontal,
} from "lucide-react";

function AssetLayoutsTable({
    layouts = [],
    loading = false,
    onOpen = () => {},
}) {
    if (loading) {
        return (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="divide-y divide-slate-100">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="flex animate-pulse items-center gap-4 px-6 py-5"
                        >
                            <div className="h-11 w-11 rounded-xl bg-slate-100" />

                            <div className="flex-1">
                                <div className="h-3.5 w-44 rounded bg-slate-100" />
                                <div className="mt-2 h-3 w-64 rounded bg-slate-100" />
                            </div>

                            <div className="h-8 w-20 rounded-lg bg-slate-100" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!layouts.length) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Layers3
                        size={24}
                        className="text-slate-500"
                    />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                    No asset layouts yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Asset layouts define how managed devices and other documented
                    assets are structured inside your workspace.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                Layout
                            </th>

                            <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                Status
                            </th>

                            <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                Sections
                            </th>

                            <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                Fields
                            </th>

                            <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                Version
                            </th>

                            <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                Type
                            </th>

                            <th className="w-[90px] px-6 py-4" />
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {layouts.map((layout) => (
                            <tr
                                key={layout.id}
                                onClick={() => onOpen(layout)}
                                className="group cursor-pointer transition hover:bg-slate-50/80"
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                            style={{
                                                backgroundColor:
                                                    "color-mix(in srgb, var(--brand-primary) 10%, white)",
                                                color: "var(--brand-primary)",
                                            }}
                                        >
                                            <Layers3
                                                size={20}
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {layout.name}
                                                </p>

                                                {layout.is_template && (
                                                    <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
                                                        Template
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 max-w-[420px] truncate text-xs text-slate-500">
                                                {layout.description ||
                                                    "No description provided."}
                                            </p>

                                            <p className="mt-1 text-[10px] text-slate-400">
                                                {layout.slug}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-5 py-5">
                                    <span
                                        className={`
                                            inline-flex items-center rounded-full
                                            px-2.5 py-1 text-[11px] font-semibold capitalize
                                            ${
                                                layout.status === "published"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : layout.status === "archived"
                                                      ? "bg-slate-100 text-slate-600"
                                                      : "bg-amber-50 text-amber-700"
                                            }
                                        `}
                                    >
                                        {layout.status || "draft"}
                                    </span>
                                </td>

                                <td className="px-5 py-5 text-center">
                                    <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                        <Archive
                                            size={14}
                                            className="text-slate-400"
                                        />
                                        {layout.sections_count ?? 0}
                                    </div>
                                </td>

                                <td className="px-5 py-5 text-center">
                                    <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                        <FileText
                                            size={14}
                                            className="text-slate-400"
                                        />
                                        {layout.fields_count ?? 0}
                                    </div>
                                </td>

                                <td className="px-5 py-5 text-center">
                                    <span className="inline-flex min-w-[42px] justify-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                        v{layout.current_version ?? 1}
                                    </span>
                                </td>

                                <td className="px-5 py-5">
                                    <span className="text-xs font-medium text-slate-600">
                                        {layout.is_template
                                            ? "Reusable Template"
                                            : "Custom Layout"}
                                    </span>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                            }}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        >
                                            <MoreHorizontal size={17} />
                                        </button>

                                        <ChevronRight
                                            size={17}
                                            className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AssetLayoutsTable;