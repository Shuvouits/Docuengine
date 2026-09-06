import {
    CheckCircle2,
    Flag,
    Power,
    PowerOff,
} from "lucide-react";

function FeatureFlagsSummary({
    flags = [],
}) {
    const enabledCount =
        flags.filter(
            (flag) =>
                Boolean(flag.enabled)
        ).length;

    const disabledCount =
        flags.length -
        enabledCount;

    return (
        <div className="grid gap-5 sm:grid-cols-3">

            <SummaryCard
                title="Total Features"
                value={flags.length}
                description="Registered tenant features"
                icon={Flag}
            />

            <SummaryCard
                title="Enabled"
                value={enabledCount}
                description="Available to this organization"
                icon={Power}
            />

            <SummaryCard
                title="Disabled"
                value={disabledCount}
                description="Currently unavailable"
                icon={PowerOff}
            />

        </div>
    );
}

function SummaryCard({
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
                {value}
            </p>

            <p className="mt-2 text-xs text-slate-400">
                {description}
            </p>

        </div>
    );
}

export default FeatureFlagsSummary;