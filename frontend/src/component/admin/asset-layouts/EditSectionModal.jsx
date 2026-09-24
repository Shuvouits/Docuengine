import {
    Layers3,
    LoaderCircle,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import api from "../../../api/axios";

function EditSectionModal({
    open = false,
    onClose = () => {},
    tenantId = null,
    layoutId = null,
    section = null,
    onUpdated = () => {},
}) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        sort_order: 1,
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
    | Populate Section
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !open ||
            !section
        ) {
            return;
        }

        setForm({
            name:
                section.name || "",

            description:
                section.description || "",

            sort_order:
                Number(
                    section.sort_order || 1
                ),

            columns:
                Number(
                    section.columns || 1
                ),

            is_collapsible:
                Boolean(
                    section.is_collapsible
                ),

            is_collapsed_by_default:
                Boolean(
                    section.is_collapsed_by_default
                ),

            is_visible:
                section.is_visible !== false,
        });

        setError("");
        setValidationErrors({});
    }, [
        open,
        section,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Escape
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

    if (
        !open ||
        !section
    ) {
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

        setForm((current) => {
            const next = {
                ...current,
                [name]:
                    type === "checkbox"
                        ? checked
                        : value,
            };

            if (
                name === "is_collapsible" &&
                !checked
            ) {
                next.is_collapsed_by_default =
                    false;
            }

            return next;
        });

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

        if (
            !tenantId ||
            !layoutId ||
            !section?.id
        ) {
            setError(
                "Section information is unavailable."
            );

            return;
        }

        const errors = {};

        if (!form.name.trim()) {
            errors.name =
                "Section name is required.";
        }

        if (
            Number(form.columns) < 1 ||
            Number(form.columns) > 4
        ) {
            errors.columns =
                "Columns must be between 1 and 4.";
        }

        if (
            Number(form.sort_order) < 1
        ) {
            errors.sort_order =
                "Sort order must be at least 1.";
        }

        if (Object.keys(errors).length) {
            setValidationErrors(
                errors
            );

            return;
        }

        setSubmitting(true);
        setError("");
        setValidationErrors({});

        try {
            const payload = {
                name:
                    form.name.trim(),

                description:
                    form.description.trim() ||
                    null,

                sort_order:
                    Number(
                        form.sort_order
                    ),

                columns:
                    Number(
                        form.columns
                    ),

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

            const response =
                await api.patch(
                    `/tenants/${tenantId}/asset-layouts/${layoutId}/sections/${section.id}`,
                    payload
                );

            const updatedSection =
                response.data?.data?.section ||
                null;

            await onUpdated(
                updatedSection
            );

            onClose();
        } catch (error) {
            console.error(
                "Failed to update asset layout section:",
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
                    "Unable to update section."
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
                                Edit Section
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Update{" "}
                                <span className="font-semibold text-slate-700">
                                    {section.name}
                                </span>
                                .
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onClose}
                        className="
                            flex h-9 w-9
                            items-center
                            justify-center
                            rounded-xl
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                            disabled:opacity-50
                        "
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                >
                    <div className="max-h-[72vh] space-y-5 overflow-y-auto p-6">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Name */}

                        <FieldGroup
                            label="Section Name"
                            required
                            error={getError(
                                "name"
                            )}
                        >
                            <input
                                type="text"
                                name="name"
                                value={
                                    form.name
                                }
                                onChange={
                                    handleChange
                                }
                                className={inputClass(
                                    getError(
                                        "name"
                                    )
                                )}
                            />
                        </FieldGroup>

                        {/* Description */}

                        <FieldGroup
                            label="Description"
                            error={getError(
                                "description"
                            )}
                        >
                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                rows={4}
                                className="
                                    min-h-[110px]
                                    w-full resize-y
                                    rounded-xl border
                                    border-slate-200
                                    bg-white px-3.5 py-3
                                    text-sm text-slate-800
                                    outline-none transition
                                    focus:border-slate-300
                                    focus:ring-4
                                    focus:ring-slate-100
                                "
                            />
                        </FieldGroup>

                        {/* Sort + Columns */}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <FieldGroup
                                label="Sort Order"
                                error={getError(
                                    "sort_order"
                                )}
                            >
                                <input
                                    type="number"
                                    min="1"
                                    name="sort_order"
                                    value={
                                        form.sort_order
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass(
                                        getError(
                                            "sort_order"
                                        )
                                    )}
                                />
                            </FieldGroup>

                            <FieldGroup
                                label="Columns"
                                error={getError(
                                    "columns"
                                )}
                            >
                                <select
                                    name="columns"
                                    value={
                                        form.columns
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass(
                                        getError(
                                            "columns"
                                        )
                                    )}
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
                            </FieldGroup>
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
                                description="Allow users to expand and collapse this section."
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
                            onClick={
                                onClose
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

                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
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
| Field Group
|--------------------------------------------------------------------------
*/

function FieldGroup({
    label,
    required = false,
    error = null,
    children,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            {children}

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
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
        ${
            error
                ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                : "border-slate-200 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
        }
    `;
}

export default EditSectionModal;