import { useEffect, useMemo, useState } from "react";

import {
    AlertTriangle,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Copy,
    LoaderCircle,
    Mail,
    Plus,
    RefreshCw,
    RotateCcw,
    Search,
    Send,
    ShieldCheck,
    UserPlus,
    UserRound,
    UserX,
    X,
} from "lucide-react";

import api from "../../../api/axios";

const InvitationsPage = ({
    authData = null,
    authLoading = false,
}) => {
    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const [invitations, setInvitations] = useState([]);
    const [roles, setRoles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [inviteOpen, setInviteOpen] = useState(false);
    const [revokeInvitation, setRevokeInvitation] = useState(null);
    const [resendInvitation, setResendInvitation] = useState(null);

    const [generatedInvite, setGeneratedInvite] = useState(null);
    const [copied, setCopied] = useState(false);

    const loadInvitations = async (
        showLoader = true
    ) => {
        if (!tenantId) {
            setInvitations([]);
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
                `/tenants/${tenantId}/invitations`
            );

            setInvitations(
                response.data?.data?.invitations || []
            );
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to load invitations."
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
                "Unable to load invitation role options:",
                error
            );
        }
    };

    useEffect(() => {
        if (authLoading) {
            return;
        }

        loadInvitations();
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
            loadInvitations(false),
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

    const normalizedInvitations = useMemo(() => {
        return invitations.map((invitation) => ({
            ...invitation,
            display_status:
                getInvitationStatus(invitation),
        }));
    }, [invitations]);

    const filteredInvitations = useMemo(() => {
        const keyword =
            search.trim().toLowerCase();

        return normalizedInvitations.filter(
            (invitation) => {
                const matchesSearch =
                    !keyword ||
                    invitation.name
                        ?.toLowerCase()
                        .includes(keyword) ||
                    invitation.email
                        ?.toLowerCase()
                        .includes(keyword) ||
                    invitation.role?.name
                        ?.toLowerCase()
                        .includes(keyword);

                const matchesStatus =
                    statusFilter === "all" ||
                    invitation.display_status ===
                        statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    }, [
        normalizedInvitations,
        search,
        statusFilter,
    ]);

    const pendingCount =
        normalizedInvitations.filter(
            (item) =>
                item.display_status === "pending"
        ).length;

    const acceptedCount =
        normalizedInvitations.filter(
            (item) =>
                item.display_status === "accepted"
        ).length;

    const revokedCount =
        normalizedInvitations.filter(
            (item) =>
                item.display_status === "revoked"
        ).length;

    const expiredCount =
        normalizedInvitations.filter(
            (item) =>
                item.display_status === "expired"
        ).length;

    const handleCreate = async (form) => {
        clearMessages();
        setActionLoading(true);

        try {
            const response = await api.post(
                `/tenants/${tenantId}/invitations`,
                form
            );

            const invitation =
                response.data?.data?.invitation;

            const token =
                response.data?.data?.invitation_token;

            setInviteOpen(false);

            if (invitation && token) {
                setGeneratedInvite({
                    invitation,
                    token,
                });
            }

            setMessage(
                "Invitation created successfully."
            );

            await loadInvitations(false);
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to create invitation."
                )
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleResend = async () => {
        if (!resendInvitation) {
            return;
        }

        clearMessages();
        setActionLoading(true);

        try {
            const response = await api.patch(
                `/tenants/${tenantId}/invitations/${resendInvitation.id}/resend`
            );

            const invitation =
                response.data?.data?.invitation;

            const token =
                response.data?.data?.invitation_token;

            if (invitation && token) {
                setGeneratedInvite({
                    invitation,
                    token,
                });
            }

            setResendInvitation(null);

            setMessage(
                "Invitation regenerated successfully."
            );

            await loadInvitations(false);
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to resend invitation."
                )
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevoke = async () => {
        if (!revokeInvitation) {
            return;
        }

        clearMessages();
        setActionLoading(true);

        try {
            await api.patch(
                `/tenants/${tenantId}/invitations/${revokeInvitation.id}/revoke`
            );

            setRevokeInvitation(null);

            setMessage(
                "Invitation revoked successfully."
            );

            await loadInvitations(false);
        } catch (error) {
            setError(
                getApiError(
                    error,
                    "Unable to revoke invitation."
                )
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleCopyInvite = async () => {
        if (!generatedInvite?.token) {
            return;
        }

        const inviteUrl =
            `${window.location.origin}/accept-invitation` +
            `?token=${encodeURIComponent(
                generatedInvite.token
            )}`;

        await navigator.clipboard.writeText(
            inviteUrl
        );

        setCopied(true);

        window.setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    if (
        !authLoading &&
        !currentTenant
    ) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <UserPlus
                    size={30}
                    className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                    No organization selected
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select an MSP organization before
                    managing invitations.
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
                        Loading invitations...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <UserPlus
                            size={16}
                            className="text-[#19b5fe]"
                        />

                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#19b5fe]">
                            Identity & Access
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-[#07111f] lg:text-3xl">
                        Invitations
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Invite users to{" "}
                        <span className="font-semibold text-slate-700">
                            {currentTenant?.name}
                        </span>{" "}
                        and manage pending access requests.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            clearMessages();
                            setInviteOpen(true);
                        }}
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#19b5fe] px-5 text-sm font-semibold text-white shadow-lg shadow-[#19b5fe]/20 transition hover:bg-[#159edb]"
                    >
                        <Plus size={18} />
                        Invite User
                    </button>
                </div>
            </div>

            {error && (
                <AlertBox
                    type="error"
                    message={error}
                    onClose={() =>
                        setError("")
                    }
                />
            )}

            {message && (
                <AlertBox
                    type="success"
                    message={message}
                    onClose={() =>
                        setMessage("")
                    }
                />
            )}

            {generatedInvite && (
                <InviteLinkPanel
                    invitation={
                        generatedInvite.invitation
                    }
                    copied={copied}
                    onCopy={
                        handleCopyInvite
                    }
                    onClose={() =>
                        setGeneratedInvite(null)
                    }
                />
            )}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Pending"
                    value={pendingCount}
                    icon={Clock3}
                />

                <StatCard
                    title="Accepted"
                    value={acceptedCount}
                    icon={CheckCircle2}
                />

                <StatCard
                    title="Revoked"
                    value={revokedCount}
                    icon={UserX}
                />

                <StatCard
                    title="Expired"
                    value={expiredCount}
                    icon={AlertTriangle}
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search by name, email or role..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                            />
                        </div>

                        <FilterSelect
                            value={
                                statusFilter
                            }
                            onChange={
                                setStatusFilter
                            }
                            options={[
                                {
                                    value: "all",
                                    label: "All Statuses",
                                },
                                {
                                    value: "pending",
                                    label: "Pending",
                                },
                                {
                                    value: "accepted",
                                    label: "Accepted",
                                },
                                {
                                    value: "revoked",
                                    label: "Revoked",
                                },
                                {
                                    value: "expired",
                                    label: "Expired",
                                },
                            ]}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <TableHeader>
                                    Invitee
                                </TableHeader>

                                <TableHeader>
                                    Role
                                </TableHeader>

                                <TableHeader>
                                    Status
                                </TableHeader>

                                <TableHeader>
                                    Expires
                                </TableHeader>

                                <TableHeader>
                                    Invited By
                                </TableHeader>

                                <TableHeader align="right">
                                    Actions
                                </TableHeader>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredInvitations.map(
                                (invitation) => (
                                    <InvitationRow
                                        key={
                                            invitation.id
                                        }
                                        invitation={
                                            invitation
                                        }
                                        onResend={() => {
                                            clearMessages();
                                            setResendInvitation(
                                                invitation
                                            );
                                        }}
                                        onRevoke={() => {
                                            clearMessages();
                                            setRevokeInvitation(
                                                invitation
                                            );
                                        }}
                                    />
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredInvitations.length === 0 && (
                    <div className="px-6 py-16 text-center">
                        <Mail
                            size={30}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-4 font-semibold text-slate-700">
                            No invitations found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Invite a user or adjust
                            your filters.
                        </p>
                    </div>
                )}

                <div className="border-t border-slate-100 px-5 py-4">
                    <p className="text-xs text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                            {filteredInvitations.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                            {invitations.length}
                        </span>{" "}
                        invitations
                    </p>
                </div>
            </div>

            {inviteOpen && (
                <InviteUserModal
                    roles={roleNames}
                    loading={actionLoading}
                    onClose={() => {
                        if (!actionLoading) {
                            setInviteOpen(false);
                        }
                    }}
                    onSubmit={
                        handleCreate
                    }
                />
            )}

            {resendInvitation && (
                <ActionModal
                    icon={RotateCcw}
                    tone="blue"
                    title="Resend Invitation"
                    description={`Generate a new invitation for ${resendInvitation.email}? The previous invitation token will no longer be used.`}
                    confirmText="Resend Invitation"
                    loading={actionLoading}
                    onClose={() => {
                        if (!actionLoading) {
                            setResendInvitation(
                                null
                            );
                        }
                    }}
                    onConfirm={
                        handleResend
                    }
                />
            )}

            {revokeInvitation && (
                <ActionModal
                    icon={UserX}
                    tone="red"
                    title="Revoke Invitation"
                    description={`Revoke the invitation for ${revokeInvitation.email}? This action cannot be undone.`}
                    confirmText="Revoke Invitation"
                    loading={actionLoading}
                    onClose={() => {
                        if (!actionLoading) {
                            setRevokeInvitation(
                                null
                            );
                        }
                    }}
                    onConfirm={
                        handleRevoke
                    }
                />
            )}
        </div>
    );
};

const InvitationRow = ({
    invitation,
    onResend,
    onRevoke,
}) => {
    const actionable =
        invitation.display_status ===
            "pending" ||
        invitation.display_status ===
            "expired";

    return (
        <tr className="transition hover:bg-slate-50/60">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-sm font-bold text-[#159edb]">
                        {getInitials(
                            invitation.name ||
                                invitation.email
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#07111f]">
                            {invitation.name ||
                                "Invited User"}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                            <Mail size={12} />

                            {invitation.email}
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-5 py-4">
                <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                    {invitation.role?.name ||
                        "No Role"}
                </span>
            </td>

            <td className="px-5 py-4">
                <InvitationStatusBadge
                    status={
                        invitation.display_status
                    }
                />
            </td>

            <td className="px-5 py-4">
                <p className="text-xs font-semibold text-slate-700">
                    {formatDate(
                        invitation.expires_at
                    )}
                </p>
            </td>

            <td className="px-5 py-4">
                <p className="text-xs font-semibold text-slate-700">
                    {invitation.invited_by?.name ||
                        "Unknown"}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                    {invitation.invited_by?.email ||
                        ""}
                </p>
            </td>

            <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                    {actionable && (
                        <button
                            type="button"
                            onClick={onResend}
                            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[#19b5fe]/40 hover:text-[#159edb]"
                        >
                            <RotateCcw
                                size={14}
                            />

                            Resend
                        </button>
                    )}

                    {invitation.display_status ===
                        "pending" && (
                        <button
                            type="button"
                            onClick={onRevoke}
                            className="flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                            <UserX
                                size={14}
                            />

                            Revoke
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

const InviteUserModal = ({
    roles,
    loading,
    onClose,
    onSubmit,
}) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        role: roles[0] || "",
    });

    const [formError, setFormError] =
        useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email.trim()) {
            setFormError(
                "Email address is required."
            );
            return;
        }

        if (!form.role) {
            setFormError(
                "Select a role for this invitation."
            );
            return;
        }

        await onSubmit({
            name:
                form.name.trim() ||
                null,
            email: form.email
                .trim()
                .toLowerCase(),
            role: form.role,
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
                >
                    <X size={18} />
                </button>

                <form onSubmit={handleSubmit}>
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#19b5fe]">
                            <Send size={20} />
                        </div>

                        <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                            Invite User
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            Send an invitation with
                            tenant access and an assigned
                            role.
                        </p>
                    </div>

                    <div className="space-y-5 p-6">
                        {formError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                {formError}
                            </div>
                        )}

                        <FormField
                            label="Name"
                            value={form.name}
                            placeholder="Optional name"
                            onChange={(value) => {
                                setForm({
                                    ...form,
                                    name: value,
                                });

                                setFormError("");
                            }}
                        />

                        <FormField
                            label="Email Address"
                            type="email"
                            value={form.email}
                            placeholder="name@company.com"
                            onChange={(value) => {
                                setForm({
                                    ...form,
                                    email: value,
                                });

                                setFormError("");
                            }}
                        />

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Role
                            </label>

                            <div className="relative">
                                <select
                                    value={
                                        form.role
                                    }
                                    onChange={(e) => {
                                        setForm({
                                            ...form,
                                            role: e.target.value,
                                        });

                                        setFormError("");
                                    }}
                                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                                >
                                    <option value="">
                                        Select role
                                    </option>

                                    {roles.map(
                                        (role) => (
                                            <option
                                                key={
                                                    role
                                                }
                                                value={
                                                    role
                                                }
                                            >
                                                {
                                                    role
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#19b5fe] text-sm font-semibold text-white transition hover:bg-[#159edb] disabled:opacity-60"
                        >
                            {loading && (
                                <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                />
                            )}

                            Send Invitation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InviteLinkPanel = ({
    invitation,
    copied,
    onCopy,
    onClose,
}) => {
    return (
        <div className="rounded-2xl border border-[#19b5fe]/25 bg-[#19b5fe]/5 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#19b5fe] shadow-sm">
                        <Mail size={18} />
                    </div>

                    <div>
                        <p className="text-sm font-bold text-[#07111f]">
                            Invitation ready
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Copy the invitation link for{" "}
                            <span className="font-semibold text-slate-700">
                                {invitation.email}
                            </span>.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onCopy}
                        className="flex h-10 items-center gap-2 rounded-xl bg-[#19b5fe] px-4 text-xs font-semibold text-white"
                    >
                        {copied ? (
                            <Check size={15} />
                        ) : (
                            <Copy size={15} />
                        )}

                        {copied
                            ? "Copied"
                            : "Copy Invite Link"}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ActionModal = ({
    icon: Icon,
    tone,
    title,
    description,
    confirmText,
    loading,
    onClose,
    onConfirm,
}) => {
    const destructive =
        tone === "red";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div
                    className={`h-1 ${
                        destructive
                            ? "bg-red-500"
                            : "bg-[#19b5fe]"
                    }`}
                />

                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
                >
                    <X size={18} />
                </button>

                <div className="p-6">
                    <div
                        className={`
                            flex h-12 w-12
                            items-center justify-center
                            rounded-full
                            ${
                                destructive
                                    ? "bg-red-50 text-red-500"
                                    : "bg-[#19b5fe]/10 text-[#19b5fe]"
                            }
                        `}
                    >
                        <Icon size={21} />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-[#07111f]">
                        {title}
                    </h2>

                    <p className="mt-2 pr-3 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`
                            flex h-11 items-center
                            justify-center gap-2
                            rounded-xl text-sm
                            font-semibold text-white
                            disabled:opacity-60
                            ${
                                destructive
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-[#19b5fe] hover:bg-[#159edb]"
                            }
                        `}
                    >
                        {loading && (
                            <LoaderCircle
                                size={16}
                                className="animate-spin"
                            />
                        )}

                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FormField = ({
    label,
    type = "text",
    value,
    placeholder,
    onChange,
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
            />
        </div>
    );
};

const FilterSelect = ({
    value,
    onChange,
    options,
}) => {
    return (
        <div className="relative min-w-[180px]">
            <select
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm font-medium text-slate-600 outline-none"
            >
                {options.map(
                    (option) => (
                        <option
                            key={
                                option.value
                            }
                            value={
                                option.value
                            }
                        >
                            {option.label}
                        </option>
                    )
                )}
            </select>

            <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
        </div>
    );
};

const InvitationStatusBadge = ({
    status,
}) => {
    const styles = {
        pending:
            "border-amber-200 bg-amber-50 text-amber-700",
        accepted:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        revoked:
            "border-red-200 bg-red-50 text-red-600",
        expired:
            "border-slate-200 bg-slate-100 text-slate-600",
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full border
                px-2.5 py-1
                text-[10px] font-bold
                capitalize
                ${styles[status]}
            `}
        >
            <span
                className={`
                    h-1.5 w-1.5 rounded-full
                    ${
                        status === "accepted"
                            ? "bg-emerald-500"
                            : status === "pending"
                              ? "bg-amber-500"
                              : status === "revoked"
                                ? "bg-red-500"
                                : "bg-slate-400"
                    }
                `}
            />

            {status}
        </span>
    );
};

const StatCard = ({
    title,
    value,
    icon: Icon,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#19b5fe]">
                    <Icon size={19} />
                </div>

                <span className="text-2xl font-bold text-[#07111f]">
                    {value}
                </span>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {title}
            </p>
        </div>
    );
};

const TableHeader = ({
    children,
    align = "left",
}) => {
    return (
        <th
            className={`
                px-5 py-3.5
                text-[10px] font-bold
                uppercase tracking-[0.12em]
                text-slate-400
                ${
                    align === "right"
                        ? "text-right"
                        : "text-left"
                }
            `}
        >
            {children}
        </th>
    );
};

const AlertBox = ({
    type,
    message,
    onClose,
}) => {
    const success =
        type === "success";

    return (
        <div
            className={`
                flex items-start gap-3
                rounded-2xl border p-4
                ${
                    success
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                }
            `}
        >
            {success ? (
                <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-500"
                />
            ) : (
                <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-500"
                />
            )}

            <p
                className={`
                    flex-1 text-sm font-semibold
                    ${
                        success
                            ? "text-emerald-700"
                            : "text-red-700"
                    }
                `}
            >
                {message}
            </p>

            <button
                type="button"
                onClick={onClose}
            >
                <X size={18} />
            </button>
        </div>
    );
};

const getInvitationStatus = (
    invitation
) => {
    if (
        invitation.status === "accepted" ||
        invitation.accepted_at
    ) {
        return "accepted";
    }

    if (
        invitation.status === "revoked" ||
        invitation.revoked_at
    ) {
        return "revoked";
    }

    if (
        invitation.expires_at &&
        new Date(
            invitation.expires_at
        ).getTime() < Date.now()
    ) {
        return "expired";
    }

    return invitation.status || "pending";
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

const getInitials = (value) => {
    if (!value) {
        return "U";
    }

    return value
        .split(/[\s@]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
};

const formatDate = (value) => {
    if (!value) {
        return "Not available";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(new Date(value));
};

export default InvitationsPage;