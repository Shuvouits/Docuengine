import {
    ArrowUpRight,
    TrendingUp,
} from "lucide-react";

function StatCard({
    title,
    value,
    change,
    description,
    icon: Icon,
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50">

            {/* Decorative Gradient */}

            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#19b5fe]/5 blur-2xl transition duration-300 group-hover:bg-[#19b5fe]/10" />


            {/* =========================
                TOP ROW
            ========================== */}

            <div className="relative flex items-start justify-between">

                {/* Icon */}

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe]/10 to-[#7c3aed]/10">

                    <Icon
                        size={20}
                        strokeWidth={1.8}
                        className="text-[#7046f5]"
                    />

                </div>


                {/* Growth */}

                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1">

                    <TrendingUp
                        size={12}
                        className="text-emerald-500"
                    />

                    <span className="text-[10px] font-bold text-emerald-600">
                        {change}
                    </span>

                </div>

            </div>


            {/* =========================
                CONTENT
            ========================== */}

            <div className="relative mt-5">

                <p className="text-xs font-medium text-slate-500">
                    {title}
                </p>

                <div className="mt-1 flex items-end justify-between gap-3">

                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                        {value}
                    </h3>

                    <ArrowUpRight
                        size={17}
                        className="mb-1 text-slate-300 transition group-hover:text-[#19b5fe]"
                    />

                </div>

                <p className="mt-1 text-[11px] text-slate-400">
                    {description}
                </p>

            </div>


            {/* =========================
                BOTTOM ACCENT
            ========================== */}

            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#19b5fe] to-[#7c3aed] transition-all duration-500 group-hover:w-full" />

        </div>
    );
}

export default StatCard;