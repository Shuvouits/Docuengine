import {
    useEffect,
    useState,
} from "react";

import {
    AlertCircle,
    CheckCircle2,
    Globe2,
    LoaderCircle,
    Save,
} from "lucide-react";

import api from "../../../api/axios";

import RegionalPreferencesCard from "../../../component/admin/organization/regional/RegionalPreferencesCard";
import RegionalSummaryCard from "../../../component/admin/organization/regional/RegionalSummaryCard";

function RegionalSettingsPage({
    authData = null,
    authLoading = false,
    refreshAuth = () => {},
}) {
    const currentTenant =
        authData?.current_tenant || null;

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [form, setForm] =
        useState({
            locale: "",
            timezone: "",
            date_format: "",
            time_format: "",
            week_start: "",
        });

    const [options, setOptions] =
        useState({
            locales: [],
            timezones: [],
            dateFormats: [],
            timeFormats: [],
            weekStartOptions: [],
        });

    /*
    |--------------------------------------------------------------------------
    | Load Regional Options
    |--------------------------------------------------------------------------
    */

    const loadRegionalSettings =
        async () => {
            if (!currentTenant?.id) {
                return;
            }

            setLoading(true);
            setError("");

            try {
                const response =
                    await api.get(
                        `/tenants/${currentTenant.id}/configuration/regional-options`
                    );

                const data =
                    response.data?.data || {};

                /*
                |--------------------------------------------------------------------------
                | Current Values
                |--------------------------------------------------------------------------
                */

                const current =
                    data.current || data;

                setForm({
                    locale:
                        current.locale ||
                        currentTenant?.locale ||
                        "",

                    timezone:
                        current.timezone ||
                        currentTenant?.timezone ||
                        "",

                    date_format:
                        current.date_format ||
                        currentTenant?.settings
                            ?.date_format ||
                        "",

                    time_format:
                        current.time_format ||
                        currentTenant?.settings
                            ?.time_format ||
                        "",

                    week_start:
                        current.week_start ||
                        currentTenant?.settings
                            ?.week_start ||
                        "",
                });

                /*
                |--------------------------------------------------------------------------
                | Options
                |--------------------------------------------------------------------------
                */

                const source =
                    data.options || data;

                setOptions({
                    locales:
                        normalizeOptions(
                            source.locales
                        ),

                    timezones:
                        normalizeOptions(
                            source.timezones
                        ),

                    dateFormats:
                        normalizeOptions(
                            source.date_formats
                        ),

                    timeFormats:
                        normalizeOptions(
                            source.time_formats
                        ),

                    weekStartOptions:
                        normalizeOptions(
                            source.week_start_options ||
                                source.week_starts ||
                                source.week_start
                        ),
                });
            } catch (error) {
                console.error(
                    "Unable to load regional settings:",
                    error
                );

                setError(
                    error.response?.data
                        ?.message ||
                        "Unable to load regional settings."
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        if (
            authLoading ||
            !currentTenant?.id
        ) {
            return;
        }

        loadRegionalSettings();
    }, [
        authLoading,
        currentTenant?.id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    const handleSave = async () => {
        setError("");
        setSuccess("");

        if (!form.locale) {
            setError(
                "Please select a locale."
            );

            return;
        }

        if (!form.timezone) {
            setError(
                "Please select a timezone."
            );

            return;
        }

        if (!form.date_format) {
            setError(
                "Please select a date format."
            );

            return;
        }

        if (!form.time_format) {
            setError(
                "Please select a time format."
            );

            return;
        }

        if (!form.week_start) {
            setError(
                "Please select when the week starts."
            );

            return;
        }

        setSaving(true);

        try {
            /*
            |--------------------------------------------------------------------------
            | Locale + Timezone
            |--------------------------------------------------------------------------
            */

            await api.patch(
                `/tenants/${currentTenant.id}/configuration/general`,
                {
                    locale:
                        form.locale,

                    timezone:
                        form.timezone,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Date / Time Preferences
            |--------------------------------------------------------------------------
            */

            await api.patch(
                `/tenants/${currentTenant.id}/configuration/settings`,
                {
                    date_format:
                        form.date_format,

                    time_format:
                        form.time_format,

                    week_start:
                        form.week_start,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Refresh
            |--------------------------------------------------------------------------
            */

            await refreshAuth();

            await loadRegionalSettings();

            setSuccess(
                "Regional settings updated successfully."
            );
        } catch (error) {
            console.error(
                "Unable to save regional settings:",
                error
            );

            const validationErrors =
                error.response?.data
                    ?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    )?.[0]?.[0];

                setError(
                    firstError ||
                        "Please check the regional settings."
                );
            } else {
                setError(
                    error.response?.data
                        ?.message ||
                        "Unable to save regional settings."
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Reload actual state if one request succeeded
            |--------------------------------------------------------------------------
            */

            await loadRegionalSettings();
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (
        authLoading ||
        loading
    ) {
        return (
            <div className="flex min-h-[450px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={30}
                        className="mx-auto animate-spin text-[#19b5fe]"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading regional settings...
                    </p>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | No Tenant
    |--------------------------------------------------------------------------
    */

    if (!currentTenant) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <h2 className="font-bold text-slate-900">
                    No organization selected
                </h2>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (
        <div className="space-y-7">
            {/* =========================================================
                HEADER
            ========================================================== */}

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#19b5fe]" />

                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#19b5fe]">
                            Organization
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-[#07111f] lg:text-3xl">
                        Regional Settings
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage locale, timezone and
                        regional display preferences
                        for this organization.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7046f5] px-5 text-sm font-semibold text-white shadow-lg shadow-[#7046f5]/20 transition hover:bg-[#825cf7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? (
                        <LoaderCircle
                            size={17}
                            className="animate-spin"
                        />
                    ) : (
                        <Save size={17} />
                    )}

                    {saving
                        ? "Saving..."
                        : "Save Settings"}
                </button>
            </div>

            {/* =========================================================
                MESSAGES
            ========================================================== */}

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-sm font-medium text-red-600">
                        {error}
                    </p>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p className="text-sm font-medium text-emerald-700">
                        {success}
                    </p>
                </div>
            )}

            {/* =========================================================
                ORGANIZATION STATUS
            ========================================================== */}

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10">
                    <Globe2
                        size={18}
                        className="text-[#19b5fe]"
                    />
                </div>

                <div>
                    <p className="text-sm font-semibold text-slate-800">
                        {currentTenant?.branding
                            ?.display_name ||
                            currentTenant?.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Regional settings apply only to
                        this MSP organization.
                    </p>
                </div>
            </div>

            {/* =========================================================
                CURRENT SUMMARY
            ========================================================== */}

            <RegionalSummaryCard
                form={form}
            />

            {/* =========================================================
                PREFERENCES
            ========================================================== */}

            <RegionalPreferencesCard
                form={form}
                setForm={setForm}
                locales={options.locales}
                timezones={options.timezones}
                dateFormats={
                    options.dateFormats
                }
                timeFormats={
                    options.timeFormats
                }
                weekStartOptions={
                    options.weekStartOptions
                }
            />
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Normalize API Options
|--------------------------------------------------------------------------
|
| Supports:
|
| ["Asia/Dhaka", "UTC"]
|
| or
|
| {
|     "en": "English",
|     "en-US": "English (United States)"
| }
|
*/

function normalizeOptions(data) {
    if (!data) {
        return [];
    }

    if (Array.isArray(data)) {
        return data.map((item) => {
            if (
                typeof item === "object" &&
                item !== null
            ) {
                return {
                    value:
                        item.value ||
                        item.key ||
                        item.id ||
                        "",

                    label:
                        item.label ||
                        item.name ||
                        item.value ||
                        "",
                };
            }

            return {
                value: String(item),
                label: String(item),
            };
        });
    }

    if (typeof data === "object") {
        return Object.entries(data).map(
            ([value, label]) => ({
                value,
                label:
                    label
                        ? `${value} — ${label}`
                        : value,
            })
        );
    }

    return [];
}

export default RegionalSettingsPage;