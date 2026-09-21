import {
    ArrowLeft,
    Check,
    FileText,
    Info,
    Layers3,
    LoaderCircle,
    Save,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";

function CreateAssetLayoutPage({
    authData = null,
    authLoading = false,
}) {
    const navigate = useNavigate();

    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const permissions =
        currentTenant?.access?.permissions || [];

    const canManage =
        permissions.includes("asset_layouts.manage");

    /*
    |--------------------------------------------------------------------------
    | Form State
    |--------------------------------------------------------------------------
    */

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        status: "draft",
        is_template: false,
    });

    const [slugManuallyEdited, setSlugManuallyEdited] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [validationErrors, setValidationErrors] =
        useState({});

    /*
    |--------------------------------------------------------------------------
    | Generate Slug
    |--------------------------------------------------------------------------
    */

    const generateSlug = (value) => {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    useEffect(() => {
        if (slugManuallyEdited) {
            return;
        }

        setForm((current) => ({
            ...current,
            slug: generateSlug(current.name),
        }));
    }, [
        form.name,
        slugManuallyEdited,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Handle Input
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        if (name === "slug") {
            setSlugManuallyEdited(true);
        }

        setForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));

        setValidationErrors((current) => ({
            ...current,
            [name]: undefined,
        }));

        setError("");
    };

    /*
    |--------------------------------------------------------------------------
    | Local Validation
    |--------------------------------------------------------------------------
    */

    const validateForm = () => {
        const errors = {};

        if (!form.name.trim()) {
            errors.name =
                "Layout name is required.";
        }

        if (!form.slug.trim()) {
            errors.slug =
                "Layout slug is required.";
        }

        if (
            form.slug &&
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
                form.slug
            )
        ) {
            errors.slug =
                "Use lowercase letters, numbers, and hyphens only.";
        }

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!tenantId) {
            setError(
                "No organization is currently selected."
            );
            return;
        }

        if (!canManage) {
            setError(
                "You do not have permission to create asset layouts."
            );
            return;
        }

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setError("");
        setValidationErrors({});

        try {
            const payload = {
                name: form.name.trim(),
                slug: form.slug.trim(),
                description:
                    form.description.trim() ||
                    null,
                status: form.status,
                is_template:
                    Boolean(form.is_template),
            };

            await api.post(
                `/tenants/${tenantId}/asset-layouts`,
                payload
            );

            navigate(
                "/admin/asset-layouts",
                {
                    replace: true,
                    state: {
                        message:
                            "Asset layout created successfully.",
                    },
                }
            );
        } catch (error) {
            console.error(
                "Failed to create asset layout:",
                error
            );

            if (
                error.response?.status === 422
            ) {
                const backendErrors =
                    error.response?.data?.errors ||
                    {};

                setValidationErrors(
                    backendErrors
                );

                setError(
                    error.response?.data?.message ||
                        "Please check the form and try again."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        "Unable to create asset layout."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (authLoading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={28}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading workspace...
                    </p>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Permission
    |--------------------------------------------------------------------------
    */

    if (!canManage) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Layers3
                        size={24}
                        className="text-slate-500"
                    />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    Access unavailable
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Your current role does not
                    have permission to create
                    asset layouts.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/admin/asset-layouts"
                        )
                    }
                    className="
                        mt-6 inline-flex h-10
                        items-center gap-2
                        rounded-xl border
                        border-slate-200 bg-white
                        px-4 text-sm font-semibold
                        text-slate-700
                        transition
                        hover:bg-slate-50
                    "
                >
                    <ArrowLeft size={16} />
                    Back to layouts
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1200px] space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/asset-layouts"
                            )
                        }
                        className="
                            mb-4 inline-flex
                            items-center gap-2
                            text-sm font-medium
                            text-slate-500
                            transition
                            hover:text-slate-900
                        "
                    >
                        <ArrowLeft size={16} />
                        Asset Layouts
                    </button>

                    <div className="mb-2 flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{
                                backgroundColor:
                                    "var(--brand-primary)",
                            }}
                        />

                        <span
                            className="
                                text-[11px]
                                font-semibold
                                uppercase
                                tracking-[0.16em]
                            "
                            style={{
                                color:
                                    "var(--brand-primary)",
                            }}
                        >
                            Documentation
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[30px]">
                        Create Asset Layout
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Create the base structure
                        for documenting managed
                        assets. Sections and fields
                        can be added after the layout
                        is created.
                    </p>
                </div>
            </div>

            {/* Error */}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
            >
                {/* Main Form */}

                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        flex h-10 w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                    "
                                    style={{
                                        color:
                                            "var(--brand-primary)",
                                        backgroundColor:
                                            "color-mix(in srgb, var(--brand-primary) 9%, white)",
                                    }}
                                >
                                    <Layers3
                                        size={19}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Layout details
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Basic information
                                        used to identify
                                        this layout.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 p-6">
                            {/* Name */}

                            <FormField
                                label="Layout Name"
                                required
                                error={
                                    validationErrors
                                        ?.name
                                }
                            >
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: Production Server Layout"
                                    className={inputClass(
                                        validationErrors
                                            ?.name
                                    )}
                                />
                            </FormField>

                            {/* Slug */}

                            <FormField
                                label="Slug"
                                required
                                description="Used as the internal identifier for this layout."
                                error={
                                    validationErrors
                                        ?.slug
                                }
                            >
                                <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-slate-300 focus-within:ring-4 focus-within:ring-slate-100">
                                    <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-400">
                                        /
                                    </span>

                                    <input
                                        type="text"
                                        name="slug"
                                        value={
                                            form.slug
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="production-server-layout"
                                        className="
                                            h-11 w-full
                                            border-0
                                            bg-transparent
                                            px-3 text-sm
                                            text-slate-800
                                            outline-none
                                            placeholder:text-slate-400
                                        "
                                    />
                                </div>
                            </FormField>

                            {/* Description */}

                            <FormField
                                label="Description"
                                description="Briefly explain where this layout should be used."
                                error={
                                    validationErrors
                                        ?.description
                                }
                            >
                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={5}
                                    placeholder="Example: Standard documentation layout for production managed servers."
                                    className={`
                                        ${inputClass(
                                            validationErrors
                                                ?.description
                                        )}
                                        min-h-[130px]
                                        resize-y py-3
                                    `}
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Configuration */}

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        flex h-10 w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                    "
                                    style={{
                                        color:
                                            "var(--brand-primary)",
                                        backgroundColor:
                                            "color-mix(in srgb, var(--brand-primary) 9%, white)",
                                    }}
                                >
                                    <FileText
                                        size={19}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Configuration
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Set the initial
                                        layout state and
                                        reuse behavior.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 p-6">
                            {/* Status */}

                            <FormField
                                label="Status"
                                error={
                                    validationErrors
                                        ?.status
                                }
                            >
                                <select
                                    name="status"
                                    value={
                                        form.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass(
                                        validationErrors
                                            ?.status
                                    )}
                                >
                                    <option value="draft">
                                        Draft
                                    </option>

                                    <option value="published">
                                        Published
                                    </option>
                                </select>
                            </FormField>

                            {/* Template */}

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        name="is_template"
                                        checked={
                                            form.is_template
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="
                                            mt-0.5 h-4 w-4
                                            rounded border-slate-300
                                        "
                                        style={{
                                            accentColor:
                                                "var(--brand-primary)",
                                        }}
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Reusable
                                            template
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Mark this
                                            layout as a
                                            reusable
                                            template that
                                            can be used
                                            across managed
                                            assets.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            disabled={
                                submitting
                            }
                            onClick={() =>
                                navigate(
                                    "/admin/asset-layouts"
                                )
                            }
                            className="
                                inline-flex h-11
                                items-center
                                justify-center
                                rounded-xl border
                                border-slate-200
                                bg-white px-5
                                text-sm font-semibold
                                text-slate-700
                                transition
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting
                            }
                            className="
                                inline-flex h-11
                                items-center
                                justify-center
                                gap-2 rounded-xl
                                px-5 text-sm
                                font-semibold text-white
                                shadow-sm transition
                                hover:opacity-90
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                            style={{
                                backgroundColor:
                                    "var(--brand-primary)",
                            }}
                        >
                            {submitting ? (
                                <>
                                    <LoaderCircle
                                        size={17}
                                        className="animate-spin"
                                    />

                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save
                                        size={17}
                                    />

                                    Create Layout
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Sidebar */}

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div
                                className="
                                    flex h-9 w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                "
                                style={{
                                    color:
                                        "var(--brand-primary)",
                                    backgroundColor:
                                        "color-mix(in srgb, var(--brand-primary) 9%, white)",
                                }}
                            >
                                <Info
                                    size={17}
                                />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    What happens next?
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    After creating the
                                    layout, you can add
                                    sections, custom
                                    fields, option lists,
                                    validation rules, and
                                    schema versions.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Initial setup
                        </h3>

                        <div className="mt-4 space-y-3">
                            <ChecklistItem>
                                Layout starts at
                                version 1
                            </ChecklistItem>

                            <ChecklistItem>
                                Sections can be added
                                after creation
                            </ChecklistItem>

                            <ChecklistItem>
                                Fields belong to
                                individual sections
                            </ChecklistItem>

                            <ChecklistItem>
                                Layout validation runs
                                before activation
                            </ChecklistItem>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <p className="text-xs font-semibold text-amber-800">
                            Draft recommended
                        </p>

                        <p className="mt-2 text-xs leading-5 text-amber-700">
                            Keep new layouts in draft
                            while building sections and
                            fields. Publish them once
                            the structure is ready.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Form Field
|--------------------------------------------------------------------------
*/

function FormField({
    label,
    description = null,
    required = false,
    error = null,
    children,
}) {
    const message = Array.isArray(error)
        ? error[0]
        : error;

    return (
        <div>
            <div className="mb-2 flex items-center gap-1">
                <label className="text-sm font-semibold text-slate-700">
                    {label}
                </label>

                {required && (
                    <span className="text-red-500">
                        *
                    </span>
                )}
            </div>

            {children}

            {message ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {message}
                </p>
            ) : description ? (
                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Checklist Item
|--------------------------------------------------------------------------
*/

function ChecklistItem({
    children,
}) {
    return (
        <div className="flex items-start gap-2.5">
            <div
                className="
                    mt-0.5 flex h-5 w-5
                    shrink-0 items-center
                    justify-center
                    rounded-full
                "
                style={{
                    color:
                        "var(--brand-primary)",
                    backgroundColor:
                        "color-mix(in srgb, var(--brand-primary) 10%, white)",
                }}
            >
                <Check
                    size={12}
                    strokeWidth={2.5}
                />
            </div>

            <p className="text-xs leading-5 text-slate-600">
                {children}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Input Class
|--------------------------------------------------------------------------
*/

function inputClass(error) {
    return `
        h-11 w-full rounded-xl
        border bg-white px-3.5
        text-sm text-slate-800
        outline-none transition
        placeholder:text-slate-400
        ${
            error
                ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                : "border-slate-200 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
        }
    `;
}

export default CreateAssetLayoutPage;