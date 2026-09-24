import {
    CheckCircle2,
    FileText,
    Layers3,
    Power,
    PowerOff,
    RotateCcw,
} from "lucide-react";

function CompanyLayoutCard({
    layout,
    activation = null,
    canActivate = false,
    actionLoading = false,
    onAction = () => {},
}) {
    if (!layout) {
        return null;
    }

    const isActive =
        activation?.is_active === true ||
        activation?.status === "active";

    const wasAssigned =
        Boolean(activation);

    const actionType = isActive
        ? "deactivate"
        : wasAssigned
          ? "reactivate"
          : "activate";

    const ActionIcon =
        actionType === "deactivate"
            ? PowerOff
            : actionType === "reactivate"
              ? RotateCcw
              : Power;

    const actionLabel =
        actionType === "deactivate"
            ? "Deactivate"
            : actionType === "reactivate"
              ? "Reactivate"
              : "Activate";

    return (
        <div
            className={`
                rounded-2xl border
                bg-white p-5
                transition
                ${
                    isActive
                        ? "border-emerald-200"
                        : "border-slate-200"
                }
            `}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                    <div
                        className={`
                            flex h-11 w-11
                            shrink-0 items-center
                            justify-center
                            rounded-xl
                            ${
                                isActive
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-50 text-slate-500"
                            }
                        `}
                    >
                        <Layers3 size={20} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-[#07111f]">
                                {layout.name}
                            </h3>

                            {isActive && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                                    <CheckCircle2
                                        size={11}
                                    />
                                    Active
                                </span>
                            )}

                            {!isActive &&
                                wasAssigned && (
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                                        Inactive
                                    </span>
                                )}

                            {!wasAssigned && (
                                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                                    Available
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                            {layout.slug ||
                                "No layout slug"}
                        </p>

                        {layout.description && (
                            <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-500">
                                {
                                    layout.description
                                }
                            </p>
                        )}
                    </div>
                </div>

                {canActivate && (
                    <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                            onAction({
                                type: actionType,
                                layout,
                                activation,
                            })
                        }
                        className={`
                            inline-flex h-10
                            shrink-0 items-center
                            justify-center gap-2
                            rounded-xl border
                            px-3.5 text-xs
                            font-semibold transition
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            ${
                                actionType ===
                                "deactivate"
                                    ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                                    : actionType ===
                                        "reactivate"
                                      ? "border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
                                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }
                        `}
                    >
                        <ActionIcon
                            size={15}
                        />

                        {actionLabel}
                    </button>
                )}
            </div>

            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <InfoItem
                    label="Version"
                    value={`v${
                        layout.current_version ??
                        activation
                            ?.asset_layout_version
                            ?.version ??
                        "-"
                    }`}
                />

                <InfoItem
                    label="Sections"
                    value={
                        layout.sections_count ??
                        layout.active_sections_count ??
                        "-"
                    }
                />

                <InfoItem
                    label="Fields"
                    value={
                        layout.fields_count ??
                        layout.active_fields_count ??
                        "-"
                    }
                />
            </div>

            {activation && (
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileText
                            size={13}
                        />

                        <span>
                            Assignment ID:
                        </span>

                        <span className="font-medium text-slate-700">
                            {shortId(
                                activation.id
                            )}
                        </span>
                    </div>

                    {activation.activated_at && (
                        <span className="text-xs text-slate-400">
                            Activated{" "}
                            {formatDate(
                                activation.activated_at
                            )}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

function InfoItem({
    label,
    value,
}) {
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
                {value}
            </p>
        </div>
    );
}

function shortId(value) {
    if (!value) {
        return "-";
    }

    return String(value).slice(0, 8);
}

function formatDate(value) {
    if (!value) {
        return "";
    }

    try {
        return new Intl.DateTimeFormat(
            "en-US",
            {
                dateStyle: "medium",
            }
        ).format(new Date(value));
    } catch {
        return value;
    }
}

export default CompanyLayoutCard;