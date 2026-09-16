import {
    Check,
    ChevronDown,
    KeyRound,
    LoaderCircle,
    Search,
    X,
} from "lucide-react";

import {
    useMemo,
    useState,
} from "react";

const RoleFormModal = ({
    title,
    description,
    permissions = [],
    role = null,
    loading,
    onClose,
    onSubmit,
}) => {
    const isEditing =
        Boolean(role);

    const [
        roleName,
        setRoleName,
    ] = useState(
        role?.name || ""
    );

    const [
        selectedPermissions,
        setSelectedPermissions,
    ] = useState(
        role?.permissions?.map(
            (permission) =>
                permission.name
        ) || []
    );

    const [
        permissionSearch,
        setPermissionSearch,
    ] = useState("");

    const [
        formError,
        setFormError,
    ] = useState("");

    const groupedPermissions =
        useMemo(() => {
            const keyword =
                permissionSearch
                    .trim()
                    .toLowerCase();

            const filtered =
                permissions.filter(
                    (permission) =>
                        !keyword ||
                        permission.name
                            ?.toLowerCase()
                            .includes(
                                keyword
                            )
                );

            return filtered.reduce(
                (
                    groups,
                    permission
                ) => {
                    const groupKey =
                        permission.name
                            ?.split(".")[0] ||
                        "other";

                    if (
                        !groups[groupKey]
                    ) {
                        groups[
                            groupKey
                        ] = [];
                    }

                    groups[groupKey].push(
                        permission
                    );

                    return groups;
                },
                {}
            );
        }, [
            permissions,
            permissionSearch,
        ]);

    const togglePermission = (
        permissionName
    ) => {
        setSelectedPermissions(
            (current) =>
                current.includes(
                    permissionName
                )
                    ? current.filter(
                          (item) =>
                              item !==
                              permissionName
                      )
                    : [
                          ...current,
                          permissionName,
                      ]
        );

        setFormError("");
    };

    const toggleGroup = (
        groupPermissions
    ) => {
        const names =
            groupPermissions.map(
                (permission) =>
                    permission.name
            );

        const allSelected =
            names.every((name) =>
                selectedPermissions.includes(
                    name
                )
            );

        if (allSelected) {
            setSelectedPermissions(
                (current) =>
                    current.filter(
                        (name) =>
                            !names.includes(
                                name
                            )
                    )
            );
        } else {
            setSelectedPermissions(
                (current) => [
                    ...new Set([
                        ...current,
                        ...names,
                    ]),
                ]
            );
        }
    };

    const selectAll = () => {
        setSelectedPermissions(
            permissions.map(
                (permission) =>
                    permission.name
            )
        );
    };

    const clearAll = () => {
        setSelectedPermissions([]);
    };

    const submit = async (e) => {
        e.preventDefault();

        setFormError("");

        if (!roleName.trim()) {
            setFormError(
                "Role name is required."
            );
            return;
        }

        const result =
            await onSubmit({
                name:
                    roleName.trim(),

                permissions:
                    selectedPermissions,
            });

        if (
            result?.ok === false
        ) {
            setFormError(
                result.message ||
                    "Unable to save role."
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 px-4 py-4 backdrop-blur-[2px]">
            <div className="relative flex max-h-[calc(100vh-32px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
                >
                    <X size={18} />
                </button>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="shrink-0 border-b border-slate-100 px-6 py-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#19b5fe]">
                            <KeyRound
                                size={20}
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                            {title}
                        </h2>

                        <p className="mt-1 pr-8 text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
                        {formError && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Role Name
                            </label>

                            <input
                                type="text"
                                value={
                                    roleName
                                }
                                onChange={(e) =>
                                    setRoleName(
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Example: Service Desk Manager"
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                            />
                        </div>

                        <div className="mt-7">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Permissions
                                    </label>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {
                                            selectedPermissions.length
                                        }{" "}
                                        of{" "}
                                        {
                                            permissions.length
                                        }{" "}
                                        selected
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={
                                            selectAll
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        Select All
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            clearAll
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            <div className="relative mt-4">
                                <Search
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={
                                        permissionSearch
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setPermissionSearch(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Search permissions..."
                                    className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-[#19b5fe]"
                                />
                            </div>

                            <div className="mt-4 space-y-4">
                                {Object.entries(
                                    groupedPermissions
                                ).map(
                                    ([
                                        group,
                                        groupPermissions,
                                    ]) => {
                                        const allSelected =
                                            groupPermissions.every(
                                                (
                                                    permission
                                                ) =>
                                                    selectedPermissions.includes(
                                                        permission.name
                                                    )
                                            );

                                        return (
                                            <div
                                                key={
                                                    group
                                                }
                                                className="overflow-hidden rounded-xl border border-slate-200"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleGroup(
                                                            groupPermissions
                                                        )
                                                    }
                                                    className="flex w-full items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 text-left"
                                                >
                                                    <div>
                                                        <p className="text-xs font-bold capitalize text-slate-700">
                                                            {formatGroupName(
                                                                group
                                                            )}
                                                        </p>

                                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                                            {
                                                                groupPermissions.length
                                                            }{" "}
                                                            permissions
                                                        </p>
                                                    </div>

                                                    <div
                                                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                                                            allSelected
                                                                ? "border-[#19b5fe] bg-[#19b5fe] text-white"
                                                                : "border-slate-300 bg-white"
                                                        }`}
                                                    >
                                                        {allSelected && (
                                                            <Check
                                                                size={
                                                                    13
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </button>

                                                <div className="grid gap-2 p-3 sm:grid-cols-2">
                                                    {groupPermissions.map(
                                                        (
                                                            permission
                                                        ) => {
                                                            const selected =
                                                                selectedPermissions.includes(
                                                                    permission.name
                                                                );

                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={
                                                                        permission.id
                                                                    }
                                                                    onClick={() =>
                                                                        togglePermission(
                                                                            permission.name
                                                                        )
                                                                    }
                                                                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                                                                        selected
                                                                            ? "border-[#19b5fe]/40 bg-[#19b5fe]/5"
                                                                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                                                            selected
                                                                                ? "border-[#19b5fe] bg-[#19b5fe] text-white"
                                                                                : "border-slate-300 bg-white"
                                                                        }`}
                                                                    >
                                                                        {selected && (
                                                                            <Check
                                                                                size={
                                                                                    13
                                                                                }
                                                                            />
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <p className="break-all text-xs font-semibold text-slate-700">
                                                                            {
                                                                                permission.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            disabled={
                                loading
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#19b5fe] text-sm font-semibold text-white transition hover:bg-[#159edb] disabled:opacity-60"
                        >
                            {loading && (
                                <LoaderCircle
                                    size={
                                        16
                                    }
                                    className="animate-spin"
                                />
                            )}

                            {isEditing
                                ? "Save Changes"
                                : "Create Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const formatGroupName = (
    group
) => {
    return group
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (char) =>
                char.toUpperCase()
        );
};

export default RoleFormModal;