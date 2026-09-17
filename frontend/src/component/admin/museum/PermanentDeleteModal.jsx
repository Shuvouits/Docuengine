import {
    LoaderCircle,
    Trash2,
    X,
} from "lucide-react";

const PermanentDeleteModal = ({
    entry,
    open,
    loading = false,
    onClose,
    onConfirm,
}) => {
    if (!open || !entry) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="h-1 w-full bg-red-500" />

                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <X size={19} />
                </button>

                <div className="px-6 pb-6 pt-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <Trash2 size={22} />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-slate-900">
                        Delete Archived Resource
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Are you sure you want to permanently delete{" "}
                        <span className="font-semibold text-slate-800">
                            {entry.resource_label ||
                                "this resource"}
                        </span>
                        ? This action cannot be undone.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <LoaderCircle
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Trash2 size={17} />
                        )}

                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermanentDeleteModal;