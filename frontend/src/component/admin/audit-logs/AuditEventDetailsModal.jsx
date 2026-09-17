import {
    CalendarClock,
    Globe2,
    Monitor,
    Route,
    Target,
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
        return "—";
    }

    return String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
};

const InfoCard = ({
    icon: Icon,
    label,
    children,
}) => {
    return (
        <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Icon size={17} />
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {label}
                    </p>

                    <div className="mt-1 text-sm text-slate-700">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AuditEventDetailsModal = ({
    event,
    open,
    onClose,
}) => {
    if (!open || !event) {
        return null;
    }

    const actor =
        event.actor_snapshot || null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
            <div className="flex max-h-[calc(100vh-32px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div className="pr-6">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                                {formatValue(
                                    event.action
                                )}
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                                {event.category ||
                                    "Unknown Category"}
                            </span>
                        </div>

                        <h2 className="text-xl font-semibold text-slate-900">
                            {event.target_label ||
                                "Audit Event"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Complete audit event information
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
                            <InfoCard
                                icon={User}
                                label="Actor"
                            >
                                <p className="font-semibold text-slate-900">
                                    {actor?.name ||
                                        "System"}
                                </p>

                                <p className="mt-1 text-slate-500">
                                    {actor?.email ||
                                        "No user account"}
                                </p>
                            </InfoCard>

                            <InfoCard
                                icon={Target}
                                label="Target"
                            >
                                <p className="font-semibold text-slate-900">
                                    {event.target_label ||
                                        "Unnamed Target"}
                                </p>

                                <p className="mt-1 text-slate-500">
                                    {formatValue(
                                        event.target_type
                                    )}
                                </p>

                                {event.target_id && (
                                    <p className="mt-2 break-all font-mono text-xs text-slate-500">
                                        {event.target_id}
                                    </p>
                                )}
                            </InfoCard>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoCard
                                icon={Globe2}
                                label="IP Address"
                            >
                                <span className="break-all font-mono">
                                    {event.ip_address ||
                                        "—"}
                                </span>
                            </InfoCard>

                            <InfoCard
                                icon={CalendarClock}
                                label="Occurred At"
                            >
                                {formatDateTime(
                                    event.occurred_at
                                )}
                            </InfoCard>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoCard
                                icon={Route}
                                label="Request"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold">
                                        {event.request_method ||
                                            "—"}
                                    </span>
                                </div>

                                <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-500">
                                    {event.request_path ||
                                        "—"}
                                </p>
                            </InfoCard>

                            <InfoCard
                                icon={User}
                                label="Actor User ID"
                            >
                                <span className="break-all font-mono text-xs">
                                    {event.actor_user_id ||
                                        "—"}
                                </span>
                            </InfoCard>
                        </div>

                        <InfoCard
                            icon={Monitor}
                            label="User Agent"
                        >
                            <p className="break-words leading-6 text-slate-600">
                                {event.user_agent ||
                                    "—"}
                            </p>
                        </InfoCard>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                                    Changes
                                </h3>

                                <pre className="max-h-80 overflow-auto rounded-xl bg-[#07111f] p-4 text-xs leading-6 text-slate-200">
                                    {event.changes
                                        ? JSON.stringify(
                                              event.changes,
                                              null,
                                              2
                                          )
                                        : "No changes recorded."}
                                </pre>
                            </div>

                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                                    Metadata
                                </h3>

                                <pre className="max-h-80 overflow-auto rounded-xl bg-[#07111f] p-4 text-xs leading-6 text-slate-200">
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

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Event ID
                                </p>

                                <p className="mt-2 break-all font-mono text-xs text-slate-600">
                                    {event.id}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Tenant ID
                                </p>

                                <p className="mt-2 break-all font-mono text-xs text-slate-600">
                                    {event.tenant_id ||
                                        "—"}
                                </p>
                            </div>
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

export default AuditEventDetailsModal;