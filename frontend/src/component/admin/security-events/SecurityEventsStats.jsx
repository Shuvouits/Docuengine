import {
    Activity,
    CircleAlert,
    Info,
    ShieldAlert,
} from "lucide-react";

const SecurityEventsStats = ({
    stats,
}) => {
    const cards = [
        {
            label: "Total Events",
            value: stats.total,
            icon: Activity,
        },
        {
            label: "Info On Page",
            value: stats.info,
            icon: Info,
        },
        {
            label: "Warnings On Page",
            value: stats.warning,
            icon: CircleAlert,
        },
        {
            label: "Critical On Page",
            value: stats.critical,
            icon: ShieldAlert,
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

                                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
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

export default SecurityEventsStats;