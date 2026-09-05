import {
    Plus,
    Building2,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";

import TenantStats from "../../../component/admin/tenants/TenantStats";
import TenantFilters from "../../../component/admin/tenants/TenantFilters";
import TenantTable from "../../../component/admin/tenants/TenantTable";

function TenantsPage() {
    const navigate = useNavigate();

    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search & filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [planFilter, setPlanFilter] = useState("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleAddTenant = () => {
        navigate("/admin/tenants/create");
    };

    const fetchTenants = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/tenants");

            setTenants(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch tenants:", error);

            setError(
                error.response?.data?.message ||
                    "Failed to load tenants."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Stats
    |--------------------------------------------------------------------------
    */

    const tenantStats = [
        {
            label: "Total Tenants",
            value: tenants.length,
            description: "Organizations on platform",
        },
        {
            label: "Active Tenants",
            value: tenants.filter(
                (tenant) => tenant.status === "active"
            ).length,
            description: "Currently active",
        },
        {
            label: "Onboarding",
            value: tenants.filter(
                (tenant) => tenant.status === "onboarding"
            ).length,
            description: "Setup in progress",
        },
        {
            label: "Suspended",
            value: tenants.filter(
                (tenant) => tenant.status === "suspended"
            ).length,
            description: "Access restricted",
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Filtered Tenants
    |--------------------------------------------------------------------------
    */

    const filteredTenants = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return tenants.filter((tenant) => {
            const matchesSearch =
                !keyword ||
                tenant.name?.toLowerCase().includes(keyword) ||
                tenant.slug?.toLowerCase().includes(keyword) ||
                tenant.locale?.toLowerCase().includes(keyword) ||
                tenant.timezone?.toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === "all" ||
                tenant.status === statusFilter;

            /*
             * Current tenant API does not contain "plan".
             * Keep this ready for future API response.
             */
            const matchesPlan =
                planFilter === "all" ||
                tenant.plan === planFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPlan
            );
        });
    }, [
        tenants,
        search,
        statusFilter,
        planFilter,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredTenants.length / itemsPerPage
        )
    );

    const paginatedTenants = useMemo(() => {
        const startIndex =
            (currentPage - 1) * itemsPerPage;

        return filteredTenants.slice(
            startIndex,
            startIndex + itemsPerPage
        );
    }, [
        filteredTenants,
        currentPage,
    ]);

    /*
     * Reset page when search/filter changes
     */
    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        statusFilter,
        planFilter,
    ]);

    /*
     * Keep page valid after delete/filter
     */
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [
        currentPage,
        totalPages,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Pagination helpers
    |--------------------------------------------------------------------------
    */

    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= 5) {
            for (
                let i = 1;
                i <= totalPages;
                i++
            ) {
                pages.push(i);
            }

            return pages;
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, "...", totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [
                1,
                "...",
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages,
        ];
    };

    const startItem =
        filteredTenants.length === 0
            ? 0
            : (currentPage - 1) * itemsPerPage + 1;

    const endItem = Math.min(
        currentPage * itemsPerPage,
        filteredTenants.length
    );

    return (
        <div className="min-h-full bg-[#f8fafc]">

            {/* =====================================================
                PAGE HEADER
            ====================================================== */}

            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <div className="mb-2 flex items-center gap-2">

                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#19b5fe]/10">

                            <Building2
                                size={15}
                                className="text-[#19b5fe]"
                            />

                        </span>

                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#19b5fe]">
                            Organization Management
                        </span>

                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Tenants
                    </h1>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Manage organizations, administrators, workspace settings,
                        and tenant access across the platform.
                    </p>

                </div>

                {/* Add Tenant */}

                <button
                    type="button"
                    onClick={handleAddTenant}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#7046f5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7046f5]/20 transition hover:bg-[#825cf7] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#7046f5]/30"
                >
                    <Plus size={18} />
                    Add tenant
                </button>

            </div>

            {/* =====================================================
                STATS
            ====================================================== */}

            <div className="mb-6">
                <TenantStats stats={tenantStats} />
            </div>

            {/* =====================================================
                FILTERS
            ====================================================== */}

            <div className="mb-5">

                <TenantFilters
                    search={search}
                    setSearch={setSearch}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    planFilter={planFilter}
                    setPlanFilter={setPlanFilter}
                />

            </div>

            {/* =====================================================
                TENANT LIST
            ====================================================== */}

            <div>

                <div className="mb-3 flex items-center justify-between">

                    <div>

                        <h2 className="text-base font-semibold text-slate-900">
                            All tenants
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Organizations currently registered on your platform.
                        </p>

                    </div>

                    <span className="text-xs font-medium text-slate-400">
                        {filteredTenants.length}{" "}
                        {filteredTenants.length === 1
                            ? "organization"
                            : "organizations"}
                    </span>

                </div>

                {/* Loading */}

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">

                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#7046f5]" />

                        <p className="text-sm text-slate-500">
                            Loading tenants...
                        </p>

                    </div>
                ) : error ? (

                    /* Error */

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchTenants}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Try again
                        </button>

                    </div>
                ) : filteredTenants.length === 0 ? (

                    /* Empty */

                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">

                        <Building2
                            size={36}
                            className="mx-auto mb-4 text-slate-300"
                        />

                        <h3 className="text-sm font-semibold text-slate-800">
                            No tenants found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Try changing your search or filters.
                        </p>

                    </div>
                ) : (

                    <>

                        <TenantTable
                            tenants={paginatedTenants}
                            onRefresh={fetchTenants}
                        />

                        {/* =================================================
                            PAGINATION
                        ================================================== */}

                        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                            {/* Result info */}

                            <p className="text-xs text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-700">
                                    {startItem}
                                </span>{" "}
                                to{" "}
                                <span className="font-semibold text-slate-700">
                                    {endItem}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {filteredTenants.length}
                                </span>{" "}
                                organizations
                            </p>

                            {/* Pages */}

                            <div className="flex items-center gap-1">

                                {/* Previous */}

                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                page - 1
                                        )
                                    }
                                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                {/* Page numbers */}

                                {getPageNumbers().map(
                                    (page, index) =>
                                        page === "..." ? (
                                            <span
                                                key={`dots-${index}`}
                                                className="flex h-9 min-w-9 items-center justify-center text-xs text-slate-400"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                type="button"
                                                onClick={() =>
                                                    setCurrentPage(
                                                        page
                                                    )
                                                }
                                                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition ${
                                                    currentPage ===
                                                    page
                                                        ? "border-[#7046f5] bg-[#7046f5] text-white shadow-sm"
                                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                )}

                                {/* Next */}

                                <button
                                    type="button"
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                page + 1
                                        )
                                    }
                                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>

                            </div>

                        </div>

                    </>
                )}

            </div>

        </div>
    );
}

export default TenantsPage;