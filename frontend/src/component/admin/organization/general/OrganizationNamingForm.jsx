import { Type } from "lucide-react";

function OrganizationNamingForm({
    form,
    setForm,
}) {
    const updateField = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7046f5]/10">

                    <Type
                        size={17}
                        className="text-[#7046f5]"
                    />

                </div>

                <div>

                    <h2 className="text-sm font-bold text-slate-900">
                        Organization Naming
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Optional organization name formatting settings.
                    </p>

                </div>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">

                <div>

                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Name Prefix
                    </label>

                    <input
                        type="text"
                        value={form.name_prefix}
                        onChange={(event) =>
                            updateField(
                                "name_prefix",
                                event.target.value
                            )
                        }
                        placeholder="Example: MSP"
                        className={inputClasses}
                    />

                    <p className="mt-2 text-xs text-slate-400">
                        Optional prefix used by organization naming rules.
                    </p>

                </div>

                <div>

                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Name Suffix
                    </label>

                    <input
                        type="text"
                        value={form.name_suffix}
                        onChange={(event) =>
                            updateField(
                                "name_suffix",
                                event.target.value
                            )
                        }
                        placeholder="Example: Portal"
                        className={inputClasses}
                    />

                    <p className="mt-2 text-xs text-slate-400">
                        Optional suffix for organization naming.
                    </p>

                </div>

            </div>

        </section>
    );
}

const inputClasses = `
    h-12 w-full rounded-xl
    border border-slate-200
    bg-white px-4
    text-sm text-slate-800
    outline-none transition
    placeholder:text-slate-400
    focus:border-[#19b5fe]
    focus:ring-4
    focus:ring-[#19b5fe]/10
`;

export default OrganizationNamingForm;