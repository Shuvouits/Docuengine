import {
    Building2,
    RefreshCw,
} from "lucide-react";

function CompanyLayoutsHeader({
    tenantName = "",
    refreshing = false,
    onRefresh = () => {},
}) {
    return (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <Building2
                        size={16}
                        style={{
                            color:
                                "var(--brand-primary)",
                        }}
                    />

                    <span
                        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                        style={{
                            color:
                                "var(--brand-primary)",
                        }}
                    >
                        Documentation
                    </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#07111f] lg:text-3xl">
                    Company Layouts
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Assign and manage Asset Layouts
                    available to managed client
                    companies
                    {tenantName ? (
                        <>
                            {" "}
                            under{" "}
                            <span className="font-semibold text-slate-700">
                                {tenantName}
                            </span>
                            .
                        </>
                    ) : (
                        "."
                    )}
                </p>
            </div>

            <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="
                    inline-flex h-11
                    items-center gap-2
                    self-start rounded-xl
                    border border-slate-200
                    bg-white px-4
                    text-sm font-semibold
                    text-slate-700 shadow-sm
                    transition
                    hover:bg-slate-50
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    lg:self-auto
                "
            >
                <RefreshCw
                    size={17}
                    className={
                        refreshing
                            ? "animate-spin"
                            : ""
                    }
                />

                Refresh
            </button>
        </div>
    );
}

export default CompanyLayoutsHeader;