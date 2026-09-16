import {
    Network,
    Plus,
    RefreshCcw,
} from "lucide-react";

const IpAccessHeader = ({
    onRefresh,
    onAdd,
    canManage,
}) => {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#19b5fe]">
                    <Network size={16} />
                    Security
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    IP Access
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Control which IP addresses and network ranges can access this organization.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <RefreshCcw size={16} />
                    Refresh
                </button>

                {canManage && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#19b5fe] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500"
                    >
                        <Plus size={17} />
                        Add IP Rule
                    </button>
                )}
            </div>
        </div>
    );
};

export default IpAccessHeader;