import {
    ShieldCheck,
    UserCheck,
    UserX,
    Users,
} from "lucide-react";

const UsersStats = ({
    stats,
}) => {
    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Total Users"
                value={stats?.total ?? 0}
                icon={Users}
            />

            <StatCard
                title="Active"
                value={stats?.active ?? 0}
                icon={UserCheck}
            />

            <StatCard
                title="Suspended"
                value={stats?.suspended ?? 0}
                icon={UserX}
            />

            <StatCard
                title="MSP Admins"
                value={stats?.admins ?? 0}
                icon={ShieldCheck}
            />
        </div>
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
                    <Icon
                        size={19}
                        strokeWidth={1.8}
                    />
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

export default UsersStats;