import {
    useEffect,
    useState,
} from "react";

import {
    AlertCircle,
    CheckCircle2,
    LoaderCircle,
    Save,
    Settings,
} from "lucide-react";

import api from "../../../api/axios";

import OrganizationIdentityForm from "../../../component/admin/organization/general/OrganizationIdentityForm";
import OrganizationNamingForm from "../../../component/admin/organization/general/OrganizationNamingForm";

function GeneralSettingsPage({
    authData = null,
    authLoading = false,
}) {
    const currentTenant =
        authData?.current_tenant || null;

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [configuration, setConfiguration] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [form, setForm] = useState({
        id: "",
        name: "",
        display_name: "",
        slug: "",
        name_prefix: "",
        name_suffix: "",
    });

    /*
    |--------------------------------------------------------------------------
    | Load Configuration
    |--------------------------------------------------------------------------
    */

    const loadConfiguration = async () => {
        if (!currentTenant?.id) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                `/tenants/${currentTenant.id}/configuration`
            );

            const data =
                response.data?.data || null;

            setConfiguration(data);

            setForm({
                id: data?.id || "",
                name: data?.name || "",
                display_name:
                    data?.branding?.display_name ||
                    "",
                slug: data?.slug || "",
                name_prefix:
                    data?.settings?.name_prefix ||
                    "",
                name_suffix:
                    data?.settings?.name_suffix ||
                    "",
            });
        } catch (error) {
            console.error(
                "Unable to load general settings:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to load general settings."
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

        loadConfiguration();
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

        if (!form.name.trim()) {
            setError(
                "Organization name is required."
            );

            return;
        }

        setSaving(true);

        try {
            /*
            |--------------------------------------------------------------------------
            | Organization Identity
            |--------------------------------------------------------------------------
            */

            await api.patch(
                `/tenants/${currentTenant.id}/configuration/organization`,
                {
                    name: form.name.trim(),

                    display_name:
                        form.display_name.trim() ||
                        null,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Naming Settings
            |--------------------------------------------------------------------------
            */

            await api.patch(
                `/tenants/${currentTenant.id}/configuration/settings`,
                {
                    name_prefix:
                        form.name_prefix.trim() ||
                        null,

                    name_suffix:
                        form.name_suffix.trim() ||
                        null,
                }
            );

            setSuccess(
                "General settings updated successfully."
            );

            await loadConfiguration();

        } catch (error) {
            console.error(
                "Unable to save general settings:",
                error
            );

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    )?.[0]?.[0];

                setError(
                    firstError ||
                        "Please check the form and try again."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        "Unable to save general settings."
                );
            }
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
                        Loading general settings...
                    </p>

                </div>

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
                        General Settings
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage your organization identity and naming preferences.
                    </p>

                </div>

                {/* Save Button */}

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
                        : "Save Changes"}

                </button>

            </div>

            {/* =========================================================
                STATUS MESSAGES
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
                CONFIGURATION STATUS
            ========================================================== */}

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10">

                    <Settings
                        size={18}
                        className="text-[#19b5fe]"
                    />

                </div>

                <div>

                    <p className="text-sm font-semibold text-slate-800">
                        {
                            configuration?.branding
                                ?.display_name ||
                            configuration?.name
                        }
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Changes apply only to this MSP organization.
                    </p>

                </div>

            </div>

            {/* =========================================================
                FORMS
            ========================================================== */}

            <OrganizationIdentityForm
                form={form}
                setForm={setForm}
            />

            <OrganizationNamingForm
                form={form}
                setForm={setForm}
            />

        </div>
    );
}

export default GeneralSettingsPage;