import {
    History,
    X,
} from "lucide-react";

function VersionHistoryModal({
    open = false,
    versions = [],
    onClose = () => {},
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[145] flex items-center justify-center p-4">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            />

            <div className="relative z-10 flex max-h-[85vh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div
                    className="h-1 shrink-0"
                    style={{
                        backgroundColor:
                            "var(--brand-primary)",
                    }}
                />

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{
                                color:
                                    "var(--brand-primary)",

                                backgroundColor:
                                    "color-mix(in srgb, var(--brand-primary) 9%, white)",
                            }}
                        >
                            <History size={18} />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Version History
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Immutable schema snapshots
                                for this asset layout.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {!versions.length ? (
                        <div className="py-12 text-center">
                            <History
                                size={28}
                                className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                No versions available
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {versions.map(
                                (version) => (
                                    <div
                                        key={
                                            version.id
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    Version{" "}
                                                    {
                                                        version.version_number
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {formatDate(
                                                        version.created_at
                                                    )}
                                                </p>
                                            </div>

                                            <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                                v
                                                {
                                                    version.version_number
                                                }
                                            </span>
                                        </div>

                                        <p className="mt-3 text-xs leading-5 text-slate-600">
                                            {version.change_summary ||
                                                "No change summary provided."}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatDate(value) {
    if (!value) {
        return "Unknown date";
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }
    );
}

export default VersionHistoryModal;