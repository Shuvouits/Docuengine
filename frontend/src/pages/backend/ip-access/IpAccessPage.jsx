import { useEffect, useMemo, useState } from "react";

import api from "../../../api/axios";

import IpAccessHeader from "../../../component/admin/ip-access/IpAccessHeader";
import IpAccessStats from "../../../component/admin/ip-access/IpAccessStats";
import IpAccessPolicyCard from "../../../component/admin/ip-access/IpAccessPolicyCard";
import IpAccessTable from "../../../component/admin/ip-access/IpAccessTable";
import IpAccessEntryModal from "../../../component/admin/ip-access/IpAccessEntryModal";
import IpAccessDeleteModal from "../../../component/admin/ip-access/IpAccessDeleteModal";
import IpAccessAlert from "../../../component/admin/ip-access/IpAccessAlert";

const IpAccessPage = ({
    authData,
    authLoading,
}) => {
    const tenantId = authData?.current_tenant?.id;

    const permissions =
        authData?.current_tenant?.access?.permissions || [];

    const canManage =
        permissions.includes("security.ip_allowlist.manage");

    const [policy, setPolicy] = useState(null);
    const [entries, setEntries] = useState([]);

    const [loading, setLoading] = useState(true);
    const [savingPolicy, setSavingPolicy] = useState(false);

    const [entryModal, setEntryModal] = useState({
        open: false,
        entry: null,
    });

    const [deleteEntry, setDeleteEntry] = useState(null);

    const [savingEntry, setSavingEntry] = useState(false);
    const [deletingEntry, setDeletingEntry] = useState(false);

    const [alert, setAlert] = useState(null);

    const loadData = async () => {
        if (!tenantId) {
            return;
        }

        setLoading(true);

        try {
            const response = await api.get(
                `/tenants/${tenantId}/ip-access`
            );

            const data = response.data?.data || {};

            setPolicy(data.policy || {
                enabled: false,
                updated_by: null,
                updated_at: null,
            });

            setEntries(
                Array.isArray(data.entries)
                    ? data.entries
                    : []
            );
        } catch (error) {
            setAlert({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "IP access settings could not be loaded.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [tenantId]);

    const stats = useMemo(() => {
        const active = entries.filter(
            (entry) => Boolean(entry.is_active)
        ).length;

        return {
            total: entries.length,
            active,
            inactive: entries.length - active,
            policyEnabled: Boolean(policy?.enabled),
        };
    }, [
        entries,
        policy,
    ]);

    const handlePolicyToggle = async () => {
        if (!tenantId || !canManage || savingPolicy) {
            return;
        }

        const nextEnabled = !Boolean(policy?.enabled);

        setSavingPolicy(true);
        setAlert(null);

        try {
            const response = await api.patch(
                `/tenants/${tenantId}/ip-access/policy`,
                {
                    enabled: nextEnabled,
                }
            );

            const updated =
                response.data?.data?.policy || null;

            if (updated) {
                setPolicy(updated);
            } else {
                await loadData();
            }

            setAlert({
                type: "success",
                message:
                    response.data?.message ||
                    "IP access policy updated successfully.",
            });
        } catch (error) {
            setAlert({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "IP access policy could not be updated.",
            });
        } finally {
            setSavingPolicy(false);
        }
    };

    const handleSaveEntry = async (
        form
    ) => {
        if (!tenantId || !canManage) {
            return;
        }

        setSavingEntry(true);
        setAlert(null);

        try {
            let response;

            if (entryModal.entry?.id) {
                response = await api.patch(
                    `/tenants/${tenantId}/ip-access/entries/${entryModal.entry.id}`,
                    form
                );
            } else {
                response = await api.post(
                    `/tenants/${tenantId}/ip-access/entries`,
                    form
                );
            }

            setEntryModal({
                open: false,
                entry: null,
            });

            setAlert({
                type: "success",
                message:
                    response.data?.message ||
                    "IP allowlist entry saved successfully.",
            });

            await loadData();
        } catch (error) {
            throw error;
        } finally {
            setSavingEntry(false);
        }
    };

    const handleDeleteEntry = async () => {
        if (
            !tenantId ||
            !deleteEntry?.id ||
            !canManage
        ) {
            return;
        }

        setDeletingEntry(true);
        setAlert(null);

        try {
            const response = await api.delete(
                `/tenants/${tenantId}/ip-access/entries/${deleteEntry.id}`
            );

            setDeleteEntry(null);

            setAlert({
                type: "success",
                message:
                    response.data?.message ||
                    "IP allowlist entry deleted successfully.",
            });

            await loadData();
        } catch (error) {
            setAlert({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "IP allowlist entry could not be deleted.",
            });

            setDeleteEntry(null);
        } finally {
            setDeletingEntry(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-sm font-medium text-slate-500">
                    Loading IP access settings...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <IpAccessHeader
                onRefresh={loadData}
                canManage={canManage}
                onAdd={() =>
                    setEntryModal({
                        open: true,
                        entry: null,
                    })
                }
            />

            {alert && (
                <IpAccessAlert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <IpAccessStats
                stats={stats}
            />

            <IpAccessPolicyCard
                policy={policy}
                activeEntries={stats.active}
                canManage={canManage}
                saving={savingPolicy}
                onToggle={handlePolicyToggle}
            />

            <IpAccessTable
                entries={entries}
                canManage={canManage}
                onEdit={(entry) =>
                    setEntryModal({
                        open: true,
                        entry,
                    })
                }
                onDelete={(entry) =>
                    setDeleteEntry(entry)
                }
            />

            <IpAccessEntryModal
                open={entryModal.open}
                entry={entryModal.entry}
                saving={savingEntry}
                onClose={() =>
                    setEntryModal({
                        open: false,
                        entry: null,
                    })
                }
                onSave={handleSaveEntry}
            />

            <IpAccessDeleteModal
                entry={deleteEntry}
                open={Boolean(deleteEntry)}
                deleting={deletingEntry}
                onClose={() => setDeleteEntry(null)}
                onConfirm={handleDeleteEntry}
            />
        </div>
    );
};

export default IpAccessPage;