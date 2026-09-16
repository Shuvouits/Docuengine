import {
    AlertCircle,
    CheckCircle2,
    X,
} from "lucide-react";

const SecurityEventsAlert = ({
    type = "error",
    message,
    onClose,
}) => {
    if (!message) {
        return null;
    }

    const isSuccess =
        type === "success";

    return (
        <div
            className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 ${
                isSuccess
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
            }`}
        >
            <div className="flex items-start gap-3">
                {isSuccess ? (
                    <CheckCircle2
                        size={19}
                        className="mt-0.5 shrink-0 text-emerald-600"
                    />
                ) : (
                    <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-600"
                    />
                )}

                <p
                    className={`text-sm font-medium ${
                        isSuccess
                            ? "text-emerald-800"
                            : "text-red-800"
                    }`}
                >
                    {message}
                </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className={`shrink-0 ${
                    isSuccess
                        ? "text-emerald-500 hover:text-emerald-700"
                        : "text-red-500 hover:text-red-700"
                }`}
            >
                <X size={17} />
            </button>
        </div>
    );
};

export default SecurityEventsAlert;