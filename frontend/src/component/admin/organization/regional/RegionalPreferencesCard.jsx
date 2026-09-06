import {
    CalendarDays,
    Clock3,
    Globe2,
} from "lucide-react";

function RegionalPreferencesCard({
    form,
    setForm,
    locales = [],
    timezones = [],
    dateFormats = [],
    timeFormats = [],
    weekStartOptions = [],
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
                    <Globe2
                        size={17}
                        className="text-[#19b5fe]"
                    />
                </div>

                <div>
                    <h2 className="text-sm font-bold text-slate-900">
                        Regional Preferences
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Configure localization, timezone and date preferences.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">
                {/* Locale */}

                <Field
                    label="Locale"
                    icon={Globe2}
                    description="Controls the organization language and regional locale."
                >
                    <select
                        value={form.locale}
                        onChange={(event) =>
                            updateField(
                                "locale",
                                event.target.value
                            )
                        }
                        className={selectClasses}
                    >
                        <option value="">
                            Select locale
                        </option>

                        {locales.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {/* Timezone */}

                <Field
                    label="Timezone"
                    icon={Clock3}
                    description="Used for tenant-specific dates and time references."
                >
                    <select
                        value={form.timezone}
                        onChange={(event) =>
                            updateField(
                                "timezone",
                                event.target.value
                            )
                        }
                        className={selectClasses}
                    >
                        <option value="">
                            Select timezone
                        </option>

                        {timezones.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {/* Date Format */}

                <Field
                    label="Date Format"
                    icon={CalendarDays}
                    description="Controls how dates are displayed inside the workspace."
                >
                    <select
                        value={form.date_format}
                        onChange={(event) =>
                            updateField(
                                "date_format",
                                event.target.value
                            )
                        }
                        className={selectClasses}
                    >
                        <option value="">
                            Select date format
                        </option>

                        {dateFormats.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {/* Time Format */}

                <Field
                    label="Time Format"
                    icon={Clock3}
                    description="Choose between the supported 12-hour or 24-hour formats."
                >
                    <select
                        value={form.time_format}
                        onChange={(event) =>
                            updateField(
                                "time_format",
                                event.target.value
                            )
                        }
                        className={selectClasses}
                    >
                        <option value="">
                            Select time format
                        </option>

                        {timeFormats.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {/* Week Start */}

                <Field
                    label="Week Starts On"
                    icon={CalendarDays}
                    description="Sets the first day of the week for this organization."
                >
                    <select
                        value={form.week_start}
                        onChange={(event) =>
                            updateField(
                                "week_start",
                                event.target.value
                            )
                        }
                        className={selectClasses}
                    >
                        <option value="">
                            Select week start
                        </option>

                        {weekStartOptions.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>
        </section>
    );
}

function Field({
    label,
    icon: Icon,
    description,
    children,
}) {
    return (
        <div>
            <div className="mb-2 flex items-center gap-2">
                <Icon
                    size={14}
                    className="text-slate-400"
                />

                <label className="text-xs font-semibold text-slate-700">
                    {label}
                </label>
            </div>

            {children}

            <p className="mt-2 text-xs leading-5 text-slate-400">
                {description}
            </p>
        </div>
    );
}

const selectClasses = `
    h-12 w-full
    rounded-xl
    border border-slate-200
    bg-white
    px-4
    text-sm text-slate-700
    outline-none
    transition
    focus:border-[#19b5fe]
    focus:ring-4
    focus:ring-[#19b5fe]/10
`;

export default RegionalPreferencesCard;