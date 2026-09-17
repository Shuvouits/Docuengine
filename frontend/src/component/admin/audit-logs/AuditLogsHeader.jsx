import {
    Download,
    LoaderCircle,
    ScrollText,
} from "lucide-react";

const AuditLogsHeader = ({
    canExport = false,
    exporting = false,
    onExport,
}) => {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#19b5fe]">
                    <ScrollText size={22} />
                </div>

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Audit Logs
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Track important changes, access activity,
                        archive actions, and system events.
                    </p>
                </div>
            </div>

            {canExport && (
                <button
                    type="button"
                    onClick={onExport}
                    disabled={exporting}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#07111f] px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {exporting ? (
                        <LoaderCircle
                            size={17}
                            className="animate-spin"
                        />
                    ) : (
                        <Download size={17} />
                    )}

                    {exporting
                        ? "Exporting..."
                        : "Export CSV"}
                </button>
            )}
        </div>
    );
};

export default AuditLogsHeader;