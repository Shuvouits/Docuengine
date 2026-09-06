function SectionCard({
    title,
    description,
    icon: Icon,
    children,
    noPadding = false,
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10">

                    <Icon
                        size={17}
                        className="text-[#19b5fe]"
                    />

                </div>

                <div>
                    <h2 className="text-sm font-bold text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

            </div>

            <div
                className={
                    noPadding
                        ? ""
                        : "px-6 py-2"
                }
            >
                {children}
            </div>

        </section>
    );
}

export default SectionCard;