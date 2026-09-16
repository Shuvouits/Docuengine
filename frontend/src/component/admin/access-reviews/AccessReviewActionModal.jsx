import {
    AlertTriangle,
    CheckCircle2,
    LoaderCircle,
    Play,
    X,
} from "lucide-react";

import {
    useState,
} from "react";

const AccessReviewActionModal = ({
    type,
    reviewName,
    loading,
    onClose,
    onConfirm,
}) => {
    const [error, setError] =
        useState("");

    const config = {
        start: {
            title:
                "Start Access Review",

            text: `Start ${reviewName}? This will snapshot all active tenant users and their current access.`,

            button:
                "Start Review",

            icon: Play,

            destructive:
                false,
        },

        complete: {
            title:
                "Complete Access Review",

            text: `Complete ${reviewName}? The review will be closed once completed.`,

            button:
                "Complete Review",

            icon:
                CheckCircle2,

            destructive:
                false,
        },

        cancel: {
            title:
                "Cancel Access Review",

            text: `Cancel ${reviewName}? The review will no longer be available for further decisions.`,

            button:
                "Cancel Review",

            icon:
                AlertTriangle,

            destructive:
                true,
        },
    };

    const current =
        config[type];

    const Icon =
        current.icon;

    const confirm =
        async () => {
            setError("");

            const result =
                await onConfirm();

            if (
                result?.ok === false
            ) {
                setError(
                    result.message
                );
            }
        };

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/60 px-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div
                    className={`h-1 ${
                        current.destructive
                            ? "bg-red-500"
                            : "bg-[#19b5fe]"
                    }`}
                />

                <button
                    type="button"
                    onClick={
                        onClose
                    }
                    className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                    <X
                        size={18}
                    />
                </button>

                <div className="p-6">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            current.destructive
                                ? "bg-red-50 text-red-500"
                                : "bg-[#19b5fe]/10 text-[#19b5fe]"
                        }`}
                    >
                        <Icon
                            size={21}
                        />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-[#07111f]">
                        {
                            current.title
                        }
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {
                            current.text
                        }
                    </p>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                            {
                                error
                            }
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        disabled={
                            loading
                        }
                        onClick={
                            confirm
                        }
                        className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 ${
                            current.destructive
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-[#19b5fe] hover:bg-[#159edb]"
                        }`}
                    >
                        {loading && (
                            <LoaderCircle
                                size={16}
                                className="animate-spin"
                            />
                        )}

                        {
                            current.button
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessReviewActionModal;