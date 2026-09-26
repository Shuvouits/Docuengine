import {
    Archive,
    LoaderCircle,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

const CompanyArchiveModal = ({
    company = null,
    archiving = false,
    onClose,
    onArchive,
}) => {
    const [reason, setReason] =
        useState("");

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (company) {
            setReason("");
            setError("");
        }
    }, [company]);

    if (!company) {
        return null;
    }

    const handleArchive = async () => {
        setError("");

        const result =
            await onArchive(
                company,
                reason
            );

        if (
            result &&
            result.ok === false
        ) {
            setError(
                result.message ||
                    "Unable to archive company."
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="h-1 bg-amber-500" />

                <button
                    type="button"
                    onClick={onClose}
                    disabled={archiving}
                    className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    <X size={18} />
                </button>

                <div className="px-6 pb-6 pt-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <Archive size={21} />
                    </div>

                    <h2 className="mt-5 text-[20px] font-semibold text-slate-900">
                        Archive Company
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Archive{" "}
                        <span className="font-semibold text-slate-800">
                            {company.name}
                        </span>
                        ? The company will be removed
                        from active workspaces until it
                        is restored.
                    </p>

                    <label className="mt-5 block text-xs font-semibold text-slate-600">
                        Archive Reason

                        <textarea
                            rows={3}
                            value={reason}
                            onChange={(event) =>
                                setReason(
                                    event.target.value
                                )
                            }
                            placeholder="Optional reason..."
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        />
                    </label>

                    {error && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={archiving}
                        className="h-10 flex-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleArchive}
                        disabled={archiving}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                    >
                        {archiving && (
                            <LoaderCircle
                                size={15}
                                className="animate-spin"
                            />
                        )}

                        Archive Company
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyArchiveModal;