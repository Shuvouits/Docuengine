import {
    CheckCircle2,
    Flag,
    Languages,
    ShieldCheck,
} from "lucide-react";

function OverviewStats({
    organization,
    membership,
    enabledFeatures = [],
    totalFeatures = 0,
    terminology = {},
}) {
    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {/* Lifecycle Status */}

            <StatCard
                title="Lifecycle Status"
                value={capitalize(
                    organization?.status
                )}
                description="Current organization status"
                icon={CheckCircle2}
            />

            {/* Access Level */}

            <StatCard
                title="Access Level"
                value={capitalize(
                    membership?.role
                )}
                description="Your tenant membership role"
                icon={ShieldCheck}
            />

            {/* Enabled Features */}

            <StatCard
                title="Enabled Features"
                value={`${enabledFeatures.length}/${totalFeatures}`}
                description="Active organization features"
                icon={Flag}
            />

            {/* Terminology */}

            <StatCard
                title="Terminology"
                value={
                    Object.keys(
                        terminology
                    ).length
                }
                description="Configured naming terms"
                icon={Languages}
            />

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
    title,
    value,
    description,
    icon: Icon,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe]/10 to-[#7046f5]/10">

                <Icon
                    size={20}
                    className="text-[#7046f5]"
                />

            </div>

            <p className="mt-5 text-xs font-medium text-slate-500">
                {title}
            </p>

            <p className="mt-1 text-2xl font-bold text-[#07111f]">
                {value ?? "Not set"}
            </p>

            <p className="mt-2 text-xs text-slate-400">
                {description}
            </p>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

function capitalize(value) {
    if (!value) {
        return "Unknown";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

export default OverviewStats;