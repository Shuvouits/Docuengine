import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ScrollText,
} from "lucide-react";

import api from "../../../api/axios";

import AuditLogsHeader from "../../../component/admin/audit-logs/AuditLogsHeader";
import AuditLogsStats from "../../../component/admin/audit-logs/AuditLogsStats";
import AuditLogsToolbar from "../../../component/admin/audit-logs/AuditLogsToolbar";
import AuditLogsTable from "../../../component/admin/audit-logs/AuditLogsTable";
import AuditEventDetailsModal from "../../../component/admin/audit-logs/AuditEventDetailsModal";
import ActivityTimelineModal from "../../../component/admin/audit-logs/ActivityTimelineModal";
import AuditLogsAlert from "../../../component/admin/audit-logs/AuditLogsAlert";

const emptyFilters = {
    action: "",
    category: "",
    actor_user_id: "",
    target_type: "",
    target_id: "",
    from: "",
    to: "",
};

const buildParams = (
    filters,
    page = null
) => {
    const params = {};

    if (page) {
        params.page = page;
        params.per_page = 25;
    }

    if (filters.action) {
        params.action =
            filters.action;
    }

    if (filters.category) {
        params.category =
            filters.category;
    }

    if (
        filters.actor_user_id.trim()
    ) {
        params.actor_user_id =
            filters.actor_user_id.trim();
    }

    if (
        filters.target_type.trim()
    ) {
        params.target_type =
            filters.target_type.trim();
    }

    if (
        filters.target_id.trim()
    ) {
        params.target_id =
            filters.target_id.trim();
    }

    if (filters.from) {
        params.from =
            `${filters.from} 00:00:00`;
    }

    if (filters.to) {
        params.to =
            `${filters.to} 23:59:59`;
    }

    return params;
};

const AuditLogsPage = ({
    authData = null,
    authLoading = false,
}) => {
    const currentTenant =
        authData?.current_tenant ||
        null;

    const tenantId =
        currentTenant?.id ||
        null;

    const permissions =
        currentTenant?.access
            ?.permissions || [];

    const canExport =
        permissions.includes(
            "audit.export"
        );

    /*
    |--------------------------------------------------------------------------
    | Audit Events
    |--------------------------------------------------------------------------
    */

    const [
        events,
        setEvents,
    ] = useState([]);

    const [
        pagination,
        setPagination,
    ] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 25,
    });

    const [
        draftFilters,
        setDraftFilters,
    ] = useState(
        emptyFilters
    );

    const [
        filters,
        setFilters,
    ] = useState(
        emptyFilters
    );

    const [
        page,
        setPage,
    ] = useState(1);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        exporting,
        setExporting,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Event Details
    |--------------------------------------------------------------------------
    */

    const [
        selectedEvent,
        setSelectedEvent,
    ] = useState(null);

    const [
        detailsLoadingId,
        setDetailsLoadingId,
    ] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Activity Timeline
    |--------------------------------------------------------------------------
    */

    const [
        activityEvents,
        setActivityEvents,
    ] = useState([]);

    const [
        activityTarget,
        setActivityTarget,
    ] = useState(null);

    const [
        activityOpen,
        setActivityOpen,
    ] = useState(false);

    const [
        activityLoadingId,
        setActivityLoadingId,
    ] = useState(null);

    const [
        activityModalLoading,
        setActivityModalLoading,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Alert
    |--------------------------------------------------------------------------
    */

    const [
        alert,
        setAlert,
    ] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Load Audit Events
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            authLoading ||
            !tenantId
        ) {
            return;
        }

        let cancelled = false;

        const loadEvents =
            async () => {
                setLoading(true);
                setAlert(null);

                try {
                    const response =
                        await api.get(
                            `/tenants/${tenantId}/audit-events`,
                            {
                                params:
                                    buildParams(
                                        filters,
                                        page
                                    ),
                            }
                        );

                    if (cancelled) {
                        return;
                    }

                    const payload =
                        response.data
                            ?.data || {};

                    const rows =
                        Array.isArray(
                            payload?.data
                        )
                            ? payload.data
                            : [];

                    setEvents(
                        rows
                    );

                    setPagination({
                        currentPage:
                            Number(
                                payload
                                    ?.current_page ||
                                    page
                            ),

                        lastPage:
                            Number(
                                payload
                                    ?.last_page ||
                                    1
                            ),

                        total:
                            Number(
                                payload
                                    ?.total ||
                                    rows.length
                            ),

                        perPage:
                            Number(
                                payload
                                    ?.per_page ||
                                    25
                            ),
                    });
                } catch (error) {
                    if (cancelled) {
                        return;
                    }

                    setEvents([]);

                    setAlert({
                        type: "error",
                        message:
                            error.response
                                ?.data
                                ?.message ||
                            "Audit events could not be loaded.",
                    });
                } finally {
                    if (!cancelled) {
                        setLoading(
                            false
                        );
                    }
                }
            };

        loadEvents();

        return () => {
            cancelled = true;
        };
    }, [
        authLoading,
        tenantId,
        filters,
        page,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Stats
    |--------------------------------------------------------------------------
    */

    const stats =
        useMemo(() => {
            return {
                total:
                    pagination.total,

                access:
                    events.filter(
                        (event) =>
                            event.category ===
                            "access"
                    ).length,

                archive:
                    events.filter(
                        (event) =>
                            event.category ===
                            "archive"
                    ).length,

                system:
                    events.filter(
                        (event) =>
                            event.category ===
                            "system"
                    ).length,
            };
        }, [
            events,
            pagination.total,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const handleFilterChange = (
        field,
        value
    ) => {
        setDraftFilters(
            (current) => ({
                ...current,
                [field]: value,
            })
        );
    };

    const handleApplyFilters =
        () => {
            setPage(1);

            setFilters({
                ...draftFilters,
            });
        };

    const handleResetFilters =
        () => {
            setPage(1);

            setDraftFilters(
                emptyFilters
            );

            setFilters(
                emptyFilters
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Event Details
    |--------------------------------------------------------------------------
    */

    const handleOpenEvent =
        async (event) => {
            if (
                !tenantId ||
                !event?.id
            ) {
                return;
            }

            setDetailsLoadingId(
                event.id
            );

            setAlert(null);

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/audit-events/${event.id}`
                    );

                const payload =
                    response.data
                        ?.data;

                const selected =
                    payload?.event ||
                    payload
                        ?.audit_event ||
                    (payload?.id
                        ? payload
                        : null);

                if (!selected) {
                    throw new Error(
                        "Audit event was not returned."
                    );
                }

                setSelectedEvent(
                    selected
                );
            } catch (error) {
                setAlert({
                    type: "error",
                    message:
                        error.response
                            ?.data
                            ?.message ||
                        "Audit event details could not be loaded.",
                });
            } finally {
                setDetailsLoadingId(
                    null
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Activity Timeline
    |--------------------------------------------------------------------------
    */

    const handleOpenActivity =
        async (event) => {
            if (
                !tenantId ||
                !event
                    ?.target_type ||
                !event?.target_id
            ) {
                return;
            }

            setActivityLoadingId(
                event.id
            );

            setActivityModalLoading(
                true
            );

            setActivityEvents(
                []
            );

            setActivityTarget({
                type:
                    event.target_type,

                id:
                    event.target_id,

                label:
                    event.target_label ||
                    event.target_id,
            });

            setActivityOpen(
                true
            );

            setAlert(null);

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/audit-events/activity/${encodeURIComponent(
                            event.target_type
                        )}/${encodeURIComponent(
                            event.target_id
                        )}`
                    );

                const payload =
                    response.data
                        ?.data;

                let rows = [];

                if (
                    Array.isArray(
                        payload?.data
                    )
                ) {
                    rows =
                        payload.data;
                } else if (
                    Array.isArray(
                        payload
                            ?.events
                    )
                ) {
                    rows =
                        payload.events;
                } else if (
                    Array.isArray(
                        payload
                            ?.activity
                    )
                ) {
                    rows =
                        payload.activity;
                } else if (
                    Array.isArray(
                        payload
                    )
                ) {
                    rows =
                        payload;
                }

                setActivityEvents(
                    rows
                );
            } catch (error) {
                setActivityOpen(
                    false
                );

                setActivityEvents(
                    []
                );

                setActivityTarget(
                    null
                );

                setAlert({
                    type: "error",
                    message:
                        error.response
                            ?.data
                            ?.message ||
                        "Resource activity could not be loaded.",
                });
            } finally {
                setActivityLoadingId(
                    null
                );

                setActivityModalLoading(
                    false
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | CSV Export
    |--------------------------------------------------------------------------
    */

    const handleExport =
        async () => {
            if (
                !tenantId ||
                !canExport ||
                exporting
            ) {
                return;
            }

            setExporting(
                true
            );

            setAlert(null);

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/audit-events/export`,
                        {
                            params:
                                buildParams(
                                    filters
                                ),

                            responseType:
                                "blob",
                        }
                    );

                const blob =
                    new Blob(
                        [
                            response.data,
                        ],
                        {
                            type:
                                "text/csv;charset=utf-8;",
                        }
                    );

                const url =
                    window.URL
                        .createObjectURL(
                            blob
                        );

                const link =
                    document
                        .createElement(
                            "a"
                        );

                const date =
                    new Date()
                        .toISOString()
                        .slice(
                            0,
                            10
                        );

                link.href =
                    url;

                link.download =
                    `audit-events-${date}.csv`;

                document.body
                    .appendChild(
                        link
                    );

                link.click();

                link.remove();

                window.URL
                    .revokeObjectURL(
                        url
                    );

                setAlert({
                    type: "success",
                    message:
                        "Audit events exported successfully.",
                });
            } catch (error) {
                setAlert({
                    type: "error",
                    message:
                        error.response
                            ?.data
                            ?.message ||
                        "Audit events could not be exported.",
                });
            } finally {
                setExporting(
                    false
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | No Tenant
    |--------------------------------------------------------------------------
    */

    if (
        !authLoading &&
        !currentTenant
    ) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <ScrollText
                    size={30}
                    className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                    No organization selected
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select an organization
                    before reviewing audit
                    activity.
                </p>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Auth Loading
    |--------------------------------------------------------------------------
    */

    if (authLoading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-sm font-medium text-slate-500">
                    Loading audit logs...
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (
        <div className="space-y-6">
            <AuditLogsHeader
                canExport={
                    canExport
                }
                exporting={
                    exporting
                }
                onExport={
                    handleExport
                }
            />

            {alert && (
                <AuditLogsAlert
                    type={
                        alert.type
                    }
                    message={
                        alert.message
                    }
                    onClose={() =>
                        setAlert(
                            null
                        )
                    }
                />
            )}

            <AuditLogsStats
                stats={stats}
            />

            <AuditLogsToolbar
                filters={
                    draftFilters
                }
                onChange={
                    handleFilterChange
                }
                onApply={
                    handleApplyFilters
                }
                onReset={
                    handleResetFilters
                }
                loading={
                    loading
                }
            />

            <AuditLogsTable
                events={
                    events
                }
                loading={
                    loading
                }
                detailsLoadingId={
                    detailsLoadingId
                }
                activityLoadingId={
                    activityLoadingId
                }
                onOpen={
                    handleOpenEvent
                }
                onActivity={
                    handleOpenActivity
                }
                pagination={
                    pagination
                }
                onPrevious={() => {
                    if (
                        page > 1
                    ) {
                        setPage(
                            (
                                current
                            ) =>
                                current -
                                1
                        );
                    }
                }}
                onNext={() => {
                    if (
                        page <
                        pagination.lastPage
                    ) {
                        setPage(
                            (
                                current
                            ) =>
                                current +
                                1
                        );
                    }
                }}
            />

            <AuditEventDetailsModal
                event={
                    selectedEvent
                }
                open={Boolean(
                    selectedEvent
                )}
                onClose={() =>
                    setSelectedEvent(
                        null
                    )
                }
            />

            <ActivityTimelineModal
                open={
                    activityOpen
                }
                loading={
                    activityModalLoading
                }
                events={
                    activityEvents
                }
                target={
                    activityTarget
                }
                onClose={() => {
                    setActivityOpen(
                        false
                    );

                    setActivityEvents(
                        []
                    );

                    setActivityTarget(
                        null
                    );
                }}
            />
        </div>
    );
};

export default AuditLogsPage;