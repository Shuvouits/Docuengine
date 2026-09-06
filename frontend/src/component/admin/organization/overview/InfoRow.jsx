function InfoRow({
    label,
    value,
    allowWrap = false,
}) {
    return (
        <div className="flex items-start justify-between gap-6 border-b border-slate-100 py-3.5 last:border-0">

            <span className="shrink-0 text-xs text-slate-500">
                {label}
            </span>

            <span
                className={`
                    text-right text-xs font-semibold text-slate-800

                    ${
                        allowWrap
                            ? "break-all"
                            : "max-w-[65%] truncate"
                    }
                `}
            >
                {value || "Not set"}
            </span>

        </div>
    );
}

export default InfoRow;