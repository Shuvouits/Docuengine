import {
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    RotateCcw,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";

import CompaniesHeader from "../../../component/admin/companies/CompaniesHeader";
import CompaniesStats from "../../../component/admin/companies/CompaniesStats";
import CompaniesToolbar from "../../../component/admin/companies/CompaniesToolbar";
import CompaniesTable from "../../../component/admin/companies/CompaniesTable";
import CompanyFormModal from "../../../component/admin/companies/CompanyFormModal";
import CompanyArchiveModal from "../../../component/admin/companies/CompanyArchiveModal";
import CompaniesAlert from "../../../component/admin/companies/CompaniesAlert";

/*
|--------------------------------------------------------------------------
| API Error
|--------------------------------------------------------------------------
*/

const getApiError = (
    error,
    fallback = "Something went wrong."
) => {
    const validationErrors =
        error?.response?.data?.errors;

    if (validationErrors) {
        const firstError =
            Object.values(
                validationErrors
            )?.[0]?.[0];

        if (firstError) {
            return firstError;
        }
    }

    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
};

/*
|--------------------------------------------------------------------------
| Request Payload
|--------------------------------------------------------------------------
*/

const prepareCompanyPayload = (
    form,
    isEditing = false
) => {
    const payload = {
        name:
            form.name?.trim() || "",

        legal_name:
            form.legal_name?.trim() || null,

        website:
            form.website?.trim() || null,

        primary_contact_name:
            form.primary_contact_name?.trim() ||
            null,

        primary_contact_email:
            form.primary_contact_email?.trim() ||
            null,

        primary_contact_phone:
            form.primary_contact_phone?.trim() ||
            null,

        address_line1:
            form.address_line1?.trim() ||
            null,

        address_line2:
            form.address_line2?.trim() ||
            null,

        city:
            form.city?.trim() || null,

        state_region:
            form.state_region?.trim() ||
            null,

        postal_code:
            form.postal_code?.trim() ||
            null,

        country:
            form.country?.trim() ||
            null,

        description:
            form.description?.trim() ||
            null,

        notes:
            form.notes?.trim() || null,

        status:
            form.status || "active",
    };

    /*
    |--------------------------------------------------------------------------
    | Slug
    |--------------------------------------------------------------------------
    |
    | Create-এর সময় slug blank হলে backend company name থেকে generate করবে।
    | Edit-এর সময় existing slug পাঠানো হবে।
    |
    */

    const slug =
        form.slug?.trim();

    if (slug) {
        payload.slug = slug;
    } else if (isEditing) {
        /*
        |--------------------------------------------------------------------------
        | Important
        |--------------------------------------------------------------------------
        |
        | Edit modal-এ normally existing slug থাকবে।
        | Blank করে দিলে slug field পাঠাবো না।
        |
        */
        delete payload.slug;
    }

    return payload;
};

function CompaniesPage({
    authData = null,
    authLoading = false,
}) {
    const navigate = useNavigate();

    /*
    |--------------------------------------------------------------------------
    | Tenant
    |--------------------------------------------------------------------------
    */

    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    /*
    |--------------------------------------------------------------------------
    | Permissions
    |--------------------------------------------------------------------------
    */

    const permissions =
        currentTenant?.access?.permissions ||
        [];

    const canCreate =
        permissions.includes(
            "companies.create"
        );

    const canUpdate =
        permissions.includes(
            "companies.update"
        );

    const canArchive =
        permissions.includes(
            "companies.archive"
        );

    const canRestore =
        permissions.includes(
            "companies.restore"
        );

    /*
    |--------------------------------------------------------------------------
    | Data
    |--------------------------------------------------------------------------
    */

    const [companies, setCompanies] =
        useState([]);

    const [summary, setSummary] =
        useState({
            total: 0,
            active: 0,
            inactive: 0,
            archived: 0,
        });

    const [pagination, setPagination] =
        useState({
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 0,
            from: null,
            to: null,
        });

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] =
        useState("");

    const [
        debouncedSearch,
        setDebouncedSearch,
    ] = useState("");

    const [status, setStatus] =
        useState("all");

    const [sortBy, setSortBy] =
        useState("name");

    const [
        sortDirection,
        setSortDirection,
    ] = useState("asc");

    const [page, setPage] =
        useState(1);

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [archiving, setArchiving] =
        useState(false);

    const [
        restoringCompanyId,
        setRestoringCompanyId,
    ] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Modals
    |--------------------------------------------------------------------------
    */

    const [
        createModalOpen,
        setCreateModalOpen,
    ] = useState(false);

    const [
        editingCompany,
        setEditingCompany,
    ] = useState(null);

    const [
        archiveCompany,
        setArchiveCompany,
    ] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Messages
    |--------------------------------------------------------------------------
    */

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const clearMessages = () => {
        setError("");
        setMessage("");
    };

    /*
    |--------------------------------------------------------------------------
    | Search Debounce
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const timer =
            setTimeout(() => {
                setDebouncedSearch(
                    search.trim()
                );

                setPage(1);
            }, 350);

        return () =>
            clearTimeout(timer);
    }, [search]);

    /*
    |--------------------------------------------------------------------------
    | Load Companies
    |--------------------------------------------------------------------------
    */

    const loadCompanies =
        useCallback(
            async (
                showLoader = true
            ) => {
                if (!tenantId) {
                    setCompanies([]);
                    setLoading(false);
                    return;
                }

                if (showLoader) {
                    setLoading(true);
                }

                setError("");

                try {
                    const params = {
                        page,
                        per_page: 20,
                        sort_by: sortBy,
                        sort_direction:
                            sortDirection,
                    };

                    if (debouncedSearch) {
                        params.search =
                            debouncedSearch;
                    }

                    if (
                        status !== "all"
                    ) {
                        params.status =
                            status;
                    }

                    const response =
                        await api.get(
                            `/tenants/${tenantId}/companies`,
                            {
                                params,
                            }
                        );

                    setCompanies(
                        response.data?.data
                            ?.companies || []
                    );

                    setPagination(
                        response.data?.data
                            ?.pagination || {
                            current_page: 1,
                            last_page: 1,
                            per_page: 20,
                            total: 0,
                            from: null,
                            to: null,
                        }
                    );
                } catch (error) {
                    setCompanies([]);

                    setError(
                        getApiError(
                            error,
                            "Unable to load companies."
                        )
                    );
                } finally {
                    if (showLoader) {
                        setLoading(false);
                    }
                }
            },
            [
                tenantId,
                page,
                debouncedSearch,
                status,
                sortBy,
                sortDirection,
            ]
        );

    /*
    |--------------------------------------------------------------------------
    | Load Summary
    |--------------------------------------------------------------------------
    */

    const loadSummary =
        useCallback(async () => {
            if (!tenantId) {
                return;
            }

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/companies/summary`
                    );

                setSummary(
                    response.data?.data
                        ?.summary || {
                        total: 0,
                        active: 0,
                        inactive: 0,
                        archived: 0,
                    }
                );
            } catch (error) {
                console.error(
                    "Unable to load company summary:",
                    error
                );
            }
        }, [tenantId]);

    /*
    |--------------------------------------------------------------------------
    | Initial / Filter Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            authLoading ||
            !tenantId
        ) {
            return;
        }

        loadCompanies();
    }, [
        authLoading,
        tenantId,
        loadCompanies,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Summary Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            authLoading ||
            !tenantId
        ) {
            return;
        }

        loadSummary();
    }, [
        authLoading,
        tenantId,
        loadSummary,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Refresh
    |--------------------------------------------------------------------------
    */

    const handleRefresh =
        async () => {
            if (!tenantId) {
                return;
            }

            setRefreshing(true);

            clearMessages();

            try {
                await Promise.all([
                    loadCompanies(false),
                    loadSummary(),
                ]);
            } finally {
                setRefreshing(false);
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    const handleCreate =
        async (form) => {
            if (!tenantId) {
                return {
                    ok: false,
                    message:
                        "No organization selected.",
                };
            }

            setSaving(true);
            clearMessages();

            try {
                const payload =
                    prepareCompanyPayload(
                        form,
                        false
                    );

                await api.post(
                    `/tenants/${tenantId}/companies`,
                    payload
                );

                setCreateModalOpen(false);

                setMessage(
                    "Company created successfully."
                );

                setPage(1);

                await Promise.all([
                    loadCompanies(false),
                    loadSummary(),
                ]);

                return {
                    ok: true,
                };
            } catch (error) {
                return {
                    ok: false,

                    message:
                        getApiError(
                            error,
                            "Unable to create company."
                        ),
                };
            } finally {
                setSaving(false);
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    const handleUpdate =
        async (form) => {
            if (
                !tenantId ||
                !editingCompany?.id
            ) {
                return {
                    ok: false,
                    message:
                        "Company could not be identified.",
                };
            }

            setSaving(true);
            clearMessages();

            try {
                const payload =
                    prepareCompanyPayload(
                        form,
                        true
                    );

                await api.patch(
                    `/tenants/${tenantId}/companies/${editingCompany.id}`,
                    payload
                );

                setEditingCompany(null);

                setMessage(
                    "Company updated successfully."
                );

                await Promise.all([
                    loadCompanies(false),
                    loadSummary(),
                ]);

                return {
                    ok: true,
                };
            } catch (error) {
                return {
                    ok: false,

                    message:
                        getApiError(
                            error,
                            "Unable to update company."
                        ),
                };
            } finally {
                setSaving(false);
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Archive
    |--------------------------------------------------------------------------
    */

    const handleArchive =
        async (
            company,
            reason
        ) => {
            if (
                !tenantId ||
                !company?.id
            ) {
                return {
                    ok: false,
                    message:
                        "Company could not be identified.",
                };
            }

            setArchiving(true);
            clearMessages();

            try {
                await api.delete(
                    `/tenants/${tenantId}/companies/${company.id}`,
                    {
                        data: {
                            reason:
                                reason?.trim() ||
                                null,
                        },
                    }
                );

                setArchiveCompany(null);

                setMessage(
                    "Company archived successfully."
                );

                /*
                |--------------------------------------------------------------------------
                | Current Page Check
                |--------------------------------------------------------------------------
                */

                if (
                    companies.length === 1 &&
                    page > 1
                ) {
                    setPage(
                        (current) =>
                            current - 1
                    );
                } else {
                    await loadCompanies(
                        false
                    );
                }

                await loadSummary();

                return {
                    ok: true,
                };
            } catch (error) {
                return {
                    ok: false,

                    message:
                        getApiError(
                            error,
                            "Unable to archive company."
                        ),
                };
            } finally {
                setArchiving(false);
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Restore
    |--------------------------------------------------------------------------
    */

    const handleRestore =
        async (company) => {
            if (
                !tenantId ||
                !company?.id ||
                restoringCompanyId
            ) {
                return;
            }

            setRestoringCompanyId(
                company.id
            );

            clearMessages();

            try {
                await api.post(
                    `/tenants/${tenantId}/companies/${company.id}/restore`
                );

                setMessage(
                    `${company.name} restored successfully.`
                );

                await Promise.all([
                    loadCompanies(false),
                    loadSummary(),
                ]);
            } catch (error) {
                setError(
                    getApiError(
                        error,
                        "Unable to restore company."
                    )
                );
            } finally {
                setRestoringCompanyId(
                    null
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Open Workspace
    |--------------------------------------------------------------------------
    */

    const handleOpen =
        (company) => {
            if (!company?.id) {
                return;
            }

            navigate(
                `/admin/companies/${company.id}/workspace`
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Filter Changes
    |--------------------------------------------------------------------------
    */

    const handleStatusChange =
        (value) => {
            setStatus(value);
            setPage(1);
        };

    const handleSortByChange =
        (value) => {
            setSortBy(value);
            setPage(1);
        };

    const handleSortDirectionChange =
        (value) => {
            setSortDirection(value);
            setPage(1);
        };

    const handleClearFilters =
        () => {
            setSearch("");
            setDebouncedSearch("");
            setStatus("all");
            setSortBy("name");
            setSortDirection("asc");
            setPage(1);
        };

    /*
    |--------------------------------------------------------------------------
    | Loading Auth
    |--------------------------------------------------------------------------
    */

    if (authLoading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={30}
                        className="mx-auto animate-spin text-[#19b5fe]"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading companies...
                    </p>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | No Tenant
    |--------------------------------------------------------------------------
    */

    if (!currentTenant) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h2 className="font-bold text-slate-900">
                    No organization selected
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select an organization to
                    manage companies.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">

                {/* Header */}
                <CompaniesHeader
                    canCreate={canCreate}
                    refreshing={refreshing}
                    onCreate={() => {
                        clearMessages();
                        setCreateModalOpen(
                            true
                        );
                    }}
                    onRefresh={
                        handleRefresh
                    }
                />

                {/* Alerts */}
                {error && (
                    <CompaniesAlert
                        type="error"
                        message={error}
                        onClose={() =>
                            setError("")
                        }
                    />
                )}

                {message && (
                    <CompaniesAlert
                        type="success"
                        message={message}
                        onClose={() =>
                            setMessage("")
                        }
                    />
                )}

                {/* Stats */}
                <CompaniesStats
                    summary={summary}
                />

                {/* Toolbar */}
                <CompaniesToolbar
                    search={search}
                    status={status}
                    sortBy={sortBy}
                    sortDirection={
                        sortDirection
                    }
                    onSearchChange={
                        setSearch
                    }
                    onStatusChange={
                        handleStatusChange
                    }
                    onSortByChange={
                        handleSortByChange
                    }
                    onSortDirectionChange={
                        handleSortDirectionChange
                    }
                    onClear={
                        handleClearFilters
                    }
                />

                {/* Table */}
                <div className="relative">
                    <CompaniesTable
                        companies={
                            companies
                        }
                        loading={loading}
                        canUpdate={
                            canUpdate
                        }
                        canArchive={
                            canArchive
                        }
                        canRestore={
                            canRestore
                        }
                        onOpen={
                            handleOpen
                        }
                        onEdit={(
                            company
                        ) => {
                            clearMessages();

                            setEditingCompany(
                                company
                            );
                        }}
                        onArchive={(
                            company
                        ) => {
                            clearMessages();

                            setArchiveCompany(
                                company
                            );
                        }}
                        onRestore={
                            handleRestore
                        }
                    />

                    {/* Restore Overlay */}
                    {restoringCompanyId && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[1px]">
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-lg">
                                <RotateCcw
                                    size={16}
                                    className="animate-spin text-emerald-500"
                                />

                                Restoring company...
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading &&
                    pagination.total >
                        0 && (
                        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-700">
                                    {pagination.from ??
                                        0}
                                </span>{" "}
                                to{" "}
                                <span className="font-semibold text-slate-700">
                                    {pagination.to ??
                                        0}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {
                                        pagination.total
                                    }
                                </span>{" "}
                                companies
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={
                                        pagination.current_page <=
                                            1 ||
                                        loading
                                    }
                                    onClick={() =>
                                        setPage(
                                            (
                                                current
                                            ) =>
                                                Math.max(
                                                    1,
                                                    current -
                                                        1
                                                )
                                        )
                                    }
                                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft
                                        size={
                                            16
                                        }
                                    />

                                    Previous
                                </button>

                                <div className="flex h-9 min-w-[90px] items-center justify-center rounded-lg bg-slate-50 px-3 text-xs font-semibold text-slate-600">
                                    Page{" "}
                                    {
                                        pagination.current_page
                                    }{" "}
                                    of{" "}
                                    {
                                        pagination.last_page
                                    }
                                </div>

                                <button
                                    type="button"
                                    disabled={
                                        pagination.current_page >=
                                            pagination.last_page ||
                                        loading
                                    }
                                    onClick={() =>
                                        setPage(
                                            (
                                                current
                                            ) =>
                                                Math.min(
                                                    pagination.last_page,
                                                    current +
                                                        1
                                                )
                                        )
                                    }
                                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next

                                    <ChevronRight
                                        size={
                                            16
                                        }
                                    />
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {/* Create Modal */}
            <CompanyFormModal
                open={createModalOpen}
                company={null}
                saving={saving}
                onClose={() => {
                    if (!saving) {
                        setCreateModalOpen(
                            false
                        );
                    }
                }}
                onSubmit={handleCreate}
            />

            {/* Edit Modal */}
            <CompanyFormModal
                open={
                    Boolean(
                        editingCompany
                    )
                }
                company={
                    editingCompany
                }
                saving={saving}
                onClose={() => {
                    if (!saving) {
                        setEditingCompany(
                            null
                        );
                    }
                }}
                onSubmit={handleUpdate}
            />

            {/* Archive Modal */}
            <CompanyArchiveModal
                company={
                    archiveCompany
                }
                archiving={
                    archiving
                }
                onClose={() => {
                    if (!archiving) {
                        setArchiveCompany(
                            null
                        );
                    }
                }}
                onArchive={
                    handleArchive
                }
            />
        </>
    );
}

export default CompaniesPage;