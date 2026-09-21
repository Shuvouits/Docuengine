import {
    FileStack,
    Layers3,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";

import AssetLayoutsTable from "../../../component/admin/asset-layouts/AssetLayoutsTable";

function AssetLayoutsPage({
    authData = null,
    authLoading = false,
}) {
    const navigate = useNavigate();

    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const permissions =
        currentTenant?.access?.permissions || [];

    const canManage =
        permissions.includes("asset_layouts.manage");

    const [layouts, setLayouts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | Load Layouts
    |--------------------------------------------------------------------------
    */

    const loadLayouts = useCallback(async () => {
        if (!tenantId) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                `/tenants/${tenantId}/asset-layouts`
            );

            setLayouts(
                response.data?.data?.asset_layouts ||
                    []
            );
        } catch (error) {
            console.error(
                "Failed to load asset layouts:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to load asset layouts."
            );
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (
            !authLoading &&
            tenantId
        ) {
            loadLayouts();
        }
    }, [
        authLoading,
        tenantId,
        loadLayouts,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const filteredLayouts =
        useMemo(() => {
            const keyword =
                search.trim().toLowerCase();

            if (!keyword) {
                return layouts;
            }

            return layouts.filter((layout) => {
                return [
                    layout.name,
                    layout.slug,
                    layout.description,
                    layout.status,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value)
                            .toLowerCase()
                            .includes(keyword)
                    );
            });
        }, [layouts, search]);

    /*
    |--------------------------------------------------------------------------
    | Summary
    |--------------------------------------------------------------------------
    */

    const totalLayouts =
        layouts.length;

    const templateCount =
        layouts.filter(
            (layout) => layout.is_template
        ).length;

    const totalFields =
        layouts.reduce(
            (total, layout) =>
                total +
                Number(
                    layout.fields_count || 0
                ),
            0
        );

    /*
    |--------------------------------------------------------------------------
    | Actions
    |--------------------------------------------------------------------------
    */

    const handleOpenLayout = (layout) => {
        navigate(
            `/admin/asset-layouts/${layout.id}`
        );
    };

    const handleCreate = () => {
        navigate(
            "/admin/asset-layouts/create"
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{
                                backgroundColor:
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

                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[30px]">
                        Asset Layouts
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Build reusable documentation
                        structures for servers,
                        workstations, network devices,
                        and other managed assets.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={loadLayouts}
                        disabled={loading}
                        className="
                            inline-flex h-11 items-center gap-2
                            rounded-xl border border-slate-200
                            bg-white px-4 text-sm font-semibold
                            text-slate-700 shadow-sm
                            transition
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    {canManage && (
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="
                                inline-flex h-11 items-center
                                gap-2 rounded-xl px-4
                                text-sm font-semibold
                                text-white shadow-sm
                                transition
                                hover:opacity-90
                            "
                            style={{
                                backgroundColor:
                                    "var(--brand-primary)",
                            }}
                        >
                            <Plus size={17} />

                            New Layout
                        </button>
                    )}
                </div>
            </div>

            {/* Summary */}

            <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                    icon={Layers3}
                    label="Total Layouts"
                    value={totalLayouts}
                    description="Available documentation layouts"
                />

                <SummaryCard
                    icon={FileStack}
                    label="Reusable Templates"
                    value={templateCount}
                    description="Layouts available as templates"
                />

                <SummaryCard
                    icon={ShieldCheck}
                    label="Configured Fields"
                    value={totalFields}
                    description="Active fields across layouts"
                />
            </div>

            {/* Toolbar */}

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-[420px]">
                    <Search
                        size={17}
                        className="
                            pointer-events-none absolute
                            left-3.5 top-1/2
                            -translate-y-1/2
                            text-slate-400
                        "
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search layouts..."
                        className="
                            h-11 w-full rounded-xl
                            border border-slate-200
                            bg-slate-50 pl-10 pr-4
                            text-sm text-slate-800
                            outline-none transition
                            placeholder:text-slate-400
                            focus:border-slate-300
                            focus:bg-white
                            focus:ring-4
                            focus:ring-slate-100
                        "
                    />
                </div>

                <div className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                        {filteredLayouts.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                        {layouts.length}
                    </span>{" "}
                    layouts
                </div>
            </div>

            {/* Error */}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Table */}

            <AssetLayoutsTable
                layouts={filteredLayouts}
                loading={loading}
                onOpen={handleOpenLayout}
            />
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Summary Card
|--------------------------------------------------------------------------
*/

function SummaryCard({
    icon: Icon,
    label,
    value,
    description,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                        {value}
                    </p>
                </div>

                <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                        color:
                            "var(--brand-primary)",
                        backgroundColor:
                            "color-mix(in srgb, var(--brand-primary) 9%, white)",
                    }}
                >
                    <Icon
                        size={19}
                        strokeWidth={1.8}
                    />
                </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
                {description}
            </p>
        </div>
    );
}

export default AssetLayoutsPage;