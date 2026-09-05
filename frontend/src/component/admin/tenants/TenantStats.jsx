import {
    Building2,
    CheckCircle2,
    Clock3,
    Ban,
} from "lucide-react";

function TenantStats({ stats }) {
    const cards = [
        {
            label: "Total Tenants",
            value: stats.total,
            description: "Organizations on platform",
            icon: Building2,
        },
        {
            label: "Active Tenants",
            value: stats.active,
            description: "Currently active",
            icon: CheckCircle2,
        },
        {
            label: "Onboarding",
            value: stats.onboarding,
            description: "Setup in progress",
            icon: Clock3,
        },
        {
            label: "Suspended",
            value: stats.suspended,
            description: "Access restricted",
            icon: Ban,
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                    >

                        <div className="flex items-start justify-between">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10">
                                <Icon
                                    size={19}
                                    strokeWidth={1.8}
                                    className="text-[#19b5fe]"
                                />
                            </div>

                        </div>

                        <div className="mt-5">
                            <p className="text-xs font-medium text-slate-500">
                                {card.label}
                            </p>

                            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                {card.value}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                {card.description}
                            </p>
                        </div>

                    </div>
                );
            })}

        </div>
    );
}

export default TenantStats;