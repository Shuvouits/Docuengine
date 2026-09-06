import { Building2, LockKeyhole } from "lucide-react";

function OrganizationIdentityForm({
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

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#19b5fe]/10">
                    <Building2
                        size={17}
                        className="text-[#19b5fe]"
                    />
                </div>

                <div>
                    <h2 className="text-sm font-bold text-slate-900">
                        Organization Identity
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Basic information used to identify this MSP.
                    </p>
                </div>

            </div>

            <div className="space-y-5 p-6">

                {/* Organization Name */}

                <Field>
                    <Label>
                        Organization Name
                    </Label>

                    <input
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                            updateField(
                                "name",
                                event.target.value
                            )
                        }
                        placeholder="Organization name"
                        className={inputClasses}
                    />
                </Field>

                {/* Display Name */}

                <Field>
                    <Label>
                        Display Name
                    </Label>

                    <input
                        type="text"
                        value={form.display_name}
                        onChange={(event) =>
                            updateField(
                                "display_name",
                                event.target.value
                            )
                        }
                        placeholder="Display name"
                        className={inputClasses}
                    />

                    <p className="mt-2 text-xs text-slate-400">
                        Used in the workspace interface and branding areas.
                    </p>
                </Field>

                {/* Read Only */}

                <div className="grid gap-5 md:grid-cols-2">

                    <Field>
                        <Label>
                            Slug
                        </Label>

                        <div className="relative">

                            <input
                                type="text"
                                value={form.slug}
                                readOnly
                                className={`${inputClasses} bg-slate-50 pr-10 text-slate-500`}
                            />

                            <LockKeyhole
                                size={15}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                            Tenant slug cannot be changed here.
                        </p>
                    </Field>

                    <Field>
                        <Label>
                            Tenant ID
                        </Label>

                        <div className="relative">

                            <input
                                type="text"
                                value={form.id}
                                readOnly
                                className={`${inputClasses} bg-slate-50 pr-10 text-slate-500`}
                            />

                            <LockKeyhole
                                size={15}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                        </div>

                    </Field>

                </div>

            </div>

        </section>
    );
}

function Field({ children }) {
    return (
        <div>
            {children}
        </div>
    );
}

function Label({ children }) {
    return (
        <label className="mb-2 block text-xs font-semibold text-slate-700">
            {children}
        </label>
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

export default OrganizationIdentityForm;