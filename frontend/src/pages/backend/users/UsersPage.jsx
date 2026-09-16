import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    LoaderCircle,
    UserRound,
    Users,
} from "lucide-react";

import api from "../../../api/axios";



import UsersToolbar from "../../../component/admin/users/UsersToolbar";
import UsersTable from "../../../component/admin/users/UsersTable";
import UserFormModal from "../../../component/admin/users/UserFormModal";
import UserSuspendModal from "../../../component/admin/users/UserSuspendModal";
import UsersAlert from "../../../component/admin/users/UsersAlert";
import UsersHeader from "../../../component/admin/users/UsersHeader";
import UsersStats from "./UsersStats";

const UsersPage = ({
    authData = null,
    authLoading = false,
}) => {
    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const currentUser =
        authData?.user || null;

    const permissions =
        currentTenant?.access?.permissions || [];

    const canCreate =
        permissions.includes("users.create") &&
        permissions.includes("roles.assign");

    const canUpdate =
        permissions.includes("users.update") &&
        permissions.includes("roles.assign");

    const canSuspend =
        permissions.includes("users.suspend");

    const canActivate =
        permissions.includes("users.activate");

    const [users, setUsers] =
        useState([]);

    const [roles, setRoles] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [roleFilter, setRoleFilter] =
        useState("all");

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [createOpen, setCreateOpen] =
        useState(false);

    const [editUser, setEditUser] =
        useState(null);

    const [
        suspendUser,
        setSuspendUser,
    ] = useState(null);

    const loadUsers = async (
        showLoader = true
    ) => {
        if (!tenantId) {
            setUsers([]);
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
                `/tenants/${tenantId}/users`
            );

            setUsers(
                response.data?.data?.users || []
            );
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to load tenant users."
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

    const loadRoles = async () => {
        if (!tenantId) {
            setRoles([]);
            return;
        }

        try {
            const response = await api.get(
                `/tenants/${tenantId}/users/role-options`
            );

            setRoles(
                response.data?.data?.roles || []
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

        loadUsers();
        loadRoles();
    }, [
        authLoading,
        tenantId,
    ]);

    const clearMessages = () => {
        setError("");
        setMessage("");
    };

    const handleRefresh = async () => {
        clearMessages();

        await Promise.all([
            loadUsers(false),
            loadRoles(),
        ]);
    };

    const roleNames = useMemo(() => {
        return roles
            .map((role) =>
                typeof role === "string"
                    ? role
                    : role?.name
            )
            .filter(Boolean);
    }, [roles]);

    const filteredUsers = useMemo(() => {
        const keyword =
            search
                .trim()
                .toLowerCase();

        return users.filter((item) => {
            const user =
                item.user || {};

            const membership =
                item.membership || {};

            const actualRole =
                user.roles?.[0] || "";

            const matchesSearch =
                !keyword ||
                user.name
                    ?.toLowerCase()
                    .includes(keyword) ||
                user.email
                    ?.toLowerCase()
                    .includes(keyword) ||
                actualRole
                    .toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                statusFilter === "all" ||
                membership.status ===
                    statusFilter;

            const matchesRole =
                roleFilter === "all" ||
                actualRole === roleFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesRole
            );
        });
    }, [
        users,
        search,
        statusFilter,
        roleFilter,
    ]);

    const stats = useMemo(() => {
        return {
            total: users.length,

            active: users.filter(
                (item) =>
                    item.membership?.status ===
                    "active"
            ).length,

            suspended: users.filter(
                (item) =>
                    item.membership?.status ===
                    "suspended"
            ).length,

            admins: users.filter(
                (item) =>
                    item.user?.roles?.includes(
                        "MSP Admin"
                    )
            ).length,
        };
    }, [users]);

    const handleCreateUser = async (
        form
    ) => {
        setActionLoading(true);
        clearMessages();

        try {
            await api.post(
                `/tenants/${tenantId}/users`,
                form
            );

            setCreateOpen(false);

            setMessage(
                "Tenant user created successfully."
            );

            await loadUsers(false);

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                message: getApiError(
                    error,
                    "Unable to create tenant user."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateUser = async (
        form
    ) => {
        if (!editUser) {
            return {
                ok: false,
                message:
                    "User could not be identified.",
            };
        }

        setActionLoading(true);
        clearMessages();

        try {
            await api.patch(
                `/tenants/${tenantId}/users/${editUser.user.id}`,
                {
                    name: form.name,
                    email: form.email,
                    role: form.role,
                }
            );

            setEditUser(null);

            setMessage(
                "Tenant user updated successfully."
            );

            await loadUsers(false);

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                message: getApiError(
                    error,
                    "Unable to update tenant user."
                ),
            };
        } finally {
            setActionLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!suspendUser) {
            return;
        }

        setActionLoading(true);
        clearMessages();

        try {
            await api.patch(
                `/tenants/${tenantId}/users/${suspendUser.user.id}/suspend`
            );

            setMessage(
                `${suspendUser.user.name} has been suspended.`
            );

            setSuspendUser(null);

            await loadUsers(false);
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to suspend this user."
                )
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleActivate = async (
        item
    ) => {
        setActionLoading(true);
        clearMessages();

        try {
            await api.patch(
                `/tenants/${tenantId}/users/${item.user.id}/activate`
            );

            setMessage(
                `${item.user.name} has been activated.`
            );

            await loadUsers(false);
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to activate this user."
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
                <Users
                    size={30}
                    className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                    No organization selected
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select an MSP organization
                    before managing tenant users.
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
                        Loading users...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <UsersHeader
                tenantName={
                    currentTenant?.name
                }
                refreshing={refreshing}
                canCreate={canCreate}
                onRefresh={handleRefresh}
                onAdd={() => {
                    clearMessages();
                    setCreateOpen(true);
                }}
            />

            {error && (
                <UsersAlert
                    type="error"
                    message={error}
                    onClose={() =>
                        setError("")
                    }
                />
            )}

            {message && (
                <UsersAlert
                    type="success"
                    message={message}
                    onClose={() =>
                        setMessage("")
                    }
                />
            )}

            <UsersStats
                stats={stats}
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <UsersToolbar
                    search={search}
                    setSearch={setSearch}
                    statusFilter={
                        statusFilter
                    }
                    setStatusFilter={
                        setStatusFilter
                    }
                    roleFilter={
                        roleFilter
                    }
                    setRoleFilter={
                        setRoleFilter
                    }
                    roles={roleNames}
                />

                <UsersTable
                    users={filteredUsers}
                    totalUsers={users.length}
                    currentUserId={
                        currentUser?.id
                    }
                    actionLoading={
                        actionLoading
                    }
                    canUpdate={canUpdate}
                    canSuspend={
                        canSuspend
                    }
                    canActivate={
                        canActivate
                    }
                    onEdit={(item) => {
                        clearMessages();
                        setEditUser(item);
                    }}
                    onSuspend={(item) => {
                        clearMessages();
                        setSuspendUser(item);
                    }}
                    onActivate={
                        handleActivate
                    }
                />
            </div>

            {createOpen && (
                <UserFormModal
                    title="Add User"
                    description="Create a new user with access to this organization."
                    roles={roleNames}
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
                        handleCreateUser
                    }
                />
            )}

            {editUser && (
                <UserFormModal
                    title="Edit User"
                    description="Update this user's account details and tenant role."
                    roles={roleNames}
                    user={editUser}
                    loading={
                        actionLoading
                    }
                    onClose={() => {
                        if (
                            !actionLoading
                        ) {
                            setEditUser(
                                null
                            );
                        }
                    }}
                    onSubmit={
                        handleUpdateUser
                    }
                />
            )}

            {suspendUser && (
                <UserSuspendModal
                    user={suspendUser}
                    tenantName={
                        currentTenant?.name
                    }
                    loading={
                        actionLoading
                    }
                    onClose={() => {
                        if (
                            !actionLoading
                        ) {
                            setSuspendUser(
                                null
                            );
                        }
                    }}
                    onConfirm={
                        handleSuspend
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

export default UsersPage;