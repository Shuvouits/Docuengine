import {
    ChevronLeft,
    ChevronRight,
    Eye,
    LoaderCircle,
} from "lucide-react";

const formatDateTime = (
    value
) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
};

const formatEventType = (
    value
) => {
    if (!value) {
        return "Unknown Event";
    }

    return value
        .replaceAll("_", " ")
        .replaceAll(".", " · ");
};

const SeverityBadge = ({
    severity,
}) => {
    const styles = {
        info: "border-sky-200 bg-sky-50 text-sky-700",
        warning:
            "border-amber-200 bg-amber-50 text-amber-700",
        critical:
            "border-red-200 bg-red-50 text-red-700",
    };

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                styles[severity] ||
                "border-slate-200 bg-slate-50 text-slate-600"
            }`}
        >
            {severity || "unknown"}
        </span>
    );
};

const UserCell = ({
    user,
    fallback = "System",
}) => {
    if (!user) {
        return (
            <span className="text-sm text-slate-400">
                {fallback}
            </span>
        );
    }

    return (
        <div>
            <p className="text-sm font-medium text-slate-800">
                {user.name || "Unnamed User"}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
                {user.email || "—"}
            </p>
        </div>
    );
};

const SecurityEventsTable = ({
    events,
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
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Event Log
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {pagination.total} security events found
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Event
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Category
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Severity
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Actor
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Subject
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                IP Address
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Occurred
                            </th>

                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="px-5 py-16 text-center"
                                >
                                    <LoaderCircle
                                        size={24}
                                        className="mx-auto animate-spin text-[#19b5fe]"
                                    />

                                    <p className="mt-3 text-sm text-slate-500">
                                        Loading security events...
                                    </p>
                                </td>
                            </tr>
                        ) : events.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="px-5 py-16 text-center"
                                >
                                    <p className="text-sm font-medium text-slate-700">
                                        No security events found.
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
                                    <td className="max-w-[280px] px-5 py-4 align-top">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {formatEventType(
                                                event.event_type
                                            )}
                                        </p>

                                        {event.description && (
                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
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
                                        <SeverityBadge
                                            severity={event.severity}
                                        />
                                    </td>

                                    <td className="px-5 py-4 align-top">
                                        <UserCell
                                            user={event.actor}
                                        />
                                    </td>

                                    <td className="px-5 py-4 align-top">
                                        <UserCell
                                            user={event.subject}
                                            fallback="—"
                                        />
                                    </td>

                                    <td className="px-5 py-4 align-top">
                                        <span className="font-mono text-xs text-slate-600">
                                            {event.ip_address || "—"}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-slate-500">
                                        {formatDateTime(
                                            event.occurred_at
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-right align-top">
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
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && pagination.total > 0 && (
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

export default SecurityEventsTable;