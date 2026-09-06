import { Palette } from "lucide-react";

function BrandColorsCard({
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

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#19b5fe]/10">
                    <Palette
                        size={17}
                        className="text-[#19b5fe]"
                    />
                </div>

                <div>
                    <h2 className="text-sm font-bold text-slate-900">
                        Brand Colors
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Colors assigned to this organization.
                    </p>
                </div>

            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">

                <ColorField
                    label="Primary Color"
                    value={form.primary_color}
                    onChange={(value) =>
                        updateField(
                            "primary_color",
                            value
                        )
                    }
                />

                <ColorField
                    label="Secondary Color"
                    value={form.secondary_color}
                    onChange={(value) =>
                        updateField(
                            "secondary_color",
                            value
                        )
                    }
                />

            </div>

        </section>
    );
}

function ColorField({
    label,
    value,
    onChange,
}) {
    return (
        <div>

            <label className="mb-2 block text-xs font-semibold text-slate-700">
                {label}
            </label>

            <div className="flex gap-3">

                <input
                    type="color"
                    value={
                        isValidHex(value)
                            ? value
                            : "#ffffff"
                    }
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    className="h-12 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                />

                <input
                    type="text"
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    placeholder="#000000"
                    className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-800 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                />

            </div>

        </div>
    );
}

function isValidHex(value) {
    return /^#[0-9A-Fa-f]{6}$/.test(
        value || ""
    );
}

export default BrandColorsCard;