import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    LoaderCircle,
    Shield,
} from "lucide-react";

import api from "../../../api/axios";

import SecurityGroupsHeader from "../../../component/admin/security-groups/SecurityGroupsHeader";
import SecurityGroupsStats from "../../../component/admin/security-groups/SecurityGroupsStats";
import SecurityGroupsTable from "../../../component/admin/security-groups/SecurityGroupsTable";
import SecurityGroupFormModal from "../../../component/admin/security-groups/SecurityGroupFormModal";
import SecurityGroupMembersModal from "../../../component/admin/security-groups/SecurityGroupMembersModal";
import SecurityGroupDeleteModal from "../../../component/admin/security-groups/SecurityGroupDeleteModal";
import SecurityGroupsAlert from "../../../component/admin/security-groups/SecurityGroupsAlert";

const SecurityGroupsPage = ({
    authData = null,
    authLoading = false,
}) => {
    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const permissions =
        currentTenant?.access?.permissions || [];

    const canCreate =
        permissions.includes(
            "security_groups.create"
        );

    const canUpdate =
        permissions.includes(
            "security_groups.update"
        );

    const canDelete =
        permissions.includes(
            "security_groups.delete"
        );

    const canAssign =
        permissions.includes(
            "security_groups.assign"
        );

    const [groups, setGroups] =
        useState([]);

    const [tenantUsers, setTenantUsers] =
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

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [createOpen, setCreateOpen] =
        useState(false);

    const [editGroup, setEditGroup] =
        useState(null);

    const [membersGroup, setMembersGroup] =
        useState(null);

    const [deleteGroup, setDeleteGroup] =
        useState(null);

    const clearMessages = () => {
        setError("");
        setMessage("");
    };

    const loadGroups = async (
        showLoader = true
    ) => {
        if (!tenantId) {
            setGroups([]);
            setLoading(false);
            return;
        }

        if (showLoader) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        setError("");

        try {
            const response = await api.get(
                `/tenants/${tenantId}/security-groups`
            );

            setGroups(
                response.data?.data
                    ?.security_groups || []
            );
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to load security groups."
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
        if (!tenantId) {
            setTenantUsers([]);
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

    useEffect(() => {
        if (authLoading) {
            return;
        }

        loadGroups();

        if (canAssign) {
            loadTenantUsers();
        }
    }, [
        authLoading,
        tenantId,
        canAssign,
    ]);

    const filteredGroups =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return groups;
            }

            return groups.filter(
                (group) =>
                    group.name
                        ?.toLowerCase()
                        .includes(keyword) ||
                    group.description
                        ?.toLowerCase()
                        .includes(keyword) ||
                    group.created_by?.name
                        ?.toLowerCase()
                        .includes(keyword)
            );
        }, [
            groups,
            search,
        ]);

    const stats = useMemo(() => {
        const system =
            groups.filter(
                (group) =>
                    group.is_system
            ).length;

        const custom =
            groups.length - system;

        const members =
            groups.reduce(
                (total, group) =>
                    total +
                    Number(
                        group.users_count || 0
                    ),
                0
            );

        return {
            total: groups.length,
            system,
            custom,
            members,
        };
    }, [groups]);

    const handleCreate = async (
        form
    ) => {
        setActionLoading(true);
        clearMessages();

        try {
            await api.post(
                `/tenants/${tenantId}/security-groups`,
                form
            );

            setCreateOpen(false);

            setMessage(
                "Security group created successfully."
            );

            await loadGroups(false);

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,

                message: getApiError(
                    error,
                    "Unable to create security group."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (
        form
    ) => {
        if (!editGroup) {
            return {
                ok: false,
                message:
                    "Security group could not be identified.",
            };
        }

        setActionLoading(true);
        clearMessages();

        try {
            await api.patch(
                `/tenants/${tenantId}/security-groups/${editGroup.id}`,
                form
            );

            setEditGroup(null);

            setMessage(
                "Security group updated successfully."
            );

            await loadGroups(false);

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,

                message: getApiError(
                    error,
                    "Unable to update security group."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteGroup) {
            return;
        }

        setActionLoading(true);
        clearMessages();

        try {
            await api.delete(
                `/tenants/${tenantId}/security-groups/${deleteGroup.id}`
            );

            setDeleteGroup(null);

            setMessage(
                "Security group deleted successfully."
            );

            await loadGroups(false);
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to delete security group."
                )
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddUser = async (
        groupId,
        userId
    ) => {
        setActionLoading(true);

        try {
            await api.post(
                `/tenants/${tenantId}/security-groups/${groupId}/users/${userId}`
            );

            await loadGroups(false);

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,

                message: getApiError(
                    error,
                    "Unable to add user to security group."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveUser = async (
        groupId,
        userId
    ) => {
        setActionLoading(true);

        try {
            await api.delete(
                `/tenants/${tenantId}/security-groups/${groupId}/users/${userId}`
            );

            await loadGroups(false);

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,

                message: getApiError(
                    error,
                    "Unable to remove user from security group."
                ),
            };
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
                <Shield
                    size={30}
                    className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                    No organization selected
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select an organization before
                    managing security groups.
                </p>
            </div>
        );
    }

    if (
        loading ||
        authLoading
    ) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={30}
                        className="mx-auto animate-spin text-[#19b5fe]"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading security groups...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SecurityGroupsHeader
                tenantName={
                    currentTenant?.name
                }
                refreshing={refreshing}
                canCreate={canCreate}
                onRefresh={() =>
                    loadGroups(false)
                }
                onCreate={() => {
                    clearMessages();
                    setCreateOpen(true);
                }}
            />

            {error && (
                <SecurityGroupsAlert
                    type="error"
                    message={error}
                    onClose={() =>
                        setError("")
                    }
                />
            )}

            {message && (
                <SecurityGroupsAlert
                    type="success"
                    message={message}
                    onClose={() =>
                        setMessage("")
                    }
                />
            )}

            <SecurityGroupsStats
                stats={stats}
            />

            <SecurityGroupsTable
                groups={filteredGroups}
                totalGroups={
                    groups.length
                }
                search={search}
                setSearch={setSearch}
                canUpdate={canUpdate}
                canDelete={canDelete}
                canAssign={canAssign}
                onEdit={(group) => {
                    clearMessages();
                    setEditGroup(group);
                }}
                onMembers={(group) => {
                    clearMessages();
                    setMembersGroup(
                        group
                    );
                }}
                onDelete={(group) => {
                    clearMessages();
                    setDeleteGroup(
                        group
                    );
                }}
            />

            {createOpen && (
                <SecurityGroupFormModal
                    title="Create Security Group"
                    description="Create a group for controlling access to protected resources."
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

            {editGroup && (
                <SecurityGroupFormModal
                    title="Edit Security Group"
                    description="Update the name and description of this security group."
                    group={editGroup}
                    loading={
                        actionLoading
                    }
                    onClose={() => {
                        if (
                            !actionLoading
                        ) {
                            setEditGroup(
                                null
                            );
                        }
                    }}
                    onSubmit={
                        handleUpdate
                    }
                />
            )}

            {membersGroup && (
                <SecurityGroupMembersModal
                    group={
                        groups.find(
                            (group) =>
                                group.id ===
                                membersGroup.id
                        ) ||
                        membersGroup
                    }
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
                            setMembersGroup(
                                null
                            );
                        }
                    }}
                    onAddUser={
                        handleAddUser
                    }
                    onRemoveUser={
                        handleRemoveUser
                    }
                />
            )}

            {deleteGroup && (
                <SecurityGroupDeleteModal
                    group={deleteGroup}
                    loading={
                        actionLoading
                    }
                    onClose={() => {
                        if (
                            !actionLoading
                        ) {
                            setDeleteGroup(
                                null
                            );
                        }
                    }}
                    onConfirm={
                        handleDelete
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

export default SecurityGroupsPage;