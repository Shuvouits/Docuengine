import {
    LoaderCircle,
    Power,
    PowerOff,
    RotateCcw,
    X,
} from "lucide-react";

function CompanyLayoutActionModal({
    open = false,
    action = null,
    company = null,
    layout = null,
    loading = false,
    onClose = () => {},
    onConfirm = () => {},
}) {
    if (
        !open ||
        !action ||
        !company ||
        !layout
    ) {
        return null;
    }

    const config =
        getActionConfig(action);

    const Icon =
        config.icon;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div
                    className={`h-1 ${config.topBar}`}
                />

                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
                >
                    <X size={18} />
                </button>

                <div className="p-6">
                    <div
                        className={`
                            flex h-12 w-12
                            items-center
                            justify-center
                            rounded-full
                            ${config.iconStyle}
                        `}
                    >
                        <Icon size={21} />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-[#07111f]">
                        {config.title}
                    </h2>

                    <p className="mt-2 pr-3 text-sm leading-6 text-slate-500">
                        {config.messageStart}{" "}
                        <span className="font-semibold text-slate-700">
                            {layout.name}
                        </span>{" "}
                        {config.messageMiddle}{" "}
                        <span className="font-semibold text-slate-700">
                            {company.name}
                        </span>
                        ?
                    </p>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-slate-400">
                                Company
                            </span>

                            <span className="text-right text-xs font-semibold text-slate-700">
                                {company.name}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-xs text-slate-400">
                                Asset Layout
                            </span>

                            <span className="text-right text-xs font-semibold text-slate-700">
                                {layout.name}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-xs text-slate-400">
                                Version
                            </span>

                            <span className="text-right text-xs font-semibold text-slate-700">
                                v
                                {layout.current_version ??
                                    "-"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`
                            flex h-11
                            items-center
                            justify-center gap-2
                            rounded-xl
                            text-sm font-semibold
                            text-white transition
                            disabled:opacity-60
                            ${config.buttonStyle}
                        `}
                    >
                        {loading ? (
                            <LoaderCircle
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            <Icon
                                size={16}
                            />
                        )}

                        {config.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

function getActionConfig(
    action
) {
    if (
        action === "deactivate"
    ) {
        return {
            icon: PowerOff,
            title:
                "Deactivate Layout",
            confirmText:
                "Deactivate",
            messageStart:
                "Deactivate",
            messageMiddle:
                "for",
            topBar:
                "bg-red-500",
            iconStyle:
                "bg-red-50 text-red-500",
            buttonStyle:
                "bg-red-600 hover:bg-red-700",
        };
    }

    if (
        action === "reactivate"
    ) {
        return {
            icon: RotateCcw,
            title:
                "Reactivate Layout",
            confirmText:
                "Reactivate",
            messageStart:
                "Reactivate",
            messageMiddle:
                "for",
            topBar:
                "bg-amber-500",
            iconStyle:
                "bg-amber-50 text-amber-600",
            buttonStyle:
                "bg-amber-500 hover:bg-amber-600",
        };
    }

    return {
        icon: Power,
        title: "Activate Layout",
        confirmText:
            "Activate",
        messageStart:
            "Activate",
        messageMiddle:
            "for",
        topBar:
            "bg-emerald-500",
        iconStyle:
            "bg-emerald-50 text-emerald-600",
        buttonStyle:
            "bg-emerald-600 hover:bg-emerald-700",
    };
}

export default CompanyLayoutActionModal;