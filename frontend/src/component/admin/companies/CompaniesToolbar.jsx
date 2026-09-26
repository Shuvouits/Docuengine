import {
    ArrowUpDown,
    ChevronDown,
    Search,
    X,
} from "lucide-react";

const CompaniesToolbar = ({
    search = "",
    status = "all",
    sortBy = "name",
    sortDirection = "asc",
    onSearchChange,
    onStatusChange,
    onSortByChange,
    onSortDirectionChange,
    onClear,
}) => {
    const hasFilters =
        search.trim() !== "" ||
        status !== "all" ||
        sortBy !== "name" ||
        sortDirection !== "asc";

    const handleDirectionToggle = () => {
        if (!onSortDirectionChange) {
            return;
        }

        onSortDirectionChange(
            sortDirection === "asc"
                ? "desc"
                : "asc"
        );
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

                {/* Search */}
                <div className="relative min-w-0 flex-1">
                    <Search
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            onSearchChange?.(
                                event.target.value
                            )
                        }
                        placeholder="Search companies..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#19b5fe] focus:ring-2 focus:ring-[#19b5fe]/10"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">

                    {/* Status */}
                    <div className="relative">
                        <select
                            value={status}
                            onChange={(event) =>
                                onStatusChange?.(
                                    event.target.value
                                )
                            }
                            className="h-11 min-w-[150px] appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-[#19b5fe] focus:ring-2 focus:ring-[#19b5fe]/10"
                        >
                            <option value="all">
                                All Companies
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>

                            <option value="archived">
                                Archived
                            </option>
                        </select>

                        <ChevronDown
                            size={15}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(event) =>
                                onSortByChange?.(
                                    event.target.value
                                )
                            }
                            className="h-11 min-w-[150px] appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-[#19b5fe] focus:ring-2 focus:ring-[#19b5fe]/10"
                        >
                            <option value="name">
                                Sort: Name
                            </option>

                            <option value="status">
                                Sort: Status
                            </option>

                            <option value="city">
                                Sort: City
                            </option>

                            <option value="created_at">
                                Sort: Created
                            </option>

                            <option value="updated_at">
                                Sort: Updated
                            </option>
                        </select>

                        <ChevronDown
                            size={15}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>

                    {/* Sort Direction */}
                    <button
                        type="button"
                        onClick={handleDirectionToggle}
                        title={
                            sortDirection === "asc"
                                ? "Ascending"
                                : "Descending"
                        }
                        className={`inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                            sortDirection === "desc"
                                ? "border-[#19b5fe]/30 bg-[#19b5fe]/5 text-[#159edb]"
                                : "border-slate-200 bg-white text-slate-500 hover:border-[#19b5fe]/40 hover:text-[#159edb]"
                        }`}
                    >
                        <ArrowUpDown size={16} />

                        {sortDirection === "asc"
                            ? "Ascending"
                            : "Descending"}
                    </button>

                    {/* Clear */}
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={() =>
                                onClear?.()
                            }
                            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                        >
                            <X size={15} />

                            Clear
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompaniesToolbar;