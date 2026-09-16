import {
    LoaderCircle,
    Search,
    UserMinus,
    UserPlus,
    Users,
    X,
} from "lucide-react";

import {
    useMemo,
    useState,
} from "react";

const SecurityGroupMembersModal = ({
    group,
    tenantUsers = [],
    loading,
    onClose,
    onAddUser,
    onRemoveUser,
}) => {
    const [search, setSearch] =
        useState("");

    const [error, setError] =
        useState("");

    const memberIds =
        useMemo(
            () =>
                new Set(
                    (
                        group?.users ||
                        []
                    ).map(
                        (user) =>
                            user.id
                    )
                ),
            [group]
        );

    const users =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();

            return tenantUsers.filter(
                (membership) => {
                    const user =
                        membership.user || {};

                    return (
                        !keyword ||
                        user.name
                            ?.toLowerCase()
                            .includes(
                                keyword
                            ) ||
                        user.email
                            ?.toLowerCase()
                            .includes(
                                keyword
                            )
                    );
                }
            );
        }, [
            tenantUsers,
            search,
        ]);

    const handleAdd = async (
        userId
    ) => {
        setError("");

        const result =
            await onAddUser(
                group.id,
                userId
            );

        if (
            result?.ok === false
        ) {
            setError(
                result.message
            );
        }
    };

    const handleRemove = async (
        userId
    ) => {
        setError("");

        const result =
            await onRemoveUser(
                group.id,
                userId
            );

        if (
            result?.ok === false
        ) {
            setError(
                result.message
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 px-4 py-4 backdrop-blur-[2px]">
            <div className="relative flex max-h-[calc(100vh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                    <X size={18} />
                </button>

                <div className="shrink-0 border-b border-slate-100 px-6 py-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#19b5fe]">
                        <Users size={20} />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                        Manage Members
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage users assigned to{" "}
                        <span className="font-semibold text-slate-700">
                            {group?.name}
                        </span>
                        .
                    </p>

                    <div className="relative mt-4">
                        <Search
                            size={16}
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
                            placeholder="Search users..."
                            className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-[#19b5fe]"
                        />
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-6 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        {users.map(
                            (
                                membership
                            ) => {
                                const user =
                                    membership.user ||
                                    {};

                                const isMember =
                                    memberIds.has(
                                        user.id
                                    );

                                return (
                                    <div
                                        key={
                                            user.id
                                        }
                                        className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {
                                                    user.name
                                                }
                                            </p>

                                            <p className="mt-1 truncate text-xs text-slate-400">
                                                {
                                                    user.email
                                                }
                                            </p>
                                        </div>

                                        {isMember ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemove(
                                                        user.id
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <LoaderCircle
                                                        size={
                                                            13
                                                        }
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <UserMinus
                                                        size={
                                                            14
                                                        }
                                                    />
                                                )}

                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleAdd(
                                                        user.id
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#19b5fe]/30 px-3 text-xs font-semibold text-[#159edb] hover:bg-[#19b5fe]/5 disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <LoaderCircle
                                                        size={
                                                            13
                                                        }
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <UserPlus
                                                        size={
                                                            14
                                                        }
                                                    />
                                                )}

                                                Add
                                            </button>
                                        )}
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecurityGroupMembersModal;