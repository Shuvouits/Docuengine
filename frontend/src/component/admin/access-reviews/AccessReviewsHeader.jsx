import {
    ClipboardCheck,
    Plus,
    RefreshCw,
} from "lucide-react";

const AccessReviewsHeader = ({
    tenantName,
    refreshing,
    canManage,
    onRefresh,
    onCreate,
}) => {
    return (
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <ClipboardCheck
                        size={16}
                        className="text-[#19b5fe]"
                    />

                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#19b5fe]">
                        Identity & Access
                    </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#07111f] lg:text-3xl">
                    Access Reviews
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Review user access,
                    roles and tenant
                    membership for{" "}
                    <span className="font-semibold text-slate-700">
                        {tenantName}
                    </span>
                    .
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={
                        refreshing
                    }
                    className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
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

                {canManage && (
                    <button
                        type="button"
                        onClick={
                            onCreate
                        }
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#19b5fe] px-5 text-sm font-semibold text-white shadow-lg shadow-[#19b5fe]/20 hover:bg-[#159edb]"
                    >
                        <Plus
                            size={18}
                        />

                        New Review
                    </button>
                )}
            </div>
        </div>
    );
};

export default AccessReviewsHeader;