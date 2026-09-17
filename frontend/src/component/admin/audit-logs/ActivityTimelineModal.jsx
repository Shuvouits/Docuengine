import {
    Activity,
    CalendarClock,
    LoaderCircle,
    User,
    X,
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
        return "Unknown";
    }

    return String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
};

const ActivityTimelineModal = ({
    open,
    loading = false,
    events = [],
    target = null,
    onClose,
}) => {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
            <div className="flex max-h-[calc(100vh-32px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#19b5fe]">
                            <Activity size={21} />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Activity Timeline
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {target?.label ||
                                    "Resource activity history"}
                            </p>

                            {target?.type && (
                                <p className="mt-1 text-xs text-slate-400">
                                    {formatValue(
                                        target.type
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center">
                            <div className="text-center">
                                <LoaderCircle
                                    size={28}
                                    className="mx-auto animate-spin text-[#19b5fe]"
                                />

                                <p className="mt-3 text-sm text-slate-500">
                                    Loading activity history...
                                </p>
                            </div>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="py-16 text-center">
                            <Activity
                                size={30}
                                className="mx-auto text-slate-300"
                            />

                            <p className="mt-4 text-sm font-semibold text-slate-700">
                                No activity history found.
                            </p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute bottom-4 left-[15px] top-4 w-px bg-slate-200" />

                            <div className="space-y-5">
                                {events.map(
                                    (event, index) => {
                                        const actor =
                                            event.actor_snapshot ||
                                            null;

                                        return (
                                            <div
                                                key={event.id}
                                                className="relative flex gap-4"
                                            >
                                                <div className="relative z-10 mt-1 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#19b5fe] shadow-sm">
                                                    <span className="h-2 w-2 rounded-full bg-white" />
                                                </div>

                                                <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                                                                    {formatValue(
                                                                        event.action
                                                                    )}
                                                                </span>

                                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                                    {formatValue(
                                                                        event.category
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <p className="mt-3 text-sm font-semibold text-slate-900">
                                                                {event.description ||
                                                                    "Activity recorded"}
                                                            </p>
                                                        </div>

                                                        <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
                                                            <CalendarClock
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            {formatDateTime(
                                                                event.occurred_at
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                                                        <div className="flex items-start gap-2">
                                                            <User
                                                                size={
                                                                    15
                                                                }
                                                                className="mt-0.5 text-slate-400"
                                                            />

                                                            <div>
                                                                <p className="text-xs font-semibold text-slate-700">
                                                                    {actor?.name ||
                                                                        "System"}
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-slate-400">
                                                                    {actor?.email ||
                                                                        "System event"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-slate-400">
                                                                Request
                                                            </p>

                                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                                <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] font-semibold text-slate-600">
                                                                    {event.request_method ||
                                                                        "—"}
                                                                </span>

                                                                <span className="font-mono text-xs text-slate-500">
                                                                    {event.ip_address ||
                                                                        "—"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {event.changes && (
                                                        <div className="mt-4">
                                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                Changes
                                                            </p>

                                                            <pre className="max-h-48 overflow-auto rounded-xl bg-[#07111f] p-3 text-xs leading-5 text-slate-200">
                                                                {JSON.stringify(
                                                                    event.changes,
                                                                    null,
                                                                    2
                                                                )}
                                                            </pre>
                                                        </div>
                                                    )}

                                                    {index ===
                                                        0 && (
                                                        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#19b5fe]">
                                                            Latest
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivityTimelineModal;