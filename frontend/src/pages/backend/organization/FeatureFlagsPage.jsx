import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertCircle,
    CheckCircle2,
    Flag,
    LoaderCircle,
    RotateCcw,
    Save,
} from "lucide-react";

import api from "../../../api/axios";

import FeatureFlagsSummary from "../../../component/admin/organization/feature-flags/FeatureFlagsSummary";
import FeatureFlagCard from "../../../component/admin/organization/feature-flags/FeatureFlagCard";

function FeatureFlagsPage({
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

    const [flags, setFlags] =
        useState([]);

    const [originalFlags, setOriginalFlags] =
        useState([]);

    /*
    |--------------------------------------------------------------------------
    | Load Feature Flags
    |--------------------------------------------------------------------------
    */

    const loadFeatureFlags =
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
                    {};

                const featureFlags =
                    Array.isArray(
                        data.feature_flags
                    )
                        ? data.feature_flags
                        : [];

                const normalized =
                    featureFlags.map((flag) => {
                        const normalizedConfig =
                            Array.isArray(flag.config) &&
                                flag.config.length === 0
                                ? {}
                                : flag.config || {};

                        return {
                            ...flag,

                            enabled: Boolean(
                                flag.enabled
                            ),

                            config:
                                normalizedConfig,

                            configText:
                                JSON.stringify(
                                    normalizedConfig,
                                    null,
                                    2
                                ),
                        };
                    });

                setFlags(normalized);

                setOriginalFlags(
                    JSON.parse(
                        JSON.stringify(
                            normalized
                        )
                    )
                );
            } catch (error) {
                console.error(
                    "Unable to load feature flags:",
                    error
                );

                setError(
                    error.response?.data
                        ?.message ||
                    "Unable to load feature flags."
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

        loadFeatureFlags();
    }, [
        authLoading,
        currentTenant?.id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Update Local Flag
    |--------------------------------------------------------------------------
    */

    const updateFlag = (
        key,
        changes
    ) => {
        setFlags((current) =>
            current.map((flag) =>
                flag.key === key
                    ? {
                        ...flag,
                        ...changes,
                    }
                    : flag
            )
        );

        setError("");
        setSuccess("");
    };

    /*
    |--------------------------------------------------------------------------
    | Changed Flags
    |--------------------------------------------------------------------------
    */

    const changedFlags =
        useMemo(() => {
            return flags.filter(
                (flag) => {
                    const original =
                        originalFlags.find(
                            (item) =>
                                item.key ===
                                flag.key
                        );

                    if (!original) {
                        return true;
                    }

                    return (
                        Boolean(
                            flag.enabled
                        ) !==
                        Boolean(
                            original.enabled
                        ) ||
                        flag.configText !==
                        original.configText
                    );
                }
            );
        }, [
            flags,
            originalFlags,
        ]);

    const hasChanges =
        changedFlags.length > 0;

    /*
    |--------------------------------------------------------------------------
    | Reset
    |--------------------------------------------------------------------------
    */

    const handleReset = () => {
        setFlags(
            JSON.parse(
                JSON.stringify(
                    originalFlags
                )
            )
        );

        setError("");
        setSuccess("");
    };

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    const handleSave = async () => {
        setError("");
        setSuccess("");

        if (!hasChanges) {
            setSuccess(
                "No feature flag changes to save."
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Config JSON
        |--------------------------------------------------------------------------
        */

        const preparedFlags = [];

        for (
            const flag of changedFlags
        ) {
            let parsedConfig = {};

            try {
                const value =
                    flag.configText?.trim();

                parsedConfig =
                    value
                        ? JSON.parse(
                            value
                        )
                        : {};
            } catch {
                setError(
                    `${readableLabel(
                        flag.key
                    )} contains invalid JSON configuration.`
                );

                return;
            }


            if (
                Array.isArray(parsedConfig) &&
                parsedConfig.length === 0
            ) {
                parsedConfig = {};
            }

            if (
                parsedConfig === null ||
                typeof parsedConfig !== "object" ||
                Array.isArray(parsedConfig)
            ) {
                setError(
                    `${readableLabel(
                        flag.key
                    )} configuration must be a JSON object.`
                );

                return;
            }



            preparedFlags.push({
                ...flag,
                parsedConfig,
            });
        }

        setSaving(true);

        try {
            /*
            |--------------------------------------------------------------------------
            | Update Changed Features
            |--------------------------------------------------------------------------
            */

            for (
                const flag of preparedFlags
            ) {
                await api.patch(
                    `/tenants/${currentTenant.id}/configuration/feature-flags/${flag.key}`,
                    {
                        enabled:
                            Boolean(
                                flag.enabled
                            ),

                        config:
                            flag.parsedConfig,
                    }
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Reload Database State
            |--------------------------------------------------------------------------
            */

            await loadFeatureFlags();

            setSuccess(
                `${preparedFlags.length} feature ${preparedFlags.length ===
                    1
                    ? "flag"
                    : "flags"
                } updated successfully.`
            );

        } catch (error) {
            console.error(
                "Unable to save feature flags:",
                error
            );

            const validationErrors =
                error.response?.data
                    ?.errors;

            if (
                validationErrors
            ) {
                const firstError =
                    Object.values(
                        validationErrors
                    )?.[0]?.[0];

                setError(
                    firstError ||
                    "Please check the feature flag settings."
                );
            } else {
                setError(
                    error.response?.data
                        ?.message ||
                    "Unable to update feature flags."
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Reload state because previous PATCH may have succeeded
            |--------------------------------------------------------------------------
            */

            await loadFeatureFlags();
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
                        Loading feature flags...
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
                        Feature Flags
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Enable or disable registered
                        DocuEngine features for this
                        organization.
                    </p>

                </div>

                {/* Actions */}

                <div className="flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={
                            handleReset
                        }
                        disabled={
                            !hasChanges ||
                            saving
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RotateCcw
                            size={16}
                        />

                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleSave
                        }
                        disabled={
                            !hasChanges ||
                            saving
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7046f5] px-5 text-sm font-semibold text-white shadow-lg shadow-[#7046f5]/20 transition hover:bg-[#825cf7] disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {saving ? (
                            <LoaderCircle
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Save
                                size={17}
                            />
                        )}

                        {saving
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </div>

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
                ORGANIZATION
            ========================================================== */}

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10">

                        <Flag
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
                            Feature availability is
                            specific to this MSP.
                        </p>

                    </div>

                </div>

                {hasChanges && (
                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-600">
                        {
                            changedFlags.length
                        }{" "}
                        unsaved{" "}
                        {changedFlags.length ===
                            1
                            ? "change"
                            : "changes"}
                    </span>
                )}

            </div>

            {/* =========================================================
                SUMMARY
            ========================================================== */}

            <FeatureFlagsSummary
                flags={flags}
            />

            {/* =========================================================
                FEATURE LIST
            ========================================================== */}

            {flags.length ? (

                <div className="grid gap-5 xl:grid-cols-2">

                    {flags.map(
                        (flag) => (
                            <FeatureFlagCard
                                key={
                                    flag.key
                                }
                                flag={
                                    flag
                                }
                                onChange={
                                    updateFlag
                                }
                            />
                        )
                    )}

                </div>

            ) : (

                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">

                        <Flag
                            size={20}
                            className="text-slate-400"
                        />

                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-800">
                        No feature flags
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        No registered features are
                        currently available for this
                        organization.
                    </p>

                </div>

            )}

        </div>
    );
}

function readableLabel(value) {
    return String(value || "")
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}

export default FeatureFlagsPage;