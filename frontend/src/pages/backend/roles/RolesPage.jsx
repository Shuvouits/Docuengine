import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    KeyRound,
    LoaderCircle,
} from "lucide-react";

import api from "../../../api/axios";

import RolesHeader from "../../../component/admin/roles/RolesHeader";
import RolesStats from "../../../component/admin/roles/RolesStats";
import RolesTable from "../../../component/admin/roles/RolesTable";
import RoleFormModal from "../../../component/admin/roles/RoleFormModal";
import RoleDeleteModal from "../../../component/admin/roles/RoleDeleteModal";
import RolesAlert from "../../../component/admin/roles/RolesAlert";

const RolesPage = ({
    authData = null,
    authLoading = false,
}) => {
    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const accessPermissions =
        currentTenant?.access?.permissions || [];

    const canCreate =
        accessPermissions.includes("roles.create") &&
        accessPermissions.includes("roles.assign");

    const canUpdate =
        accessPermissions.includes("roles.update") &&
        accessPermissions.includes("roles.assign");

    const canDelete =
        accessPermissions.includes("roles.delete");

    const [roles, setRoles] =
        useState([]);

    const [
        availablePermissions,
        setAvailablePermissions,
    ] = useState([]);

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

    const [editRole, setEditRole] =
        useState(null);

    const [deleteRole, setDeleteRole] =
        useState(null);

    const loadData = async (
        showLoader = true
    ) => {
        if (!tenantId) {
            setRoles([]);
            setAvailablePermissions([]);
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
            const [
                rolesResponse,
                permissionsResponse,
            ] = await Promise.all([
                api.get(
                    `/tenants/${tenantId}/roles`
                ),

                api.get(
                    `/tenants/${tenantId}/roles/permissions`
                ),
            ]);

            setRoles(
                rolesResponse.data?.data?.roles || []
            );

            setAvailablePermissions(
                permissionsResponse.data?.data
                    ?.permissions || []
            );
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to load roles and permissions."
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

    useEffect(() => {
        if (authLoading) {
            return;
        }

        loadData();
    }, [
        authLoading,
        tenantId,
    ]);

    const clearMessages = () => {
        setError("");
        setMessage("");
    };

    const filteredRoles =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return roles;
            }

            return roles.filter((role) => {
                const nameMatch =
                    role.name
                        ?.toLowerCase()
                        .includes(keyword);

                const permissionMatch =
                    role.permissions?.some(
                        (permission) =>
                            permission.name
                                ?.toLowerCase()
                                .includes(keyword)
                    );

                return (
                    nameMatch ||
                    permissionMatch
                );
            });
        }, [
            roles,
            search,
        ]);

    const stats = useMemo(() => {
        const systemRoles =
            roles.filter(
                (role) =>
                    role.is_system
            ).length;

        return {
            total: roles.length,
            system: systemRoles,
            custom:
                roles.length -
                systemRoles,
            permissions:
                availablePermissions.length,
        };
    }, [
        roles,
        availablePermissions,
    ]);

    const handleCreate = async (
        form
    ) => {
        setActionLoading(true);
        clearMessages();

        try {
            await api.post(
                `/tenants/${tenantId}/roles`,
                form
            );

            setCreateOpen(false);

            setMessage(
                "Role created successfully."
            );

            await loadData(false);

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                message: getApiError(
                    error,
                    "Unable to create role."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (
        form
    ) => {
        if (!editRole) {
            return {
                ok: false,
                message:
                    "Role could not be identified.",
            };
        }

        setActionLoading(true);
        clearMessages();

        try {
            await api.patch(
                `/tenants/${tenantId}/roles/${editRole.id}`,
                form
            );

            setEditRole(null);

            setMessage(
                "Role updated successfully."
            );

            await loadData(false);

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                message: getApiError(
                    error,
                    "Unable to update role."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteRole) {
            return;
        }

        setActionLoading(true);
        clearMessages();

        try {
            await api.delete(
                `/tenants/${tenantId}/roles/${deleteRole.id}`
            );

            setDeleteRole(null);

            setMessage(
                "Role deleted successfully."
            );

            await loadData(false);
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to delete role."
                )
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
                <KeyRound
                    size={30}
                    className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                    No organization selected
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select an organization before
                    managing roles and permissions.
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
                        Loading roles...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <RolesHeader
                tenantName={
                    currentTenant?.name
                }
                refreshing={refreshing}
                canCreate={canCreate}
                onRefresh={() =>
                    loadData(false)
                }
                onCreate={() => {
                    clearMessages();
                    setCreateOpen(true);
                }}
            />

            {error && (
                <RolesAlert
                    type="error"
                    message={error}
                    onClose={() =>
                        setError("")
                    }
                />
            )}

            {message && (
                <RolesAlert
                    type="success"
                    message={message}
                    onClose={() =>
                        setMessage("")
                    }
                />
            )}

            <RolesStats
                stats={stats}
            />

            <RolesTable
                roles={filteredRoles}
                totalRoles={roles.length}
                search={search}
                setSearch={setSearch}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onEdit={(role) => {
                    clearMessages();
                    setEditRole(role);
                }}
                onDelete={(role) => {
                    clearMessages();
                    setDeleteRole(role);
                }}
            />

            {createOpen && (
                <RoleFormModal
                    title="Create Role"
                    description="Create a tenant role and choose exactly what this role can access."
                    permissions={
                        availablePermissions
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

            {editRole && (
                <RoleFormModal
                    title="Edit Role"
                    description="Update this role and its assigned permissions."
                    role={editRole}
                    permissions={
                        availablePermissions
                    }
                    loading={
                        actionLoading
                    }
                    onClose={() => {
                        if (
                            !actionLoading
                        ) {
                            setEditRole(
                                null
                            );
                        }
                    }}
                    onSubmit={
                        handleUpdate
                    }
                />
            )}

            {deleteRole && (
                <RoleDeleteModal
                    role={deleteRole}
                    loading={
                        actionLoading
                    }
                    onClose={() => {
                        if (
                            !actionLoading
                        ) {
                            setDeleteRole(
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
        const firstError =
            Object.values(
                validationErrors
            )?.[0]?.[0];

        if (firstError) {
            return firstError;
        }
    }

    return (
        error.response?.data?.message ||
        fallback
    );
};

export default RolesPage;