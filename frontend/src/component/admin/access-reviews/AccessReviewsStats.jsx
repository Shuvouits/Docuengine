import {
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileClock,
} from "lucide-react";

const AccessReviewsStats = ({
    stats,
}) => {
    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Total Reviews"
                value={
                    stats?.total ?? 0
                }
                icon={
                    ClipboardCheck
                }
            />

            <StatCard
                title="Draft"
                value={
                    stats?.draft ?? 0
                }
                icon={FileClock}
            />

            <StatCard
                title="In Progress"
                value={
                    stats?.inProgress ??
                    0
                }
                icon={Clock3}
            />

            <StatCard
                title="Completed"
                value={
                    stats?.completed ??
                    0
                }
                icon={
                    CheckCircle2
                }
            />
        </div>
    );
};

const StatCard = ({
    title,
    value,
    icon: Icon,
}) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#19b5fe]">
                <Icon
                    size={19}
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

export default AccessReviewsStats;