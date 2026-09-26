import {
    Building2,
    Plus,
    RefreshCw,
} from "lucide-react";

const CompaniesHeader = ({
    canCreate = false,
    refreshing = false,
    onCreate,
    onRefresh,
}) => {
    return (
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#19b5fe]" />

                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#159edb]">
                        Company Management
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
                        <Building2 size={20} />
                    </div>

                    <div>
                        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
                            Companies
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage client companies, profiles,
                            locations and workspace access.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        size={15}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>

                {canCreate && (
                    <button
                        type="button"
                        onClick={onCreate}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#19b5fe] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0da7eb]"
                    >
                        <Plus size={16} />
                        Add Company
                    </button>
                )}
            </div>
        </div>
    );
};

export default CompaniesHeader;