import {
    Archive,
    FilePenLine,
    ListChecks,
    Settings2,
} from "lucide-react";

function OptionListsTable({
    optionLists = [],
    canManage = false,
    onEdit = () => {},
    onArchive = () => {},
    onManageItems = () => {},
}) {
    if (!optionLists.length) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                        color:
                            "var(--brand-primary)",
                        backgroundColor:
                            "color-mix(in srgb, var(--brand-primary) 9%, white)",
                    }}
                >
                    <ListChecks size={21} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    No option lists found
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                    Create a reusable list of options
                    for select and multi-select fields.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="border-b border-slate-200 bg-slate-50/70">
                        <tr>
                            <TableHeader>
                                Option List
                            </TableHeader>

                            <TableHeader>
                                Status
                            </TableHeader>

                            <TableHeader>
                                Options
                            </TableHeader>

                            <TableHeader align="right">
                                Actions
                            </TableHeader>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {optionLists.map(
                            (optionList) => (
                                <tr
                                    key={
                                        optionList.id
                                    }
                                    className="transition hover:bg-slate-50/70"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                                style={{
                                                    color:
                                                        "var(--brand-primary)",
                                                    backgroundColor:
                                                        "color-mix(in srgb, var(--brand-primary) 8%, white)",
                                                }}
                                            >
                                                <ListChecks
                                                    size={
                                                        17
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {
                                                        optionList.name
                                                    }
                                                </p>

                                                <p className="mt-1 text-[11px] font-medium text-slate-400">
                                                    {
                                                        optionList.slug
                                                    }
                                                </p>

                                                {optionList.description && (
                                                    <p className="mt-1 max-w-[520px] truncate text-xs text-slate-500">
                                                        {
                                                            optionList.description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        {optionList.is_active !==
                                        false ? (
                                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                                Inactive
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-slate-700">
                                            {optionList.items_count ??
                                                0}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onManageItems(
                                                        optionList
                                                    )
                                                }
                                                className="
                                                    inline-flex h-9
                                                    items-center gap-1.5
                                                    rounded-xl border
                                                    border-slate-200
                                                    bg-white px-3
                                                    text-xs font-semibold
                                                    text-slate-700
                                                    shadow-sm transition
                                                    hover:bg-slate-50
                                                "
                                            >
                                                <Settings2
                                                    size={
                                                        14
                                                    }
                                                />

                                                Options
                                            </button>

                                            {canManage && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onEdit(
                                                                optionList
                                                            )
                                                        }
                                                        className="
                                                            inline-flex h-9
                                                            items-center gap-1.5
                                                            rounded-xl border
                                                            border-slate-200
                                                            bg-white px-3
                                                            text-xs font-semibold
                                                            text-slate-700
                                                            shadow-sm transition
                                                            hover:bg-slate-50
                                                        "
                                                    >
                                                        <FilePenLine
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onArchive(
                                                                optionList
                                                            )
                                                        }
                                                        className="
                                                            inline-flex h-9
                                                            items-center gap-1.5
                                                            rounded-xl border
                                                            border-amber-200
                                                            bg-white px-3
                                                            text-xs font-semibold
                                                            text-amber-700
                                                            shadow-sm transition
                                                            hover:bg-amber-50
                                                        "
                                                    >
                                                        <Archive
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        Archive
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TableHeader({
    children,
    align = "left",
}) {
    return (
        <th
            className={`
                px-6 py-3.5
                text-[10px] font-semibold
                uppercase tracking-[0.12em]
                text-slate-400
                ${
                    align === "right"
                        ? "text-right"
                        : "text-left"
                }
            `}
        >
            {children}
        </th>
    );
}

export default OptionListsTable;