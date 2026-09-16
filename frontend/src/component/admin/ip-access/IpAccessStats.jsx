import {
    Ban,
    CheckCircle2,
    ListFilter,
    ShieldCheck,
} from "lucide-react";

const IpAccessStats = ({
    stats,
}) => {
    const cards = [
        {
            label: "Total Rules",
            value: stats.total,
            icon: ListFilter,
        },
        {
            label: "Active Rules",
            value: stats.active,
            icon: CheckCircle2,
        },
        {
            label: "Inactive Rules",
            value: stats.inactive,
            icon: Ban,
        },
        {
            label: "Policy Status",
            value: stats.policyEnabled
                ? "Enabled"
                : "Disabled",
            icon: ShieldCheck,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    {card.label}
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-slate-900">
                                    {card.value}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                                <Icon size={21} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default IpAccessStats;