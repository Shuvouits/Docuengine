import {
    ChevronDown,
    Search,
} from "lucide-react";

const UsersToolbar = ({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    roles,
}) => {
    return (
        <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
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
                        placeholder="Search users by name, email or role..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                    />
                </div>

                <FilterSelect
                    value={statusFilter}
                    onChange={
                        setStatusFilter
                    }
                    options={[
                        {
                            value: "all",
                            label: "All Statuses",
                        },
                        {
                            value: "active",
                            label: "Active",
                        },
                        {
                            value: "suspended",
                            label: "Suspended",
                        },
                        {
                            value: "inactive",
                            label: "Inactive",
                        },
                    ]}
                />

                <FilterSelect
                    value={roleFilter}
                    onChange={
                        setRoleFilter
                    }
                    options={[
                        {
                            value: "all",
                            label: "All Roles",
                        },

                        ...roles.map(
                            (role) => ({
                                value: role,
                                label: role,
                            })
                        ),
                    ]}
                />
            </div>
        </div>
    );
};

const FilterSelect = ({
    value,
    onChange,
    options,
}) => {
    return (
        <div className="relative min-w-[170px]">
            <select
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm font-medium text-slate-600 outline-none transition focus:border-[#19b5fe]"
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

export default UsersToolbar;