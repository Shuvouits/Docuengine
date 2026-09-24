import {
    Building2,
    CheckCircle2,
    Layers3,
    PowerOff,
} from "lucide-react";

function CompanyLayoutsSummary({
    companies = [],
    layouts = [],
    activations = [],
}) {
    const activeAssignments =
        activations.filter(
            (item) =>
                item?.is_active === true ||
                item?.status === "active"
        ).length;

    const inactiveAssignments =
        activations.filter(
            (item) =>
                item?.is_active === false ||
                item?.status === "inactive"
        ).length;

    const cards = [
        {
            label: "Managed Companies",
            value: companies.length,
            description:
                "Companies available for layout assignment",
            icon: Building2,
        },
        {
            label: "Asset Layouts",
            value: layouts.length,
            description:
                "Reusable documentation structures",
            icon: Layers3,
        },
        {
            label: "Active Assignments",
            value: activeAssignments,
            description:
                "Layouts currently enabled for companies",
            icon: CheckCircle2,
        },
        {
            label: "Inactive Assignments",
            value: inactiveAssignments,
            description:
                "Previously assigned layouts",
            icon: PowerOff,
        },
    ];

    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold text-slate-500">
                                    {card.label}
                                </p>

                                <p className="mt-2 text-2xl font-bold text-[#07111f]">
                                    {card.value}
                                </p>
                            </div>

                            <div
                                className="
                                    flex h-10 w-10
                                    shrink-0 items-center
                                    justify-center rounded-xl
                                "
                                style={{
                                    color:
                                        "var(--brand-primary)",
                                    backgroundColor:
                                        "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
                                }}
                            >
                                <Icon size={19} />
                            </div>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-slate-400">
                            {card.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

export default CompanyLayoutsSummary;