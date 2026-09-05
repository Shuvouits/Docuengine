import {
    Search,
    SlidersHorizontal,
    ChevronDown,
    X,
} from "lucide-react";

function TenantFilters({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
}) {
    const hasFilters =
        search ||
        statusFilter !== "all" ||
        planFilter !== "all";

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setPlanFilter("all");
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

                {/* Search */}

                <div className="relative flex-1">

                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search organizations..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-2 focus:ring-[#7046f5]/10"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X size={15} />
                        </button>
                    )}

                </div>

                {/* Status */}

                <div className="relative">

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        className="h-11 min-w-[140px] cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-600 outline-none transition focus:border-[#7046f5] focus:ring-2 focus:ring-[#7046f5]/10"
                    >
                        <option value="all">
                            All statuses
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="onboarding">
                            Onboarding
                        </option>

                        <option value="suspended">
                            Suspended
                        </option>

                        <option value="inactive">
                            Inactive
                        </option>
                    </select>

                    <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                </div>

                {/* Plan */}

                <div className="relative">

                    <select
                        value={planFilter}
                        onChange={(e) =>
                            setPlanFilter(e.target.value)
                        }
                        className="h-11 min-w-[130px] cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-600 outline-none transition focus:border-[#7046f5] focus:ring-2 focus:ring-[#7046f5]/10"
                    >
                        <option value="all">
                            All plans
                        </option>

                        <option value="free">
                            Free
                        </option>

                        <option value="basic">
                            Basic
                        </option>

                        <option value="pro">
                            Pro
                        </option>

                        <option value="enterprise">
                            Enterprise
                        </option>
                    </select>

                    <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                </div>

                {/* Filters button */}

                <button
                    type="button"
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                    <SlidersHorizontal size={16} />
                    Filters
                </button>

                {/* Clear */}

                {hasFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                    >
                        Clear
                    </button>
                )}

            </div>

        </div>
    );
}

export default TenantFilters;