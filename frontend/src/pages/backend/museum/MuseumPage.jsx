import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Archive,
} from "lucide-react";

import api from "../../../api/axios";

import MuseumHeader from "../../../component/admin/museum/MuseumHeader";
import MuseumStats from "../../../component/admin/museum/MuseumStats";
import MuseumTable from "../../../component/admin/museum/MuseumTable";
import MuseumDetailsModal from "../../../component/admin/museum/MuseumDetailsModal";
import PermanentDeleteModal from "../../../component/admin/museum/PermanentDeleteModal";

const MuseumPage = ({
    authData = null,
    authLoading = false,
}) => {
    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const permissions =
        currentTenant?.access?.permissions || [];

    const canRestore =
        permissions.includes(
            "archive.restore"
        );

    const canDeletePermanently =
        permissions.includes(
            "archive.delete_permanently"
        );

    const [entries, setEntries] =
        useState([]);

    const [
        pagination,
        setPagination,
    ] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 25,
    });

    const [page, setPage] =
        useState(1);

    const [loading, setLoading] =
        useState(true);

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);

    const [
        selectedEntry,
        setSelectedEntry,
    ] = useState(null);

    const [
        deleteEntry,
        setDeleteEntry,
    ] = useState(null);

    const [
        detailsLoadingId,
        setDetailsLoadingId,
    ] = useState(null);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const loadArchive = useCallback(
        async (
            showLoader = true
        ) => {
            if (!tenantId) {
                setEntries([]);
                setLoading(false);
                return;
            }

            if (showLoader) {
                setLoading(true);
            }

            setError("");

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/archive`,
                        {
                            params: {
                                page,
                                per_page: 25,
                            },
                        }
                    );

                const payload =
                    response.data?.data || {};

                const paginator =
                    payload?.archive_entries ||
                    payload;

                const rows =
                    Array.isArray(
                        paginator?.data
                    )
                        ? paginator.data
                        : Array.isArray(
                              paginator
                          )
                          ? paginator
                          : [];

                setEntries(rows);

                setPagination({
                    currentPage: Number(
                        paginator?.current_page ||
                            page
                    ),

                    lastPage: Number(
                        paginator?.last_page || 1
                    ),

                    total: Number(
                        paginator?.total ||
                            rows.length
                    ),

                    perPage: Number(
                        paginator?.per_page || 25
                    ),
                });
            } catch (error) {
                setEntries([]);

                setError(
                    error.response?.data
                        ?.message ||
                        "Archived resources could not be loaded."
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
        ]
    );

    useEffect(() => {
        if (authLoading) {
            return;
        }

        loadArchive();
    }, [
        authLoading,
        loadArchive,
    ]);

    const stats = useMemo(() => {
        const resourceTypes =
            new Set(
                entries
                    .map(
                        (entry) =>
                            entry.resource_type
                    )
                    .filter(Boolean)
            );

        return {
            total:
                pagination.total,

            securityGroups:
                entries.filter(
                    (entry) =>
                        entry.resource_type ===
                        "security_group"
                ).length,

            withReason:
                entries.filter(
                    (entry) =>
                        Boolean(
                            entry.reason
                        )
                ).length,

            resourceTypes:
                resourceTypes.size,
        };
    }, [
        entries,
        pagination.total,
    ]);

    const handleOpenEntry =
        async (entry) => {
            if (
                !tenantId ||
                !entry?.id
            ) {
                return;
            }

            setDetailsLoadingId(
                entry.id
            );

            setError("");
            setMessage("");

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/archive/${entry.id}`
                    );

                const selected =
                    response.data?.data
                        ?.archive_entry ||
                    null;

                if (!selected) {
                    throw new Error(
                        "Archived resource was not returned."
                    );
                }

                setSelectedEntry(
                    selected
                );
            } catch (error) {
                setError(
                    error.response?.data
                        ?.message ||
                        "Archived resource details could not be loaded."
                );
            } finally {
                setDetailsLoadingId(
                    null
                );
            }
        };

    const handleRestore =
        async (entry) => {
            if (
                !tenantId ||
                !entry?.resource_id ||
                entry.resource_type !==
                    "security_group" ||
                !canRestore
            ) {
                return;
            }

            setActionLoading(true);
            setError("");
            setMessage("");

            try {
                await api.patch(
                    `/tenants/${tenantId}/security-groups/${entry.resource_id}/restore`
                );

                setSelectedEntry(null);

                setMessage(
                    `${entry.resource_label || "Resource"} restored successfully.`
                );

                await loadArchive(false);
            } catch (error) {
                setError(
                    error.response?.data
                        ?.message ||
                        "Archived resource could not be restored."
                );
            } finally {
                setActionLoading(false);
            }
        };

    const handleRequestPermanentDelete =
        (entry) => {
            if (
                !canDeletePermanently ||
                !entry
            ) {
                return;
            }

            setDeleteEntry(entry);
        };

    const handlePermanentDelete =
        async () => {
            if (
                !tenantId ||
                !deleteEntry?.resource_id ||
                deleteEntry.resource_type !==
                    "security_group" ||
                !canDeletePermanently
            ) {
                return;
            }

            setActionLoading(true);
            setError("");
            setMessage("");

            try {
                await api.delete(
                    `/tenants/${tenantId}/security-groups/${deleteEntry.resource_id}/permanent`
                );

                const deletedLabel =
                    deleteEntry.resource_label ||
                    "Resource";

                setDeleteEntry(null);
                setSelectedEntry(null);

                setMessage(
                    `${deletedLabel} permanently deleted.`
                );

                await loadArchive(false);
            } catch (error) {
                setError(
                    error.response?.data
                        ?.message ||
                        "Archived resource could not be permanently deleted."
                );
            } finally {
                setActionLoading(false);
            }
        };

    if (
        !authLoading &&
        !currentTenant
    ) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <Archive
                    size={30}
                    className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                    No organization selected
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select an organization
                    before reviewing archived
                    resources.
                </p>
            </div>
        );
    }

    if (authLoading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-sm font-medium text-slate-500">
                    Loading Museum...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <MuseumHeader />

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                    {error}
                </div>
            )}

            {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    {message}
                </div>
            )}

            <MuseumStats
                stats={stats}
            />

            <MuseumTable
                entries={entries}
                loading={loading}
                detailsLoadingId={
                    detailsLoadingId
                }
                onOpen={
                    handleOpenEntry
                }
                pagination={
                    pagination
                }
                onPrevious={() => {
                    if (page > 1) {
                        setPage(
                            (current) =>
                                current - 1
                        );
                    }
                }}
                onNext={() => {
                    if (
                        page <
                        pagination.lastPage
                    ) {
                        setPage(
                            (current) =>
                                current + 1
                        );
                    }
                }}
            />

            <MuseumDetailsModal
                entry={
                    selectedEntry
                }
                open={Boolean(
                    selectedEntry
                )}
                onClose={() => {
                    if (
                        !actionLoading
                    ) {
                        setSelectedEntry(
                            null
                        );
                    }
                }}
                canRestore={
                    canRestore
                }
                canDeletePermanently={
                    canDeletePermanently
                }
                actionLoading={
                    actionLoading
                }
                onRestore={
                    handleRestore
                }
                onDeletePermanently={
                    handleRequestPermanentDelete
                }
            />

            <PermanentDeleteModal
                entry={
                    deleteEntry
                }
                open={Boolean(
                    deleteEntry
                )}
                loading={
                    actionLoading
                }
                onClose={() => {
                    if (
                        !actionLoading
                    ) {
                        setDeleteEntry(
                            null
                        );
                    }
                }}
                onConfirm={
                    handlePermanentDelete
                }
            />
        </div>
    );
};

export default MuseumPage;