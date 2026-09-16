import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ClipboardCheck,
    LoaderCircle,
} from "lucide-react";

import api from "../../../api/axios";

import AccessReviewsHeader from "../../../component/admin/access-reviews/AccessReviewsHeader";
import AccessReviewsStats from "../../../component/admin/access-reviews/AccessReviewsStats";
import AccessReviewsTable from "../../../component/admin/access-reviews/AccessReviewsTable";
import AccessReviewCreateModal from "../../../component/admin/access-reviews/AccessReviewCreateModal";
import AccessReviewWorkspaceModal from "../../../component/admin/access-reviews/AccessReviewWorkspaceModal";
import AccessReviewsAlert from "../../../component/admin/access-reviews/AccessReviewsAlert";

const AccessReviewsPage = ({
    authData = null,
    authLoading = false,
}) => {
    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const permissions =
        currentTenant?.access?.permissions || [];

    const canManage =
        permissions.includes(
            "access_reviews.manage"
        );

    const canViewUsers =
        permissions.includes(
            "users.view"
        );

    const [reviews, setReviews] =
        useState([]);

    const [tenantUsers, setTenantUsers] =
        useState([]);

    const [roleOptions, setRoleOptions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);

    const [search, setSearch] =
        useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("all");

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [
        createOpen,
        setCreateOpen,
    ] = useState(false);

    const [
        workspaceReview,
        setWorkspaceReview,
    ] = useState(null);

    const clearMessages = () => {
        setError("");
        setMessage("");
    };

    const loadReviews = async (
        showLoader = true
    ) => {
        if (!tenantId) {
            setReviews([]);
            setLoading(false);
            return;
        }

        if (showLoader) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const response = await api.get(
                `/tenants/${tenantId}/access-reviews`,
                {
                    params: {
                        per_page: 100,
                    },
                }
            );

            const payload =
                response.data?.data || {};

            const rows =
                Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                      ? payload
                      : [];

            setReviews(rows);
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to load access reviews."
                )
            );
        } finally {
            if (showLoader) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    const loadTenantUsers = async () => {
        if (
            !tenantId ||
            !canViewUsers
        ) {
            return;
        }

        try {
            const response = await api.get(
                `/tenants/${tenantId}/users`
            );

            setTenantUsers(
                response.data?.data?.users || []
            );
        } catch (error) {
            console.error(
                "Unable to load tenant users:",
                error
            );
        }
    };

    const loadRoleOptions = async () => {
        if (!tenantId) {
            return;
        }

        try {
            const response = await api.get(
                `/tenants/${tenantId}/users/role-options`
            );

            const roles =
                response.data?.data?.roles || [];

            setRoleOptions(
                roles
                    .map((role) =>
                        typeof role === "string"
                            ? role
                            : role?.name
                    )
                    .filter(Boolean)
            );
        } catch (error) {
            console.error(
                "Unable to load role options:",
                error
            );
        }
    };

    useEffect(() => {
        if (authLoading) {
            return;
        }

        loadReviews();
        loadTenantUsers();
        loadRoleOptions();
    }, [
        authLoading,
        tenantId,
    ]);

    const fetchReview = async (
        reviewId
    ) => {
        const response = await api.get(
            `/tenants/${tenantId}/access-reviews/${reviewId}`
        );

        return (
            response.data?.data ||
            null
        );
    };

    const openReview = async (
        review
    ) => {
        clearMessages();
        setActionLoading(true);

        try {
            const detail =
                await fetchReview(
                    review.id
                );

            setWorkspaceReview(
                detail
            );
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to load access review."
                )
            );
        } finally {
            setActionLoading(false);
        }
    };

    const refreshWorkspace =
        async (reviewId) => {
            const detail =
                await fetchReview(
                    reviewId
                );

            setWorkspaceReview(
                detail
            );

            await loadReviews(false);

            return detail;
        };

    const handleCreate = async (
        form
    ) => {
        clearMessages();
        setActionLoading(true);

        try {
            const response =
                await api.post(
                    `/tenants/${tenantId}/access-reviews`,
                    form
                );

            setCreateOpen(false);

            setMessage(
                "Access review created successfully."
            );

            await loadReviews(false);

            return {
                ok: true,
                review:
                    response.data?.data,
            };
        } catch (error) {
            return {
                ok: false,
                message: getApiError(
                    error,
                    "Unable to create access review."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleStart = async (
        reviewId
    ) => {
        clearMessages();
        setActionLoading(true);

        try {
            await api.post(
                `/tenants/${tenantId}/access-reviews/${reviewId}/start`
            );

            await refreshWorkspace(
                reviewId
            );

            setMessage(
                "Access review started successfully."
            );

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                message: getApiError(
                    error,
                    "Unable to start access review."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecision = async (
        reviewId,
        itemId,
        payload
    ) => {
        clearMessages();
        setActionLoading(true);

        try {
            await api.patch(
                `/tenants/${tenantId}/access-reviews/${reviewId}/items/${itemId}`,
                payload
            );

            await refreshWorkspace(
                reviewId
            );

            setMessage(
                "Review decision saved successfully."
            );

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                message: getApiError(
                    error,
                    "Unable to save review decision."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async (
        reviewId
    ) => {
        clearMessages();
        setActionLoading(true);

        try {
            await api.post(
                `/tenants/${tenantId}/access-reviews/${reviewId}/complete`
            );

            await refreshWorkspace(
                reviewId
            );

            setMessage(
                "Access review completed successfully."
            );

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                message: getApiError(
                    error,
                    "Unable to complete access review."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async (
        reviewId
    ) => {
        clearMessages();
        setActionLoading(true);

        try {
            await api.post(
                `/tenants/${tenantId}/access-reviews/${reviewId}/cancel`
            );

            await refreshWorkspace(
                reviewId
            );

            setMessage(
                "Access review cancelled."
            );

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                message: getApiError(
                    error,
                    "Unable to cancel access review."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const filteredReviews =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();

            return reviews.filter(
                (review) => {
                    const matchesSearch =
                        !keyword ||
                        review.name
                            ?.toLowerCase()
                            .includes(
                                keyword
                            );

                    const matchesStatus =
                        statusFilter ===
                            "all" ||
                        review.status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            reviews,
            search,
            statusFilter,
        ]);

    const stats = useMemo(() => {
        return {
            total: reviews.length,

            draft: reviews.filter(
                (review) =>
                    review.status ===
                    "draft"
            ).length,

            inProgress:
                reviews.filter(
                    (review) =>
                        review.status ===
                        "in_progress"
                ).length,

            completed:
                reviews.filter(
                    (review) =>
                        review.status ===
                        "completed"
                ).length,
        };
    }, [reviews]);

    if (
        !authLoading &&
        !currentTenant
    ) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <ClipboardCheck
                    size={30}
                    className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                    No organization selected
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select an organization
                    before managing access
                    reviews.
                </p>
            </div>
        );
    }

    if (
        authLoading ||
        loading
    ) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={30}
                        className="mx-auto animate-spin text-[#19b5fe]"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading access reviews...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AccessReviewsHeader
                tenantName={
                    currentTenant?.name
                }
                refreshing={
                    refreshing
                }
                canManage={
                    canManage
                }
                onRefresh={() =>
                    loadReviews(false)
                }
                onCreate={() => {
                    clearMessages();
                    setCreateOpen(true);
                }}
            />

            {error && (
                <AccessReviewsAlert
                    type="error"
                    message={error}
                    onClose={() =>
                        setError("")
                    }
                />
            )}

            {message && (
                <AccessReviewsAlert
                    type="success"
                    message={message}
                    onClose={() =>
                        setMessage("")
                    }
                />
            )}

            <AccessReviewsStats
                stats={stats}
            />

            <AccessReviewsTable
                reviews={
                    filteredReviews
                }
                totalReviews={
                    reviews.length
                }
                search={search}
                setSearch={setSearch}
                statusFilter={
                    statusFilter
                }
                setStatusFilter={
                    setStatusFilter
                }
                loading={
                    actionLoading
                }
                onOpen={
                    openReview
                }
            />

            {createOpen && (
                <AccessReviewCreateModal
                    tenantUsers={
                        tenantUsers
                    }
                    loading={
                        actionLoading
                    }
                    onClose={() => {
                        if (
                            !actionLoading
                        ) {
                            setCreateOpen(
                                false
                            );
                        }
                    }}
                    onSubmit={
                        handleCreate
                    }
                />
            )}

            {workspaceReview && (
                <AccessReviewWorkspaceModal
                    review={
                        workspaceReview
                    }
                    tenantUsers={
                        tenantUsers
                    }
                    roleOptions={
                        roleOptions
                    }
                    canManage={
                        canManage
                    }
                    loading={
                        actionLoading
                    }
                    onClose={() => {
                        if (
                            !actionLoading
                        ) {
                            setWorkspaceReview(
                                null
                            );
                        }
                    }}
                    onStart={
                        handleStart
                    }
                    onDecision={
                        handleDecision
                    }
                    onComplete={
                        handleComplete
                    }
                    onCancel={
                        handleCancel
                    }
                />
            )}
        </div>
    );
};

const getApiError = (
    error,
    fallback
) => {
    const validationErrors =
        error.response?.data?.errors;

    if (validationErrors) {
        const first =
            Object.values(
                validationErrors
            )?.[0]?.[0];

        if (first) {
            return first;
        }
    }

    return (
        error.response?.data?.message ||
        fallback
    );
};

export default AccessReviewsPage;