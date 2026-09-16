import {
    Edit3,
    LockKeyhole,
    Search,
    Trash2,
    UserRoundCog,
    Users,
} from "lucide-react";

const SecurityGroupsTable = ({
    groups = [],
    totalGroups,
    search,
    setSearch,
    canUpdate,
    canDelete,
    canAssign,
    onEdit,
    onMembers,
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
                        placeholder="Search security groups..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                            <TableHead>
                                Group
                            </TableHead>

                            <TableHead>
                                Type
                            </TableHead>

                            <TableHead>
                                Members
                            </TableHead>

                            <TableHead>
                                Created By
                            </TableHead>

                            <TableHead>
                                Updated
                            </TableHead>

                            <TableHead align="right">
                                Actions
                            </TableHead>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {groups.map(
                            (group) => (
                                <tr
                                    key={
                                        group.id
                                    }
                                    className="transition hover:bg-slate-50/60"
                                >
                                    <td className="px-5 py-4">
                                        <div>
                                            <p className="text-sm font-semibold text-[#07111f]">
                                                {
                                                    group.name
                                                }
                                            </p>

                                            <p className="mt-1 max-w-[320px] truncate text-xs text-slate-400">
                                                {group.description ||
                                                    "No description"}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        {group.is_system ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                                                <LockKeyhole
                                                    size={
                                                        11
                                                    }
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
                                        <div className="flex items-center gap-2">
                                            <Users
                                                size={
                                                    15
                                                }
                                                className="text-slate-400"
                                            />

                                            <span className="text-sm font-semibold text-slate-700">
                                                {group.users_count ||
                                                    0}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-xs font-semibold text-slate-700">
                                            {group.created_by?.name ||
                                                "System"}
                                        </p>

                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {group.created_by?.email ||
                                                ""}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4 text-xs text-slate-500">
                                        {formatDate(
                                            group.updated_at
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            {canAssign && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onMembers(
                                                            group
                                                        )
                                                    }
                                                    className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[#19b5fe]/40 hover:text-[#159edb]"
                                                >
                                                    <UserRoundCog
                                                        size={
                                                            14
                                                        }
                                                    />
                                                    Members
                                                </button>
                                            )}

                                            {canUpdate && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onEdit(
                                                            group
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
                                                !group.is_system && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onDelete(
                                                                group
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
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {!groups.length && (
                <div className="px-6 py-16 text-center">
                    <Users
                        size={30}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 font-semibold text-slate-700">
                        No security groups found
                    </h3>
                </div>
            )}

            <div className="border-t border-slate-100 px-5 py-4">
                <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                        {groups.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                        {totalGroups}
                    </span>{" "}
                    groups
                </p>
            </div>
        </div>
    );
};

const TableHead = ({
    children,
    align = "left",
}) => (
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

export default SecurityGroupsTable;