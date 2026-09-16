import {
    Edit3,
    LockKeyhole,
    Search,
    ShieldCheck,
    Trash2,
} from "lucide-react";

const RolesTable = ({
    roles = [],
    totalRoles = 0,
    search,
    setSearch,
    canUpdate,
    canDelete,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5">
                <div className="relative">
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
                        placeholder="Search roles or permissions..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                            <TableHeader>
                                Role
                            </TableHeader>

                            <TableHeader>
                                Type
                            </TableHeader>

                            <TableHeader>
                                Permissions
                            </TableHeader>

                            <TableHeader>
                                Updated
                            </TableHeader>

                            <TableHeader align="right">
                                Actions
                            </TableHeader>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {roles.map((role) => (
                            <tr
                                key={role.id}
                                className="transition hover:bg-slate-50/60"
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#19b5fe]">
                                            <ShieldCheck
                                                size={18}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-[#07111f]">
                                                {role.name}
                                            </p>

                                            <p className="mt-1 text-[11px] text-slate-400">
                                                {role.guard_name}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-5 py-4">
                                    {role.is_system ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                                            <LockKeyhole
                                                size={11}
                                            />
                                            System
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                            Custom
                                        </span>
                                    )}
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex max-w-[420px] flex-wrap gap-1.5">
                                        {role.permissions
                                            ?.slice(
                                                0,
                                                3
                                            )
                                            .map(
                                                (
                                                    permission
                                                ) => (
                                                    <span
                                                        key={
                                                            permission.id
                                                        }
                                                        className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"
                                                    >
                                                        {
                                                            permission.name
                                                        }
                                                    </span>
                                                )
                                            )}

                                        {role.permission_count >
                                            3 && (
                                            <span className="rounded-md bg-[#19b5fe]/10 px-2 py-1 text-[10px] font-semibold text-[#159edb]">
                                                +
                                                {role.permission_count -
                                                    3}{" "}
                                                more
                                            </span>
                                        )}

                                        {!role.permission_count && (
                                            <span className="text-xs text-slate-400">
                                                No permissions
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-xs text-slate-500">
                                    {formatDate(
                                        role.updated_at
                                    )}
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex justify-end gap-2">
                                        {canUpdate && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onEdit(
                                                        role
                                                    )
                                                }
                                                className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[#19b5fe]/40 hover:text-[#159edb]"
                                            >
                                                <Edit3
                                                    size={
                                                        14
                                                    }
                                                />
                                                Edit
                                            </button>
                                        )}

                                        {canDelete &&
                                            !role.is_system && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDelete(
                                                            role
                                                        )
                                                    }
                                                    className="flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash2
                                                        size={
                                                            14
                                                        }
                                                    />
                                                    Delete
                                                </button>
                                            )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!roles.length && (
                <div className="px-6 py-16 text-center">
                    <ShieldCheck
                        size={30}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 font-semibold text-slate-700">
                        No roles found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Try adjusting your search.
                    </p>
                </div>
            )}

            <div className="border-t border-slate-100 px-5 py-4">
                <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                        {roles.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                        {totalRoles}
                    </span>{" "}
                    roles
                </p>
            </div>
        </div>
    );
};

const TableHeader = ({
    children,
    align = "left",
}) => {
    return (
        <th
            className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 ${
                align === "right"
                    ? "text-right"
                    : "text-left"
            }`}
        >
            {children}
        </th>
    );
};

const formatDate = (value) => {
    if (!value) {
        return "Not available";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            dateStyle: "medium",
        }
    ).format(new Date(value));
};

export default RolesTable;