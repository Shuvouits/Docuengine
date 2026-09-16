import { useEffect, useMemo, useState } from "react";

import api from "../../../api/axios";

import SecurityEventsHeader from "../../../component/admin/security-events/SecurityEventsHeader";
import SecurityEventsStats from "../../../component/admin/security-events/SecurityEventsStats";
import SecurityEventsToolbar from "../../../component/admin/security-events/SecurityEventsToolbar";
import SecurityEventsTable from "../../../component/admin/security-events/SecurityEventsTable";
import SecurityEventDetailsModal from "../../../component/admin/security-events/SecurityEventDetailsModal";
import SecurityEventsAlert from "../../../component/admin/security-events/SecurityEventsAlert";

const emptyFilters = {
    event_type: "",
    category: "",
    severity: "",
    from: "",
    to: "",
};

const SecurityEventsPage = ({
    authData,
    authLoading,
}) => {
    const tenantId = authData?.current_tenant?.id;

    const [events, setEvents] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 25,
    });

    const [draftFilters, setDraftFilters] = useState(emptyFilters);
    const [filters, setFilters] = useState(emptyFilters);

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [detailsLoadingId, setDetailsLoadingId] = useState(null);

    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (!tenantId) {
            return;
        }

        let cancelled = false;

        const fetchEvents = async () => {
            setLoading(true);
            setAlert(null);

            try {
                const params = {
                    per_page: 25,
                    page,
                };

                if (filters.event_type.trim()) {
                    params.event_type = filters.event_type.trim();
                }

                if (filters.category) {
                    params.category = filters.category;
                }

                if (filters.severity) {
                    params.severity = filters.severity;
                }

                if (filters.from) {
                    params.from = `${filters.from} 00:00:00`;
                }

                if (filters.to) {
                    params.to = `${filters.to} 23:59:59`;
                }

                const response = await api.get(
                    `/tenants/${tenantId}/security-events`,
                    {
                        params,
                    }
                );

                if (cancelled) {
                    return;
                }

                const payload = response.data?.data || {};

                const rows = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];

                setEvents(rows);

                setPagination({
                    currentPage: Number(payload?.current_page || page),
                    lastPage: Number(payload?.last_page || 1),
                    total: Number(payload?.total || rows.length),
                    perPage: Number(payload?.per_page || 25),
                });
            } catch (error) {
                if (cancelled) {
                    return;
                }

                setEvents([]);

                setAlert({
                    type: "error",
                    message:
                        error.response?.data?.message ||
                        "Security events could not be loaded.",
                });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchEvents();

        return () => {
            cancelled = true;
        };
    }, [
        tenantId,
        page,
        filters,
    ]);

    const stats = useMemo(() => {
        return {
            total: pagination.total,
            info: events.filter(
                (event) => event.severity === "info"
            ).length,
            warning: events.filter(
                (event) => event.severity === "warning"
            ).length,
            critical: events.filter(
                (event) => event.severity === "critical"
            ).length,
        };
    }, [
        events,
        pagination.total,
    ]);

    const handleFilterChange = (
        field,
        value
    ) => {
        setDraftFilters((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleApplyFilters = () => {
        setPage(1);

        setFilters({
            ...draftFilters,
        });
    };

    const handleResetFilters = () => {
        setPage(1);
        setDraftFilters(emptyFilters);
        setFilters(emptyFilters);
    };

    const handleOpenEvent = async (
        event
    ) => {
        if (!tenantId || !event?.id) {
            return;
        }

        setDetailsLoadingId(event.id);
        setAlert(null);

        try {
            const response = await api.get(
                `/tenants/${tenantId}/security-events/${event.id}`
            );

            const selected =
                response.data?.data?.event || null;

            if (!selected) {
                throw new Error(
                    "Security event was not returned."
                );
            }

            setSelectedEvent(selected);
        } catch (error) {
            setAlert({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Security event details could not be loaded.",
            });
        } finally {
            setDetailsLoadingId(null);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-sm font-medium text-slate-500">
                    Loading security events...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SecurityEventsHeader />

            {alert && (
                <SecurityEventsAlert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <SecurityEventsStats
                stats={stats}
            />

            <SecurityEventsToolbar
                filters={draftFilters}
                onChange={handleFilterChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                loading={loading}
            />

            <SecurityEventsTable
                events={events}
                loading={loading}
                detailsLoadingId={detailsLoadingId}
                onOpen={handleOpenEvent}
                pagination={pagination}
                onPrevious={() => {
                    if (page > 1) {
                        setPage((current) => current - 1);
                    }
                }}
                onNext={() => {
                    if (page < pagination.lastPage) {
                        setPage((current) => current + 1);
                    }
                }}
            />

            <SecurityEventDetailsModal
                event={selectedEvent}
                open={Boolean(selectedEvent)}
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    );
};

export default SecurityEventsPage;