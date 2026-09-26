import {
    Archive,
    Building2,
    Edit3,
    ExternalLink,
    MapPin,
    MoreHorizontal,
    RotateCcw,
} from "lucide-react";

const statusStyles = {
    active:
        "border-emerald-200 bg-emerald-50 text-emerald-700",

    inactive:
        "border-slate-200 bg-slate-100 text-slate-600",

    archived:
        "border-amber-200 bg-amber-50 text-amber-700",
};

const formatLocation = (company) => {
    return [
        company?.address?.city,
        company?.address?.state_region,
        company?.address?.country,
    ]
        .filter(Boolean)
        .join(", ");
};

const CompaniesTable = ({
    companies = [],
    loading = false,

    canUpdate = false,
    canArchive = false,
    canRestore = false,

    onOpen,
    onEdit,
    onArchive,
    onRestore,
}) => {
    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#19b5fe]" />

                <p className="mt-3 text-sm text-slate-500">
                    Loading companies...
                </p>
            </div>
        );
    }

    if (!companies.length) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <Building2 size={21} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-800">
                    No companies found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    Try changing the search or status filter.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                            <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                Company
                            </th>

                            <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                Contact
                            </th>

                            <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                Location
                            </th>

                            <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                Status
                            </th>

                            <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {companies.map((company) => {
                            const location =
                                formatLocation(
                                    company
                                );

                            const isArchived =
                                company.status ===
                                "archived";

                            return (
                                <tr
                                    key={company.id}
                                    className="transition hover:bg-slate-50/70"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#159edb]">
                                                <Building2
                                                    size={18}
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onOpen(
                                                            company
                                                        )
                                                    }
                                                    className="block max-w-[280px] truncate text-left text-sm font-semibold text-slate-800 transition hover:text-[#159edb]"
                                                >
                                                    {
                                                        company.name
                                                    }
                                                </button>

                                                <div className="mt-1 text-xs text-slate-400">
                                                    {company.legal_name ||
                                                        company.slug}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="text-sm font-medium text-slate-700">
                                            {company
                                                ?.contact
                                                ?.name ||
                                                "Not added"}
                                        </div>

                                        <div className="mt-1 max-w-[230px] truncate text-xs text-slate-400">
                                            {company
                                                ?.contact
                                                ?.email ||
                                                company
                                                    ?.contact
                                                    ?.phone ||
                                                "No contact details"}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <MapPin
                                                size={14}
                                                className="text-slate-400"
                                            />

                                            <span>
                                                {location ||
                                                    "Not specified"}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                                                statusStyles[
                                                    company
                                                        .status
                                                ] ||
                                                statusStyles.inactive
                                            }`}
                                        >
                                            {
                                                company.status
                                            }
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onOpen(
                                                        company
                                                    )
                                                }
                                                title="Open Company"
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#19b5fe]/40 hover:text-[#159edb]"
                                            >
                                                <ExternalLink
                                                    size={15}
                                                />
                                            </button>

                                            {!isArchived &&
                                                canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onEdit(
                                                                company
                                                            )
                                                        }
                                                        title="Edit Company"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#19b5fe]/40 hover:text-[#159edb]"
                                                    >
                                                        <Edit3
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    </button>
                                                )}

                                            {!isArchived &&
                                                canArchive && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onArchive(
                                                                company
                                                            )
                                                        }
                                                        title="Archive Company"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <Archive
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    </button>
                                                )}

                                            {isArchived &&
                                                canRestore && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onRestore(
                                                                company
                                                            )
                                                        }
                                                        title="Restore Company"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-600 transition hover:bg-emerald-50"
                                                    >
                                                        <RotateCcw
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompaniesTable;