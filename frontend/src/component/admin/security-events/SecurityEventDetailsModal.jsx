import {
    CalendarClock,
    Globe2,
    Monitor,
    Shield,
    User,
    X,
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
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                styles[severity] ||
                "border-slate-200 bg-slate-50 text-slate-600"
            }`}
        >
            {severity || "unknown"}
        </span>
    );
};

const UserBlock = ({
    title,
    user,
    emptyText,
}) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {title}
            </p>

            {user ? (
                <>
                    <p className="text-sm font-semibold text-slate-900">
                        {user.name || "Unnamed User"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        {user.email || "—"}
                    </p>
                </>
            ) : (
                <p className="text-sm text-slate-500">
                    {emptyText}
                </p>
            )}
        </div>
    );
};

const SecurityEventDetailsModal = ({
    event,
    open,
    onClose,
}) => {
    if (!open || !event) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
            <div className="flex max-h-[calc(100vh-32px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div className="pr-6">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <SeverityBadge
                                severity={event.severity}
                            />

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                                {event.category || "Unknown Category"}
                            </span>
                        </div>

                        <h2 className="text-xl font-semibold text-slate-900">
                            {event.event_type || "Security Event"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Detailed security event information
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                    <div className="space-y-6">
                        {event.description && (
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                                    Description
                                </h3>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                    {event.description}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <UserBlock
                                title="Actor"
                                user={event.actor}
                                emptyText="System generated event"
                            />

                            <UserBlock
                                title="Subject"
                                user={event.subject}
                                emptyText="No subject user"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                        <Globe2 size={17} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            IP Address
                                        </p>

                                        <p className="mt-1 break-all font-mono text-sm text-slate-700">
                                            {event.ip_address || "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                        <CalendarClock size={17} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Occurred At
                                        </p>

                                        <p className="mt-1 text-sm text-slate-700">
                                            {formatDateTime(
                                                event.occurred_at
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                    <Monitor size={17} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        User Agent
                                    </p>

                                    <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                                        {event.user_agent || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 p-4">
                                <div className="flex items-start gap-3">
                                    <User
                                        size={17}
                                        className="mt-0.5 text-slate-400"
                                    />

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Actor User ID
                                        </p>

                                        <p className="mt-1 break-all font-mono text-xs text-slate-600">
                                            {event.actor_user_id || "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 p-4">
                                <div className="flex items-start gap-3">
                                    <Shield
                                        size={17}
                                        className="mt-0.5 text-slate-400"
                                    />

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Event ID
                                        </p>

                                        <p className="mt-1 break-all font-mono text-xs text-slate-600">
                                            {event.id || "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-slate-900">
                                Metadata
                            </h3>

                            <pre className="max-h-72 overflow-auto rounded-xl bg-[#07111f] p-4 text-xs leading-6 text-slate-200">
                                {event.metadata
                                    ? JSON.stringify(
                                          event.metadata,
                                          null,
                                          2
                                      )
                                    : "No metadata recorded."}
                            </pre>
                        </div>
                    </div>
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

export default SecurityEventDetailsModal;