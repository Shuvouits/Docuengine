import {
    Building2,
    CheckCircle2,
    Layers3,
    Search,
} from "lucide-react";

import {
    useMemo,
    useState,
} from "react";

import CompanyLayoutCard from "./CompanyLayoutCard";

function CompanyLayoutAssignmentsPanel({
    company = null,
    layouts = [],
    activations = [],
    canActivate = false,
    actionLoading = false,
    onAction = () => {},
}) {
    const [filter, setFilter] =
        useState("all");

    const [search, setSearch] =
        useState("");

    const activationMap =
        useMemo(() => {
            const map = new Map();

            activations.forEach(
                (activation) => {
                    const layoutId =
                        activation.asset_layout_id ||
                        activation.layout_id ||
                        activation.asset_layout
                            ?.id;

                    if (layoutId) {
                        map.set(
                            layoutId,
                            activation
                        );
                    }
                }
            );

            return map;
        }, [activations]);

    const rows = useMemo(() => {
        const keyword =
            search
                .trim()
                .toLowerCase();

        return layouts.filter(
            (layout) => {
                const activation =
                    activationMap.get(
                        layout.id
                    );

                const active =
                    activation?.is_active ===
                        true ||
                    activation?.status ===
                        "active";

                const matchesFilter =
                    filter === "all" ||
                    (filter === "active" &&
                        active) ||
                    (filter ===
                        "available" &&
                        !active);

                const matchesSearch =
                    !keyword ||
                    layout.name
                        ?.toLowerCase()
                        .includes(
                            keyword
                        ) ||
                    layout.slug
                        ?.toLowerCase()
                        .includes(
                            keyword
                        ) ||
                    layout.description
                        ?.toLowerCase()
                        .includes(
                            keyword
                        );

                return (
                    matchesFilter &&
                    matchesSearch
                );
            }
        );
    }, [
        layouts,
        activationMap,
        filter,
        search,
    ]);

    const activeCount =
        layouts.filter((layout) => {
            const activation =
                activationMap.get(
                    layout.id
                );

            return (
                activation?.is_active ===
                    true ||
                activation?.status ===
                    "active"
            );
        }).length;

    if (!company) {
        return (
            <div className="flex min-h-[470px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <div>
                    <div
                        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{
                            color:
                                "var(--brand-primary)",
                            backgroundColor:
                                "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
                        }}
                    >
                        <Building2
                            size={25}
                        />
                    </div>

                    <h2 className="mt-4 text-base font-bold text-[#07111f]">
                        Select a company
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        Choose a managed company
                        from the left to review
                        and manage its Asset
                        Layout assignments.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Building2
                                size={17}
                                style={{
                                    color:
                                        "var(--brand-primary)",
                                }}
                            />

                            <h2 className="text-base font-bold text-[#07111f]">
                                {company.name}
                            </h2>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Layers3
                                    size={13}
                                />
                                {
                                    layouts.length
                                }{" "}
                                layouts
                            </span>

                            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                                <CheckCircle2
                                    size={13}
                                />
                                {activeCount} active
                            </span>
                        </div>
                    </div>

                    <div className="relative w-full xl:max-w-sm">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search layouts..."
                            className="
                                h-10 w-full
                                rounded-xl border
                                border-slate-200
                                pl-10 pr-4
                                text-sm text-slate-700
                                outline-none
                            "
                        />
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    <FilterButton
                        active={
                            filter === "all"
                        }
                        onClick={() =>
                            setFilter("all")
                        }
                    >
                        All Layouts
                    </FilterButton>

                    <FilterButton
                        active={
                            filter ===
                            "active"
                        }
                        onClick={() =>
                            setFilter(
                                "active"
                            )
                        }
                    >
                        Active
                    </FilterButton>

                    <FilterButton
                        active={
                            filter ===
                            "available"
                        }
                        onClick={() =>
                            setFilter(
                                "available"
                            )
                        }
                    >
                        Available
                    </FilterButton>
                </div>
            </div>

            <div className="space-y-4 p-5">
                {rows.length === 0 ? (
                    <div className="py-14 text-center">
                        <Layers3
                            size={30}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-3 text-sm font-semibold text-slate-700">
                            No layouts found
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Try another search
                            or filter.
                        </p>
                    </div>
                ) : (
                    rows.map((layout) => (
                        <CompanyLayoutCard
                            key={
                                layout.id
                            }
                            layout={
                                layout
                            }
                            activation={activationMap.get(
                                layout.id
                            )}
                            canActivate={
                                canActivate
                            }
                            actionLoading={
                                actionLoading
                            }
                            onAction={
                                onAction
                            }
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function FilterButton({
    active,
    onClick,
    children,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                rounded-lg border
                px-3 py-1.5
                text-xs font-semibold
                transition
                ${
                    active
                        ? "border-transparent"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }
            `}
            style={
                active
                    ? {
                          color:
                              "var(--brand-primary)",
                          backgroundColor:
                              "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
                      }
                    : undefined
            }
        >
            {children}
        </button>
    );
}

export default CompanyLayoutAssignmentsPanel;