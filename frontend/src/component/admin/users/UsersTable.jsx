import {
    Edit3,
    Mail,
    UserCheck,
    UserRound,
    UserX,
} from "lucide-react";

const UsersTable = ({
    users,
    totalUsers,
    currentUserId,
    actionLoading,
    canUpdate,
    canSuspend,
    canActivate,
    onEdit,
    onSuspend,
    onActivate,
}) => {
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                            <TableHeader>
                                User
                            </TableHeader>

                            <TableHeader>
                                Role
                            </TableHeader>

                            <TableHeader>
                                Tenant Access
                            </TableHeader>

                            <TableHeader>
                                Account
                            </TableHeader>

                            <TableHeader>
                                Joined
                            </TableHeader>

                            <TableHeader align="right">
                                Actions
                            </TableHeader>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {users.map((item) => (
                            <UserRow
                                key={
                                    item.membership_id
                                }
                                item={item}
                                currentUserId={
                                    currentUserId
                                }
                                actionLoading={
                                    actionLoading
                                }
                                canUpdate={
                                    canUpdate
                                }
                                canSuspend={
                                    canSuspend
                                }
                                canActivate={
                                    canActivate
                                }
                                onEdit={() =>
                                    onEdit(item)
                                }
                                onSuspend={() =>
                                    onSuspend(item)
                                }
                                onActivate={() =>
                                    onActivate(item)
                                }
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && (
                <div className="px-6 py-16 text-center">
                    <UserRound
                        size={30}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 font-semibold text-slate-700">
                        No users found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Try adjusting your
                        search or filters.
                    </p>
                </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                        {users.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                        {totalUsers}
                    </span>{" "}
                    users
                </p>
            </div>
        </>
    );
};

const UserRow = ({
    item,
    currentUserId,
    actionLoading,
    canUpdate,
    canSuspend,
    canActivate,
    onEdit,
    onSuspend,
    onActivate,
}) => {
    const user =
        item.user || {};

    const membership =
        item.membership || {};

    const role =
        user.roles?.[0] ||
        "No Role";

    const isCurrentUser =
        user.id === currentUserId;

    const isActive =
        membership.status === "active";

    const hasActions =
        canUpdate ||
        (
            !isCurrentUser &&
            (
                canSuspend ||
                canActivate
            )
        );

    return (
        <tr className="transition hover:bg-slate-50/60">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-sm font-bold text-[#159edb]">
                        {getInitials(
                            user.name
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-[#07111f]">
                                {user.name}
                            </p>

                            {isCurrentUser && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-600">
                                    You
                                </span>
                            )}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                            <Mail size={12} />

                            {user.email}
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-5 py-4">
                <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                    {role}
                </span>
            </td>

            <td className="px-5 py-4">
                <StatusBadge
                    status={
                        membership.status
                    }
                />
            </td>

            <td className="px-5 py-4">
                <StatusBadge
                    status={
                        user.status
                    }
                />
            </td>

            <td className="px-5 py-4">
                <p className="text-xs font-medium text-slate-600">
                    {formatDate(
                        membership.joined_at
                    )}
                </p>
            </td>

            <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                    {canUpdate && (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[#19b5fe]/40 hover:text-[#159edb]"
                        >
                            <Edit3 size={14} />
                            Edit
                        </button>
                    )}

                    {!isCurrentUser &&
                        isActive &&
                        canSuspend && (
                            <button
                                type="button"
                                onClick={
                                    onSuspend
                                }
                                disabled={
                                    actionLoading
                                }
                                className="flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                                <UserX
                                    size={14}
                                />

                                Suspend
                            </button>
                        )}

                    {!isCurrentUser &&
                        !isActive &&
                        canActivate && (
                            <button
                                type="button"
                                onClick={
                                    onActivate
                                }
                                disabled={
                                    actionLoading
                                }
                                className="flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                            >
                                <UserCheck
                                    size={14}
                                />

                                Activate
                            </button>
                        )}

                    {!hasActions && (
                        <span className="text-xs text-slate-300">
                            —
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
};

const StatusBadge = ({
    status,
}) => {
    const normalized =
        status || "unknown";

    const styles = {
        active:
            "border-emerald-200 bg-emerald-50 text-emerald-700",

        suspended:
            "border-red-200 bg-red-50 text-red-600",

        inactive:
            "border-amber-200 bg-amber-50 text-amber-700",
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full border
                px-2.5 py-1
                text-[10px] font-bold
                capitalize
                ${
                    styles[normalized] ||
                    "border-slate-200 bg-slate-50 text-slate-600"
                }
            `}
        >
            <span
                className={`
                    h-1.5 w-1.5 rounded-full
                    ${
                        normalized === "active"
                            ? "bg-emerald-500"
                            : normalized ===
                                "suspended"
                              ? "bg-red-500"
                              : "bg-amber-500"
                    }
                `}
            />

            {normalized}
        </span>
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

const getInitials = (
    name
) => {
    if (!name) {
        return "U";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
            part
                .charAt(0)
                .toUpperCase()
        )
        .join("");
};

const formatDate = (
    value
) => {
    if (!value) {
        return "Not available";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            dateStyle: "medium",
        }
    ).format(
        new Date(value)
    );
};

export default UsersTable;