import {
    ChevronLeft,
    ChevronRight,
    Eye,
    LoaderCircle,
} from "lucide-react";

const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
};

const formatValue = (value) => {
    if (!value) {
        return "—";
    }

    return String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
};

const MuseumTable = ({
    entries,
    loading,
    detailsLoadingId,
    onOpen,
    pagination,
    onPrevious,
    onNext,
}) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                    Archived Resources
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    {pagination.total} archived resources found
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Resource
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Type
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Archived By
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Reason
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Archived At
                            </th>

                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Details
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-5 py-16 text-center"
                                >
                                    <LoaderCircle
                                        size={24}
                                        className="mx-auto animate-spin text-[#19b5fe]"
                                    />

                                    <p className="mt-3 text-sm text-slate-500">
                                        Loading archived resources...
                                    </p>
                                </td>
                            </tr>
                        ) : entries.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-5 py-16 text-center"
                                >
                                    <p className="text-sm font-medium text-slate-700">
                                        No archived resources found.
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Deleted resources will appear here when archived.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => {

                               const archivedBy =
    entry.actor_snapshot ||
    entry.archived_by_snapshot ||
    entry.archived_by ||
    null;

                                return (
                                    <tr
                                        key={entry.id}
                                        className="transition hover:bg-slate-50/70"
                                    >
                                        <td className="max-w-[280px] px-5 py-4 align-top">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {entry.resource_label ||
                                                    "Unnamed Resource"}
                                            </p>

                                            <p
                                                className="mt-1 max-w-[240px] truncate font-mono text-[11px] text-slate-400"
                                                title={entry.resource_id}
                                            >
                                                {entry.resource_id || "—"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 align-top">
                                            <span className="inline-flex rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                {formatValue(
                                                    entry.resource_type
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 align-top">
                                            {archivedBy ? (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">
                                                        {archivedBy.name ||
                                                            "Unknown User"}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {archivedBy.email || "—"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">
                                                    System
                                                </span>
                                            )}
                                        </td>

                                        <td className="max-w-[260px] px-5 py-4 align-top">
                                            <p className="line-clamp-2 text-sm text-slate-600">
                                                {entry.reason ||
                                                    "No reason provided"}
                                            </p>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-slate-500">
                                            {formatDateTime(
                                                entry.archived_at
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-right align-top">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onOpen(entry)
                                                }
                                                disabled={
                                                    detailsLoadingId ===
                                                    entry.id
                                                }
                                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {detailsLoadingId ===
                                                entry.id ? (
                                                    <LoaderCircle
                                                        size={15}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Eye size={15} />
                                                )}

                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {!loading &&
                pagination.total > 0 && (
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                            Page{" "}
                            <span className="font-semibold text-slate-700">
                                {pagination.currentPage}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-700">
                                {pagination.lastPage}
                            </span>
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onPrevious}
                                disabled={
                                    pagination.currentPage <= 1
                                }
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>

                            <button
                                type="button"
                                onClick={onNext}
                                disabled={
                                    pagination.currentPage >=
                                    pagination.lastPage
                                }
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default MuseumTable;