import {
    KeyRound,
    LockKeyhole,
    ShieldCheck,
    SlidersHorizontal,
} from "lucide-react";

const RolesStats = ({
    stats,
}) => {
    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Total Roles"
                value={stats?.total ?? 0}
                icon={KeyRound}
            />

            <StatCard
                title="System Roles"
                value={stats?.system ?? 0}
                icon={LockKeyhole}
            />

            <StatCard
                title="Custom Roles"
                value={stats?.custom ?? 0}
                icon={ShieldCheck}
            />

            <StatCard
                title="Permissions"
                value={
                    stats?.permissions ?? 0
                }
                icon={SlidersHorizontal}
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

export default RolesStats;