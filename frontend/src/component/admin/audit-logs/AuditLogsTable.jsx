
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    History,
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

const ActionBadge = ({ action }) => {
    const styles = {
        created:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        viewed:
            "border-violet-200 bg-violet-50 text-violet-700",
        updated:
            "border-sky-200 bg-sky-50 text-sky-700",
        revealed:
            "border-purple-200 bg-purple-50 text-purple-700",
        shared:
            "border-cyan-200 bg-cyan-50 text-cyan-700",
        exported:
            "border-indigo-200 bg-indigo-50 text-indigo-700",
        archived:
            "border-amber-200 bg-amber-50 text-amber-700",
        restored:
            "border-teal-200 bg-teal-50 text-teal-700",
        deleted:
            "border-rose-200 bg-rose-50 text-rose-700",
        permanently_deleted:
            "border-red-200 bg-red-50 text-red-700",
    };

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                styles[action] ||
                "border-slate-200 bg-slate-50 text-slate-600"
            }`}
        >
            {formatValue(action)}
        </span>
    );
};

const ActorCell = ({
    actor,
}) => {
    if (!actor) {
        return (
            <span className="text-sm text-slate-400">
                System
            </span>
        );
    }

    return (
        <div className="min-w-[160px]">
            <p className="text-sm font-medium text-slate-800">
                {actor.name || "Unknown User"}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
                {actor.email || "—"}
            </p>
        </div>
    );
};

const AuditLogsTable = ({
     events,
    loading,
    detailsLoadingId,
    activityLoadingId,
    onOpen,
    onActivity,
    pagination,
    onPrevious,
    onNext,
}) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                    Audit Event Log
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    {pagination.total} audit events found
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Action
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Category
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Actor
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Target
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Request
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Occurred
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
                                    colSpan="7"
                                    className="px-5 py-16 text-center"
                                >
                                    <LoaderCircle
                                        size={24}
                                        className="mx-auto animate-spin text-[#19b5fe]"
                                    />

                                    <p className="mt-3 text-sm text-slate-500">
                                        Loading audit events...
                                    </p>
                                </td>
                            </tr>
                        ) : events.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="px-5 py-16 text-center"
                                >
                                    <p className="text-sm font-medium text-slate-700">
                                        No audit events found.
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Try changing the current filters.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr
                                    key={event.id}
                                    className="transition hover:bg-slate-50/70"
                                >
                                    <td className="max-w-[260px] px-5 py-4 align-top">
                                        <ActionBadge
                                            action={event.action}
                                        />

                                        {event.description && (
                                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                                                {event.description}
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 align-top">
                                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                                            {event.category || "—"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 align-top">
                                        <ActorCell
                                            actor={
                                                event.actor_snapshot
                                            }
                                        />
                                    </td>

                                    <td className="max-w-[260px] px-5 py-4 align-top">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {event.target_label ||
                                                "Unnamed Target"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {formatValue(
                                                event.target_type
                                            )}
                                        </p>

                                        {event.target_id && (
                                            <p
                                                className="mt-1 max-w-[220px] truncate font-mono text-[11px] text-slate-400"
                                                title={
                                                    event.target_id
                                                }
                                            >
                                                {event.target_id}
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 align-top">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] font-semibold text-slate-600">
                                                {event.request_method ||
                                                    "—"}
                                            </span>

                                            <span className="font-mono text-xs text-slate-500">
                                                {event.ip_address ||
                                                    "—"}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-slate-500">
                                        {formatDateTime(
                                            event.occurred_at
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-right align-top">
    <div className="flex justify-end gap-2">
        {event.target_type &&
            event.target_id && (
                <button
                    type="button"
                    onClick={() =>
                        onActivity(event)
                    }
                    disabled={
                        activityLoadingId ===
                        event.id
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {activityLoadingId ===
                    event.id ? (
                        <LoaderCircle
                            size={15}
                            className="animate-spin"
                        />
                    ) : (
                        <History size={15} />
                    )}

                    Activity
                </button>
            )}

        <button
            type="button"
            onClick={() =>
                onOpen(event)
            }
            disabled={
                detailsLoadingId ===
                event.id
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {detailsLoadingId ===
            event.id ? (
                <LoaderCircle
                    size={15}
                    className="animate-spin"
                />
            ) : (
                <Eye size={15} />
            )}

            View
        </button>
    </div>
</td>


                                </tr>
                            ))
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

export default AuditLogsTable;