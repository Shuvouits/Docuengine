import {
    AlertTriangle,
    CheckCircle2,
    X,
} from "lucide-react";

function CompanyLayoutsAlert({
    type = "error",
    message = "",
    onClose = () => {},
}) {
    if (!message) {
        return null;
    }

    const success =
        type === "success";

    return (
        <div
            className={`
                flex items-start gap-3
                rounded-2xl border
                px-4 py-4
                ${
                    success
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                }
            `}
        >
            {success ? (
                <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-500"
                />
            ) : (
                <AlertTriangle
                    size={19}
                    className="mt-0.5 shrink-0 text-red-500"
                />
            )}

            <p
                className={`
                    flex-1 text-sm
                    font-semibold
                    ${
                        success
                            ? "text-emerald-700"
                            : "text-red-700"
                    }
                `}
            >
                {message}
            </p>

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
}

export default CompanyLayoutsAlert;