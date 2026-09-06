import { SlidersHorizontal } from "lucide-react";

function AppearanceSettingsCard({
    form,
    setForm,
}) {
    const updateField = (
        field,
        value
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7046f5]/10">

                    <SlidersHorizontal
                        size={17}
                        className="text-[#7046f5]"
                    />

                </div>

                <div>

                    <h2 className="text-sm font-bold text-slate-900">
                        Appearance Preferences
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Tenant-specific interface preferences stored with branding.
                    </p>

                </div>

            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">

                {/* Sidebar Style */}

                <div>

                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Sidebar Style
                    </label>

                    <select
                        value={
                            form.sidebar_style
                        }
                        onChange={(event) =>
                            updateField(
                                "sidebar_style",
                                event.target.value
                            )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                    >
                        <option value="">
                            Not configured
                        </option>

                        <option value="dark">
                            Dark
                        </option>

                        <option value="light">
                            Light
                        </option>

                    </select>

                </div>

                {/* Border Radius */}

                <div>

                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Border Radius
                    </label>

                    <input
                        type="text"
                        value={
                            form.border_radius
                        }
                        onChange={(event) =>
                            updateField(
                                "border_radius",
                                event.target.value
                            )
                        }
                        placeholder="Example: 12px"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                    />

                </div>

            </div>

        </section>
    );
}

export default AppearanceSettingsCard;