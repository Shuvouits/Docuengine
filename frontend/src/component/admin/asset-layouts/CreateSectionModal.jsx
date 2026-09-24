import {
    Layers3,
    LoaderCircle,
    X,
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "../../../api/axios";

function CreateSectionModal({
    open = false,
    onClose = () => {},
    tenantId = null,
    layoutId = null,
    onCreated = () => {},
}) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        columns: 1,
        is_collapsible: false,
        is_collapsed_by_default: false,
        is_visible: true,
    });

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [validationErrors, setValidationErrors] =
        useState({});

    /*
    |--------------------------------------------------------------------------
    | Reset
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm({
            name: "",
            description: "",
            columns: 1,
            is_collapsible: false,
            is_collapsed_by_default: false,
            is_visible: true,
        });

        setError("");
        setValidationErrors({});
    }, [open]);

    /*
    |--------------------------------------------------------------------------
    | Close on Escape
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleEscape = (event) => {
            if (
                event.key === "Escape" &&
                !submitting
            ) {
                onClose();
            }
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [
        open,
        submitting,
        onClose,
    ]);

    if (!open) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Input
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

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
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!tenantId || !layoutId) {
            setError(
                "Layout information is unavailable."
            );
            return;
        }

        if (!form.name.trim()) {
            setValidationErrors({
                name:
                    "Section name is required.",
            });

            return;
        }

        setSubmitting(true);
        setError("");
        setValidationErrors({});

        try {
            const payload = {
                name: form.name.trim(),

                description:
                    form.description.trim() ||
                    null,

                columns:
                    Number(form.columns),

                is_collapsible:
                    Boolean(
                        form.is_collapsible
                    ),

                is_collapsed_by_default:
                    Boolean(
                        form.is_collapsible &&
                            form.is_collapsed_by_default
                    ),

                is_visible:
                    Boolean(
                        form.is_visible
                    ),
            };

            const response = await api.post(
                `/tenants/${tenantId}/asset-layouts/${layoutId}/sections`,
                payload
            );

            const section =
                response.data?.data?.section ||
                null;

            await onCreated(section);

            onClose();
        } catch (error) {
            console.error(
                "Failed to create asset layout section:",
                error
            );

            if (
                error.response?.status === 422
            ) {
                setValidationErrors(
                    error.response?.data
                        ?.errors || {}
                );
            }

            setError(
                error.response?.data?.message ||
                    "Unable to create section."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const getError = (key) => {
        const value =
            validationErrors?.[key];

        return Array.isArray(value)
            ? value[0]
            : value;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}

            <button
                type="button"
                aria-label="Close modal"
                onClick={() => {
                    if (!submitting) {
                        onClose();
                    }
                }}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            />

            {/* Modal */}

            <div className="relative z-10 w-full max-w-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                {/* Accent */}

                <div
                    className="h-1 w-full"
                    style={{
                        backgroundColor:
                            "var(--brand-primary)",
                    }}
                />

                {/* Header */}

                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                            style={{
                                color:
                                    "var(--brand-primary)",

                                backgroundColor:
                                    "color-mix(in srgb, var(--brand-primary) 9%, white)",
                            }}
                        >
                            <Layers3
                                size={20}
                                strokeWidth={1.8}
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Add Section
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Create a group for
                                related asset fields.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                >
                    <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Name */}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Section Name
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={
                                    handleChange
                                }
                                placeholder="Example: Hardware Details"
                                className={`
                                    h-11 w-full
                                    rounded-xl border
                                    bg-white px-3.5
                                    text-sm text-slate-800
                                    outline-none transition
                                    placeholder:text-slate-400
                                    ${
                                        getError(
                                            "name"
                                        )
                                            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                                            : "border-slate-200 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                                    }
                                `}
                            />

                            {getError("name") && (
                                <p className="mt-1.5 text-xs font-medium text-red-600">
                                    {getError(
                                        "name"
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Description */}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                rows={4}
                                placeholder="Describe what information belongs in this section."
                                className="
                                    min-h-[110px] w-full
                                    resize-y rounded-xl
                                    border border-slate-200
                                    bg-white px-3.5 py-3
                                    text-sm text-slate-800
                                    outline-none transition
                                    placeholder:text-slate-400
                                    focus:border-slate-300
                                    focus:ring-4
                                    focus:ring-slate-100
                                "
                            />
                        </div>

                        {/* Columns */}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Columns
                            </label>

                            <select
                                name="columns"
                                value={form.columns}
                                onChange={
                                    handleChange
                                }
                                className="
                                    h-11 w-full rounded-xl
                                    border border-slate-200
                                    bg-white px-3.5
                                    text-sm text-slate-800
                                    outline-none transition
                                    focus:border-slate-300
                                    focus:ring-4
                                    focus:ring-slate-100
                                "
                            >
                                <option value={1}>
                                    1 Column
                                </option>

                                <option value={2}>
                                    2 Columns
                                </option>

                                <option value={3}>
                                    3 Columns
                                </option>

                                <option value={4}>
                                    4 Columns
                                </option>
                            </select>

                            <p className="mt-1.5 text-xs leading-5 text-slate-400">
                                Controls how fields
                                will be arranged inside
                                this section.
                            </p>
                        </div>

                        {/* Options */}

                        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <CheckboxOption
                                name="is_visible"
                                checked={
                                    form.is_visible
                                }
                                onChange={
                                    handleChange
                                }
                                title="Visible section"
                                description="Show this section when the layout is used."
                            />

                            <CheckboxOption
                                name="is_collapsible"
                                checked={
                                    form.is_collapsible
                                }
                                onChange={
                                    handleChange
                                }
                                title="Collapsible"
                                description="Allow users to collapse this section."
                            />

                            {form.is_collapsible && (
                                <CheckboxOption
                                    name="is_collapsed_by_default"
                                    checked={
                                        form.is_collapsed_by_default
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    title="Collapsed by default"
                                    description="Start this section in the collapsed state."
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer */}

                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                        <button
                            type="button"
                            disabled={
                                submitting
                            }
                            onClick={onClose}
                            className="
                                inline-flex h-11
                                items-center justify-center
                                rounded-xl border
                                border-slate-200
                                bg-white px-5
                                text-sm font-semibold
                                text-slate-700
                                transition
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
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
                                min-w-[130px]
                                items-center
                                justify-center gap-2
                                rounded-xl px-5
                                text-sm font-semibold
                                text-white shadow-sm
                                transition
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
                                        size={16}
                                        className="animate-spin"
                                    />

                                    Creating...
                                </>
                            ) : (
                                "Add Section"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Checkbox
|--------------------------------------------------------------------------
*/

function CheckboxOption({
    name,
    checked,
    onChange,
    title,
    description,
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                style={{
                    accentColor:
                        "var(--brand-primary)",
                }}
            />

            <div>
                <p className="text-sm font-medium text-slate-700">
                    {title}
                </p>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            </div>
        </label>
    );
}

export default CreateSectionModal;