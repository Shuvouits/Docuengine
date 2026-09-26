import {
    Archive,
    Building2,
    CirclePause,
    CircleCheckBig,
} from "lucide-react";

const StatCard = ({
    label,
    value,
    icon: Icon,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {label}
                    </p>

                    <div className="mt-2 text-[27px] font-bold text-slate-900">
                        {value ?? 0}
                    </div>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                    <Icon size={19} />
                </div>
            </div>
        </div>
    );
};

const CompaniesStats = ({
    summary = {},
}) => {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                label="Total Companies"
                value={summary.total}
                icon={Building2}
            />

            <StatCard
                label="Active"
                value={summary.active}
                icon={CircleCheckBig}
            />

            <StatCard
                label="Inactive"
                value={summary.inactive}
                icon={CirclePause}
            />

            <StatCard
                label="Archived"
                value={summary.archived}
                icon={Archive}
            />
        </div>
    );
};

export default CompaniesStats;