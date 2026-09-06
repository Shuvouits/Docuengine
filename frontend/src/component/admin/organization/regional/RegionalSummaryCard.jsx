import {
    CalendarDays,
    Clock3,
    Globe2,
} from "lucide-react";

function RegionalSummaryCard({
    form,
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7046f5]/10">
                    <Globe2
                        size={17}
                        className="text-[#7046f5]"
                    />
                </div>

                <div>
                    <h2 className="text-sm font-bold text-slate-900">
                        Current Regional Setup
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Preview of the regional settings applied to this MSP.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-5">
                <SummaryItem
                    icon={Globe2}
                    label="Locale"
                    value={form.locale}
                />

                <SummaryItem
                    icon={Clock3}
                    label="Timezone"
                    value={form.timezone}
                />

                <SummaryItem
                    icon={CalendarDays}
                    label="Date Format"
                    value={form.date_format}
                />

                <SummaryItem
                    icon={Clock3}
                    label="Time Format"
                    value={form.time_format}
                />

                <SummaryItem
                    icon={CalendarDays}
                    label="Week Starts"
                    value={capitalize(form.week_start)}
                />
            </div>
        </section>
    );
}

function SummaryItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <Icon
                    size={15}
                    className="text-[#19b5fe]"
                />
            </div>

            <p className="mt-4 text-[11px] font-medium text-slate-400">
                {label}
            </p>

            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                {value || "Not set"}
            </p>
        </div>
    );
}

function capitalize(value) {
    if (!value) {
        return "Not set";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

export default RegionalSummaryCard;