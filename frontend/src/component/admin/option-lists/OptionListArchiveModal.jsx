import {
    Archive,
    LoaderCircle,
    X,
} from "lucide-react";

function OptionListArchiveModal({
    open = false,
    title = "Archive",
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
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
            <button
                type="button"
                onClick={() => {
                    if (!loading) {
                        onClose();
                    }
                }}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            />

            <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="h-1 bg-amber-500" />

                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                >
                    <X size={18} />
                </button>

                <div className="px-6 pb-6 pt-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <Archive size={21} />
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-slate-950">
                        {title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Archive{" "}
                        <span className="font-semibold text-slate-700">
                            {itemName}
                        </span>
                        ?
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                        {description ||
                            "The item will no longer appear in active records but can be restored later."}
                    </p>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className="
                            inline-flex h-11
                            min-w-[120px]
                            items-center justify-center
                            gap-2 rounded-xl
                            bg-amber-600 px-5
                            text-sm font-semibold
                            text-white
                            hover:bg-amber-700
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
                                <Archive
                                    size={16}
                                />

                                Archive
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OptionListArchiveModal;