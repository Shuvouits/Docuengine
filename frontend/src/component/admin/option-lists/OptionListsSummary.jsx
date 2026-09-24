import {
    CheckCircle2,
    ListChecks,
    Rows3,
} from "lucide-react";

function OptionListsSummary({
    optionLists = [],
}) {
    const totalLists =
        optionLists.length;

    const activeLists =
        optionLists.filter(
            (item) =>
                item.is_active !== false
        ).length;

    const totalItems =
        optionLists.reduce(
            (total, item) =>
                total +
                Number(
                    item.items_count || 0
                ),
            0
        );

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
                icon={ListChecks}
                label="Option Lists"
                value={totalLists}
                description="Reusable option groups"
            />

            <SummaryCard
                icon={CheckCircle2}
                label="Active Lists"
                value={activeLists}
                description="Available for custom fields"
            />

            <SummaryCard
                icon={Rows3}
                label="Configured Options"
                value={totalItems}
                description="Options across all lists"
            />
        </div>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    description,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                        {value}
                    </p>
                </div>

                <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                        color:
                            "var(--brand-primary)",
                        backgroundColor:
                            "color-mix(in srgb, var(--brand-primary) 9%, white)",
                    }}
                >
                    <Icon
                        size={19}
                        strokeWidth={1.8}
                    />
                </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
                {description}
            </p>
        </div>
    );
}

export default OptionListsSummary;