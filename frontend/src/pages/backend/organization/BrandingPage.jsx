import {
    useEffect,
    useState,
} from "react";

import {
    AlertCircle,
    CheckCircle2,
    LoaderCircle,
    Palette,
    Save,
} from "lucide-react";

import api from "../../../api/axios";

import BrandingAssetCard from "../../../component/admin/organization/branding/BrandingAssetCard";
import BrandColorsCard from "../../../component/admin/organization/branding/BrandColorsCard";
import AppearanceSettingsCard from "../../../component/admin/organization/branding/AppearanceSettingsCard";
import BrandingPreviewCard from "../../../component/admin/organization/branding/BrandingPreviewCard";

function BrandingPage({
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

    const [logoFile, setLogoFile] =
        useState(null);

    const [faviconFile, setFaviconFile] =
        useState(null);

    const [logoPreview, setLogoPreview] =
        useState(null);

    const [faviconPreview, setFaviconPreview] =
        useState(null);

    const [form, setForm] = useState({
        primary_color: "",
        secondary_color: "",
        sidebar_style: "",
        border_radius: "",
    });

    /*
    |--------------------------------------------------------------------------
    | Load Branding
    |--------------------------------------------------------------------------
    */

    const loadConfiguration =
        async () => {
            if (!currentTenant?.id) {
                return;
            }

            setLoading(true);
            setError("");

            try {
                const response =
                    await api.get(
                        `/tenants/${currentTenant.id}/configuration`
                    );

                const data =
                    response.data?.data ||
                    null;

                setConfiguration(data);

                const branding =
                    data?.branding || {};

                setForm({
                    primary_color:
                        branding.primary_color ||
                        "",

                    secondary_color:
                        branding.secondary_color ||
                        "",

                    sidebar_style:
                        branding.custom_styles
                            ?.sidebar_style ||
                        "",

                    border_radius:
                        branding.custom_styles
                            ?.border_radius ||
                        "",
                });
            } catch (error) {
                console.error(
                    "Unable to load branding:",
                    error
                );

                setError(
                    error.response?.data
                        ?.message ||
                        "Unable to load branding."
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
    | Preview Cleanup
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(
                    logoPreview
                );
            }

            if (faviconPreview) {
                URL.revokeObjectURL(
                    faviconPreview
                );
            }
        };
    }, [
        logoPreview,
        faviconPreview,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Logo Selection
    |--------------------------------------------------------------------------
    */

    const handleLogoChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            setError(
                "Logo must be 5 MB or smaller."
            );

            event.target.value = "";

            return;
        }

        if (logoPreview) {
            URL.revokeObjectURL(
                logoPreview
            );
        }

        setLogoFile(file);

        setLogoPreview(
            URL.createObjectURL(file)
        );

        setError("");
        setSuccess("");
    };

    /*
    |--------------------------------------------------------------------------
    | Favicon Selection
    |--------------------------------------------------------------------------
    */

    const handleFaviconChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (
            file.size >
            2 * 1024 * 1024
        ) {
            setError(
                "Favicon must be 2 MB or smaller."
            );

            event.target.value = "";

            return;
        }

        if (faviconPreview) {
            URL.revokeObjectURL(
                faviconPreview
            );
        }

        setFaviconFile(file);

        setFaviconPreview(
            URL.createObjectURL(file)
        );

        setError("");
        setSuccess("");
    };

    /*
    |--------------------------------------------------------------------------
    | Save Branding
    |--------------------------------------------------------------------------
    */

    const handleSave = async () => {
        setError("");
        setSuccess("");

        /*
        |--------------------------------------------------------------------------
        | Color Validation
        |--------------------------------------------------------------------------
        */

        if (
            form.primary_color &&
            !isValidHex(
                form.primary_color
            )
        ) {
            setError(
                "Primary color must use a valid hex format such as #0D2B1D."
            );

            return;
        }

        if (
            form.secondary_color &&
            !isValidHex(
                form.secondary_color
            )
        ) {
            setError(
                "Secondary color must use a valid hex format such as #F4F7F5."
            );

            return;
        }

        setSaving(true);

        try {
            /*
            |--------------------------------------------------------------------------
            | Branding Settings
            |--------------------------------------------------------------------------
            */

            const existingCustomStyles =
                configuration?.branding
                    ?.custom_styles ||
                {};

            await api.patch(
                `/tenants/${currentTenant.id}/configuration/branding`,
                {
                    primary_color:
                        form.primary_color ||
                        null,

                    secondary_color:
                        form.secondary_color ||
                        null,

                    custom_styles: {
                        ...existingCustomStyles,

                        sidebar_style:
                            form.sidebar_style ||
                            null,

                        border_radius:
                            form.border_radius ||
                            null,
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Branding Assets
            |--------------------------------------------------------------------------
            */

            if (
                logoFile ||
                faviconFile
            ) {
                const formData =
                    new FormData();

                if (logoFile) {
                    formData.append(
                        "logo",
                        logoFile
                    );
                }

                if (faviconFile) {
                    formData.append(
                        "favicon",
                        faviconFile
                    );
                }

                await api.post(
                    `/tenants/${currentTenant.id}/configuration/branding/assets`,
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Reset Selected Files
            |--------------------------------------------------------------------------
            */

            setLogoFile(null);
            setFaviconFile(null);

            if (logoPreview) {
                URL.revokeObjectURL(
                    logoPreview
                );

                setLogoPreview(null);
            }

            if (faviconPreview) {
                URL.revokeObjectURL(
                    faviconPreview
                );

                setFaviconPreview(
                    null
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Reload
            |--------------------------------------------------------------------------
            */

            await loadConfiguration();

            await refreshAuth();

            setSuccess(
                "Branding updated successfully."
            );

        } catch (error) {
            console.error(
                "Unable to save branding:",
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
                        "Please check the branding settings."
                );
            } else {
                setError(
                    error.response?.data
                        ?.message ||
                        "Unable to save branding."
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
                        Loading branding...
                    </p>

                </div>

            </div>
        );
    }

    if (!currentTenant) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">

                <h2 className="font-bold text-slate-900">
                    No organization selected
                </h2>

            </div>
        );
    }

    const branding =
        configuration?.branding || {};

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
                        Branding
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage your organization logo,
                        favicon, brand colors and
                        interface appearance.
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
                        : "Save Branding"}

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
                BRAND STATUS
            ========================================================== */}

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10">

                    <Palette
                        size={18}
                        className="text-[#19b5fe]"
                    />

                </div>

                <div>

                    <p className="text-sm font-semibold text-slate-800">
                        {branding?.display_name ||
                            configuration?.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Branding changes apply only to
                        this MSP organization.
                    </p>

                </div>

            </div>

            {/* =========================================================
                ASSETS
            ========================================================== */}

            <div className="grid gap-6 xl:grid-cols-2">

                <BrandingAssetCard
                    title="Organization Logo"
                    description="JPG, PNG or WebP. Maximum file size 5 MB."
                    currentUrl={
                        branding?.logo_url
                    }
                    file={logoFile}
                    previewUrl={
                        logoPreview
                    }
                    onChange={
                        handleLogoChange
                    }
                    onClear={() => {
                        if (
                            logoPreview
                        ) {
                            URL.revokeObjectURL(
                                logoPreview
                            );
                        }

                        setLogoFile(null);
                        setLogoPreview(
                            null
                        );
                    }}
                    accept="image/jpeg,image/png,image/webp"
                    inputId="organization-logo"
                />

                <BrandingAssetCard
                    title="Favicon"
                    description="ICO, PNG, JPG or WebP. Maximum file size 2 MB."
                    currentUrl={
                        branding?.favicon_url
                    }
                    file={faviconFile}
                    previewUrl={
                        faviconPreview
                    }
                    onChange={
                        handleFaviconChange
                    }
                    onClear={() => {
                        if (
                            faviconPreview
                        ) {
                            URL.revokeObjectURL(
                                faviconPreview
                            );
                        }

                        setFaviconFile(
                            null
                        );

                        setFaviconPreview(
                            null
                        );
                    }}
                    accept=".ico,image/png,image/jpeg,image/webp"
                    inputId="organization-favicon"
                    compact
                />

            </div>

            {/* =========================================================
                COLORS
            ========================================================== */}

            <BrandColorsCard
                form={form}
                setForm={setForm}
            />

            {/* =========================================================
                APPEARANCE
            ========================================================== */}

            <AppearanceSettingsCard
                form={form}
                setForm={setForm}
            />

            {/* =========================================================
                PREVIEW
            ========================================================== */}

            <BrandingPreviewCard
                organization={
                    configuration
                }
                branding={branding}
                form={form}
                logoPreview={
                    logoPreview
                }
            />

        </div>
    );
}

function isValidHex(value) {
    return /^#[0-9A-Fa-f]{6}$/.test(
        value || ""
    );
}

export default BrandingPage;