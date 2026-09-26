import {
    AlertCircle,
    CheckCircle2,
    X,
} from "lucide-react";

const CompaniesAlert = ({
    type = "success",
    message = "",
    onClose,
}) => {
    if (!message) {
        return null;
    }

    const isError =
        type === "error";

    return (
        <div
            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 ${
                isError
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
        >
            <div className="flex items-start gap-2.5">
                {isError ? (
                    <AlertCircle
                        size={17}
                        className="mt-0.5 shrink-0"
                    />
                ) : (
                    <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0"
                    />
                )}

                <span className="text-sm font-medium">
                    {message}
                </span>
            </div>

            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 opacity-60 transition hover:opacity-100"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default CompaniesAlert;