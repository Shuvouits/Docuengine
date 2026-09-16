import {
    AlertCircle,
    CheckCircle2,
    X,
} from "lucide-react";

const IpAccessAlert = ({
    type = "error",
    message,
    onClose,
}) => {
    if (!message) {
        return null;
    }

    const success =
        type === "success";

    return (
        <div
            className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 ${
                success
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
            }`}
        >
            <div className="flex items-start gap-3">
                {success ? (
                    <CheckCircle2
                        size={19}
                        className="mt-0.5 text-emerald-600"
                    />
                ) : (
                    <AlertCircle
                        size={19}
                        className="mt-0.5 text-red-600"
                    />
                )}

                <p
                    className={`text-sm font-medium ${
                        success
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
                className={
                    success
                        ? "text-emerald-500"
                        : "text-red-500"
                }
            >
                <X size={17} />
            </button>
        </div>
    );
};

export default IpAccessAlert;