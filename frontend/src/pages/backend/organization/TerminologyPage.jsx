import {
    useEffect,
    useState,
} from "react";

import {
    AlertCircle,
    CheckCircle2,
    Languages,
    LoaderCircle,
    Save,
} from "lucide-react";

import api from "../../../api/axios";

import TerminologyEditorCard from "../../../component/admin/organization/terminology/TerminologyEditorCard";
import TerminologyPreviewCard from "../../../component/admin/organization/terminology/TerminologyPreviewCard";

function TerminologyPage({
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

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [
        terminology,
        setTerminology,
    ] = useState({});

    /*
    |--------------------------------------------------------------------------
    | Load Terminology
    |--------------------------------------------------------------------------
    */

    const loadTerminology =
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
                    response.data?.data || {};

                setTerminology(
                    data?.settings
                        ?.terminology ||
                        {}
                );
            } catch (error) {
                console.error(
                    "Unable to load terminology:",
                    error
                );

                setError(
                    error.response?.data
                        ?.message ||
                        "Unable to load terminology settings."
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

        loadTerminology();
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

        /*
        |--------------------------------------------------------------------------
        | Basic Frontend Validation
        |--------------------------------------------------------------------------
        */

        const hasEmptyValue =
            Object.values(
                terminology
            ).some(
                (value) =>
                    !String(
                        value || ""
                    ).trim()
            );

        if (hasEmptyValue) {
            setError(
                "Terminology values cannot be empty."
            );

            return;
        }

        setSaving(true);

        try {
            /*
            |--------------------------------------------------------------------------
            | Normalize Payload
            |--------------------------------------------------------------------------
            */

            const payload =
                Object.fromEntries(
                    Object.entries(
                        terminology
                    ).map(
                        ([
                            key,
                            value,
                        ]) => [
                            key,
                            String(
                                value
                            ).trim(),
                        ]
                    )
                );

            /*
            |--------------------------------------------------------------------------
            | Update Terminology
            |--------------------------------------------------------------------------
            */

            await api.patch(
                `/tenants/${currentTenant.id}/configuration/terminology`,
                payload
            );

            await loadTerminology();

            setSuccess(
                "Organization terminology updated successfully."
            );
        } catch (error) {
            console.error(
                "Unable to save terminology:",
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
                        "Please check the terminology values."
                );
            } else {
                setError(
                    error.response?.data
                        ?.message ||
                        "Unable to save terminology settings."
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
                        Loading terminology...
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
                        Terminology
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Customize how common platform concepts are named for this organization.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                        saving ||
                        !Object.keys(
                            terminology
                        ).length
                    }
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
                        : "Save Terminology"}

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
                ORGANIZATION INFO
            ========================================================== */}

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10">

                    <Languages
                        size={18}
                        className="text-[#19b5fe]"
                    />

                </div>

                <div>

                    <p className="text-sm font-semibold text-slate-800">
                        {currentTenant
                            ?.branding
                            ?.display_name ||
                            currentTenant
                                ?.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                        These names apply only to this MSP organization.
                    </p>

                </div>

            </div>

            {/* =========================================================
                PREVIEW
            ========================================================== */}

            <TerminologyPreviewCard
                terminology={
                    terminology
                }
            />

            {/* =========================================================
                EDITOR
            ========================================================== */}

            <TerminologyEditorCard
                terminology={
                    terminology
                }
                setTerminology={
                    setTerminology
                }
            />

        </div>
    );
}

export default TerminologyPage;