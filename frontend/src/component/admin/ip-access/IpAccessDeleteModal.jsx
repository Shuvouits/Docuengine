import {
    LoaderCircle,
    Trash2,
    X,
} from "lucide-react";

const IpAccessDeleteModal = ({
    open,
    entry,
    deleting,
    onClose,
    onConfirm,
}) => {
    if (!open || !entry) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="h-1 bg-red-500" />

                <button
                    type="button"
                    onClick={onClose}
                    disabled={deleting}
                    className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    <X size={18} />
                </button>

                <div className="px-6 pb-6 pt-7">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <Trash2 size={21} />
                    </div>

                    <h2 className="text-xl font-semibold text-slate-900">
                        Delete IP Rule
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Delete{" "}
                        <span className="font-semibold text-slate-700">
                            {entry.label ||
                                entry.ip_or_cidr}
                        </span>
                        ? This action cannot be undone.
                    </p>

                    <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
                        {entry.ip_or_cidr}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={deleting}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {deleting && (
                            <LoaderCircle
                                size={16}
                                className="animate-spin"
                            />
                        )}

                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IpAccessDeleteModal;