import {
    Archive,
    LoaderCircle,
    X,
} from "lucide-react";

function ArchiveConfirmModal({
    open = false,
    title = "Archive Item",
    itemName = "",
    description = "",
    loading = false,
    onClose = () => {},
    onConfirm = () => {},
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close"
                onClick={() => {
                    if (!loading) {
                        onClose();
                    }
                }}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            />

            <div className="relative z-10 w-full max-w-[470px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="h-1 bg-amber-500" />

                <button
                    type="button"
                    disabled={loading}
                    onClick={onClose}
                    className="
                        absolute right-4 top-4
                        flex h-9 w-9
                        items-center justify-center
                        rounded-xl
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-slate-700
                        disabled:opacity-50
                    "
                >
                    <X size={18} />
                </button>

                <div className="px-6 pb-6 pt-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <Archive
                            size={21}
                            strokeWidth={1.8}
                        />
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-slate-950">
                        {title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Are you sure you want to archive{" "}
                        <span className="font-semibold text-slate-700">
                            {itemName}
                        </span>
                        ?
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                        {description ||
                            "This item will no longer appear in active records, but it can be restored later."}
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="
                            inline-flex h-11
                            items-center justify-center
                            rounded-xl border
                            border-slate-200
                            bg-white px-5
                            text-sm font-semibold
                            text-slate-700
                            transition
                            hover:bg-slate-50
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className="
                            inline-flex h-11
                            min-w-[125px]
                            items-center justify-center
                            gap-2 rounded-xl
                            bg-amber-600 px-5
                            text-sm font-semibold
                            text-white shadow-sm
                            transition
                            hover:bg-amber-700
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {loading ? (
                            <>
                                <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                />

                                Archiving...
                            </>
                        ) : (
                            <>
                                <Archive size={16} />

                                Archive
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ArchiveConfirmModal;