import {
    Archive,
    CalendarClock,
    FileText,
    Fingerprint,
    LoaderCircle,
    RotateCcw,
    Trash2,
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

const MuseumDetailsModal = ({
    entry,
    open,
    onClose,
    canRestore = false,
    canDeletePermanently = false,
    actionLoading = false,
    onRestore,
    onDeletePermanently,
}) => {
    if (!open || !entry) {
        return null;
    }

    const archivedBy =
        entry.actor_snapshot ||
        entry.archived_by_snapshot ||
        entry.archived_by ||
        null;

    const supportsLifecycleActions =
        entry.resource_type === "security_group";

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
            <div className="flex max-h-[calc(100vh-32px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div className="pr-6">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                Archived
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {formatValue(
                                    entry.resource_type
                                )}
                            </span>
                        </div>

                        <h2 className="text-xl font-semibold text-slate-900">
                            {entry.resource_label ||
                                "Archived Resource"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Archived resource details and historical metadata
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={actionLoading}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoCard
                                icon={Archive}
                                label="Resource Type"
                            >
                                {formatValue(
                                    entry.resource_type
                                )}
                            </InfoCard>

                            <InfoCard
                                icon={CalendarClock}
                                label="Archived At"
                            >
                                {formatDateTime(
                                    entry.archived_at
                                )}
                            </InfoCard>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoCard
                                icon={User}
                                label="Archived By"
                            >
                                <p className="font-semibold text-slate-900">
                                    {archivedBy?.name ||
                                        "System"}
                                </p>

                                <p className="mt-1 text-slate-500">
                                    {archivedBy?.email ||
                                        "—"}
                                </p>
                            </InfoCard>

                            <InfoCard
                                icon={Fingerprint}
                                label="Resource ID"
                            >
                                <span className="break-all font-mono text-xs">
                                    {entry.resource_id ||
                                        "—"}
                                </span>
                            </InfoCard>
                        </div>

                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-slate-900">
                                Archive Reason
                            </h3>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                {entry.reason ||
                                    "No archive reason was provided."}
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <FileText
                                    size={17}
                                    className="text-slate-400"
                                />

                                <h3 className="text-sm font-semibold text-slate-900">
                                    Metadata
                                </h3>
                            </div>

                            <pre className="max-h-80 overflow-auto rounded-xl bg-[#07111f] p-4 text-xs leading-6 text-slate-200">
                                {entry.metadata
                                    ? JSON.stringify(
                                          entry.metadata,
                                          null,
                                          2
                                      )
                                    : "No metadata recorded."}
                            </pre>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Archive Entry ID
                            </p>

                            <p className="mt-2 break-all font-mono text-xs text-slate-600">
                                {entry.id}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={actionLoading}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Close
                    </button>

                    {supportsLifecycleActions && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {canRestore && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRestore(entry)
                                    }
                                    disabled={actionLoading}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {actionLoading ? (
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <RotateCcw size={16} />
                                    )}

                                    Restore
                                </button>
                            )}

                            {canDeletePermanently && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onDeletePermanently(
                                            entry
                                        )
                                    }
                                    disabled={actionLoading}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Trash2 size={16} />

                                    Delete Permanently
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MuseumDetailsModal;