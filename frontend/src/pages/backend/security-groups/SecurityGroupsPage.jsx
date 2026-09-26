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
import SecurityGroupCompanyAccessModal from "../../../component/admin/security-groups/SecurityGroupCompanyAccessModal";
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

    /**
     * --------------------------------------------------------------------------
     * Main Data
     * --------------------------------------------------------------------------
     */

    const [
        groups,
        setGroups,
    ] = useState([]);

    const [
        tenantUsers,
        setTenantUsers,
    ] = useState([]);

    /**
     * --------------------------------------------------------------------------
     * Company Access Data
     * --------------------------------------------------------------------------
     */

    const [
        companies,
        setCompanies,
    ] = useState([]);

    const [
        companyRestrictions,
        setCompanyRestrictions,
    ] = useState([]);

    /**
     * --------------------------------------------------------------------------
     * Loading States
     * --------------------------------------------------------------------------
     */

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);

    const [
        companyAccessLoading,
        setCompanyAccessLoading,
    ] = useState(false);

    /**
     * --------------------------------------------------------------------------
     * UI State
     * --------------------------------------------------------------------------
     */

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");

    const [
        message,
        setMessage,
    ] = useState("");

    const [
        createOpen,
        setCreateOpen,
    ] = useState(false);

    const [
        editGroup,
        setEditGroup,
    ] = useState(null);

    const [
        membersGroup,
        setMembersGroup,
    ] = useState(null);

    const [
        companyAccessGroup,
        setCompanyAccessGroup,
    ] = useState(null);

    const [
        deleteGroup,
        setDeleteGroup,
    ] = useState(null);

    /**
     * --------------------------------------------------------------------------
     * Helpers
     * --------------------------------------------------------------------------
     */

    const clearMessages = () => {
        setError("");
        setMessage("");
    };

    /**
     * --------------------------------------------------------------------------
     * Load Security Groups
     * --------------------------------------------------------------------------
     */

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
            const response =
                await api.get(
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

    /**
     * --------------------------------------------------------------------------
     * Load Tenant Users
     * --------------------------------------------------------------------------
     */

    const loadTenantUsers =
        async () => {
            if (!tenantId) {
                setTenantUsers([]);

                return;
            }

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/users`
                    );

                setTenantUsers(
                    response.data?.data
                        ?.users || []
                );
            } catch (error) {
                console.error(
                    "Unable to load tenant users:",
                    error
                );
            }
        };

    /**
     * --------------------------------------------------------------------------
     * Initial Load
     * --------------------------------------------------------------------------
     */

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

    /**
     * --------------------------------------------------------------------------
     * Filter Security Groups
     * --------------------------------------------------------------------------
     */

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
                        .includes(
                            keyword
                        ) ||
                    group.description
                        ?.toLowerCase()
                        .includes(
                            keyword
                        ) ||
                    group.created_by
                        ?.name
                        ?.toLowerCase()
                        .includes(
                            keyword
                        )
            );
        }, [
            groups,
            search,
        ]);

    /**
     * --------------------------------------------------------------------------
     * Statistics
     * --------------------------------------------------------------------------
     */

    const stats =
        useMemo(() => {
            const system =
                groups.filter(
                    (group) =>
                        group.is_system
                ).length;

            const custom =
                groups.length -
                system;

            const members =
                groups.reduce(
                    (
                        total,
                        group
                    ) =>
                        total +
                        Number(
                            group.users_count ||
                                0
                        ),
                    0
                );

            return {
                total:
                    groups.length,
                system,
                custom,
                members,
            };
        }, [groups]);

    /**
     * --------------------------------------------------------------------------
     * Create Security Group
     * --------------------------------------------------------------------------
     */

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

    /**
     * --------------------------------------------------------------------------
     * Update Security Group
     * --------------------------------------------------------------------------
     */

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

    /**
     * --------------------------------------------------------------------------
     * Delete Security Group
     * --------------------------------------------------------------------------
     */

    const handleDelete =
        async () => {
            if (!deleteGroup) {
                return;
            }

            setActionLoading(true);
            clearMessages();

            try {
                await api.delete(
                    `/tenants/${tenantId}/security-groups/${deleteGroup.id}`
                );

                setDeleteGroup(
                    null
                );

                setMessage(
                    "Security group deleted successfully."
                );

                await loadGroups(
                    false
                );
            } catch (error) {
                setError(
                    getApiError(
                        error,
                        "Unable to delete security group."
                    )
                );
            } finally {
                setActionLoading(
                    false
                );
            }
        };

    /**
     * --------------------------------------------------------------------------
     * Add Security Group Member
     * --------------------------------------------------------------------------
     */

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

    /**
     * --------------------------------------------------------------------------
     * Remove Security Group Member
     * --------------------------------------------------------------------------
     */

    const handleRemoveUser =
        async (
            groupId,
            userId
        ) => {
            setActionLoading(true);

            try {
                await api.delete(
                    `/tenants/${tenantId}/security-groups/${groupId}/users/${userId}`
                );

                await loadGroups(
                    false
                );

                return {
                    ok: true,
                };
            } catch (error) {
                return {
                    ok: false,

                    message:
                        getApiError(
                            error,
                            "Unable to remove user from security group."
                        ),
                };
            } finally {
                setActionLoading(
                    false
                );
            }
        };

    /**
     * --------------------------------------------------------------------------
     * Load Company Restrictions
     * --------------------------------------------------------------------------
     */

    const loadCompanyRestrictions =
        async (
            groupId
        ) => {
            if (
                !tenantId ||
                !groupId
            ) {
                setCompanyRestrictions(
                    []
                );

                return [];
            }

            const response =
                await api.get(
                    `/tenants/${tenantId}/security-groups/${groupId}/restrictions`
                );

            const restrictions =
                response.data?.data
                    ?.restrictions ||
                [];

            const result =
                Array.isArray(
                    restrictions
                )
                    ? restrictions
                    : [];

            setCompanyRestrictions(
                result
            );

            return result;
        };

    /**
     * --------------------------------------------------------------------------
     * Open Company Access
     * --------------------------------------------------------------------------
     */

    const handleOpenCompanyAccess =
        async (
            group
        ) => {
            if (
                !tenantId ||
                !group?.id
            ) {
                return;
            }

            clearMessages();

            setCompanyAccessGroup(
                group
            );

            setCompanies([]);
            setCompanyRestrictions([]);

            setCompanyAccessLoading(
                true
            );

            try {
                const [
                    companiesResponse,
                    restrictionsResponse,
                ] =
                    await Promise.all([
                        api.get(
                            `/tenants/${tenantId}/companies/options`
                        ),

                        api.get(
                            `/tenants/${tenantId}/security-groups/${group.id}/restrictions`
                        ),
                    ]);

                const companyData =
                    companiesResponse
                        .data?.data
                        ?.companies ||
                    [];

                const restrictionData =
                    restrictionsResponse
                        .data?.data
                        ?.restrictions ||
                    [];

                setCompanies(
                    Array.isArray(
                        companyData
                    )
                        ? companyData
                        : []
                );

                setCompanyRestrictions(
                    Array.isArray(
                        restrictionData
                    )
                        ? restrictionData
                        : []
                );
            } catch (error) {
                setCompanyAccessGroup(
                    null
                );

                setCompanies([]);
                setCompanyRestrictions(
                    []
                );

                setError(
                    getApiError(
                        error,
                        "Unable to load company access."
                    )
                );
            } finally {
                setCompanyAccessLoading(
                    false
                );
            }
        };

    /**
     * --------------------------------------------------------------------------
     * Change Company Access
     * --------------------------------------------------------------------------
     */

    const handleCompanyAccessChange =
        async ({
            company,
            accessLevel,
            restriction,
        }) => {
            if (
                !tenantId ||
                !companyAccessGroup?.id ||
                !company?.id
            ) {
                return {
                    ok: false,
                };
            }

            if (
                accessLevel ===
                "unrestricted"
            ) {
                return {
                    ok: true,
                };
            }

            clearMessages();

            const baseUrl =
                `/tenants/${tenantId}` +
                `/security-groups/${companyAccessGroup.id}` +
                `/restrictions`;

            const currentCompanyRestrictions =
                companyRestrictions.filter(
                    (
                        currentRestriction
                    ) =>
                        currentRestriction.resource_type ===
                        "company"
                );

            /**
             * Important:
             *
             * Deleting the final company restriction
             * would make the group unrestricted.
             *
             * Because "No Access" must never accidentally
             * become "All Companies", we prevent that here.
             */
            if (
                accessLevel ===
                    "none" &&
                restriction &&
                currentCompanyRestrictions.length <=
                    1
            ) {
                setError(
                    "The final company restriction cannot be removed because a group with zero company restrictions becomes unrestricted. Add access to another company first."
                );

                return {
                    ok: false,
                };
            }

            setCompanyAccessLoading(
                true
            );

            try {
                /**
                 * Remove existing access
                 */
                if (
                    accessLevel ===
                    "none"
                ) {
                    if (
                        !restriction
                    ) {
                        return {
                            ok: true,
                        };
                    }

                    await api.delete(
                        `${baseUrl}/${restriction.id}`
                    );
                }

                /**
                 * Update existing access
                 */
                else if (
                    restriction
                ) {
                    await api.patch(
                        `${baseUrl}/${restriction.id}`,
                        {
                            access_level:
                                accessLevel,
                        }
                    );
                }

                /**
                 * Create new company restriction
                 */
                else {
                    await api.post(
                        baseUrl,
                        {
                            resource_type:
                                "company",

                            resource_id:
                                company.id,

                            access_level:
                                accessLevel,
                        }
                    );
                }

                await loadCompanyRestrictions(
                    companyAccessGroup.id
                );

                return {
                    ok: true,
                };
            } catch (error) {
                const apiMessage =
                    getApiError(
                        error,
                        "Unable to update company access."
                    );

                setError(
                    apiMessage
                );

                return {
                    ok: false,
                    message:
                        apiMessage,
                };
            } finally {
                setCompanyAccessLoading(
                    false
                );
            }
        };

    /**
     * --------------------------------------------------------------------------
     * Close Company Access
     * --------------------------------------------------------------------------
     */

    const handleCloseCompanyAccess =
        () => {
            if (
                companyAccessLoading
            ) {
                return;
            }

            setCompanyAccessGroup(
                null
            );

            setCompanies([]);

            setCompanyRestrictions(
                []
            );
        };

    /**
     * --------------------------------------------------------------------------
     * No Tenant
     * --------------------------------------------------------------------------
     */

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
                    No organization
                    selected
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select an
                    organization before
                    managing security
                    groups.
                </p>
            </div>
        );
    }

    /**
     * --------------------------------------------------------------------------
     * Loading
     * --------------------------------------------------------------------------
     */

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
                        Loading security
                        groups...
                    </p>
                </div>
            </div>
        );
    }

    /**
     * --------------------------------------------------------------------------
     * Page
     * --------------------------------------------------------------------------
     */

    return (
        <div className="space-y-6">
            <SecurityGroupsHeader
                tenantName={
                    currentTenant?.name
                }
                refreshing={
                    refreshing
                }
                canCreate={
                    canCreate
                }
                onRefresh={() =>
                    loadGroups(
                        false
                    )
                }
                onCreate={() => {
                    clearMessages();

                    setCreateOpen(
                        true
                    );
                }}
            />

            {error && (
                <SecurityGroupsAlert
                    type="error"
                    message={
                        error
                    }
                    onClose={() =>
                        setError("")
                    }
                />
            )}

            {message && (
                <SecurityGroupsAlert
                    type="success"
                    message={
                        message
                    }
                    onClose={() =>
                        setMessage("")
                    }
                />
            )}

            <SecurityGroupsStats
                stats={stats}
            />

            <SecurityGroupsTable
                groups={
                    filteredGroups
                }
                totalGroups={
                    groups.length
                }
                search={search}
                setSearch={
                    setSearch
                }
                canUpdate={
                    canUpdate
                }
                canDelete={
                    canDelete
                }
                canAssign={
                    canAssign
                }
                onEdit={(
                    group
                ) => {
                    clearMessages();

                    setEditGroup(
                        group
                    );
                }}
                onMembers={(
                    group
                ) => {
                    clearMessages();

                    setMembersGroup(
                        group
                    );
                }}
                onCompanyAccess={
                    handleOpenCompanyAccess
                }
                onDelete={(
                    group
                ) => {
                    clearMessages();

                    setDeleteGroup(
                        group
                    );
                }}
            />

            {/* Create */}
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

            {/* Edit */}
            {editGroup && (
                <SecurityGroupFormModal
                    title="Edit Security Group"
                    description="Update the name and description of this security group."
                    group={
                        editGroup
                    }
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

            {/* Members */}
            {membersGroup && (
                <SecurityGroupMembersModal
                    group={
                        groups.find(
                            (
                                group
                            ) =>
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

            {/* Company Access */}
            {companyAccessGroup && (
                <SecurityGroupCompanyAccessModal
                    group={
                        companyAccessGroup
                    }
                    companies={
                        companies
                    }
                    restrictions={
                        companyRestrictions
                    }
                    loading={
                        companyAccessLoading
                    }
                    onClose={
                        handleCloseCompanyAccess
                    }
                    onChangeAccess={
                        handleCompanyAccessChange
                    }
                />
            )}

            {/* Delete */}
            {deleteGroup && (
                <SecurityGroupDeleteModal
                    group={
                        deleteGroup
                    }
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

/**
 * --------------------------------------------------------------------------
 * API Error Helper
 * --------------------------------------------------------------------------
 */

const getApiError = (
    error,
    fallback
) => {
    const validationErrors =
        error.response?.data
            ?.errors;

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
        error.response?.data
            ?.message ||
        fallback
    );
};

export default SecurityGroupsPage;