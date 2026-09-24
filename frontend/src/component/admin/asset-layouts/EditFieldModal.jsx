import {
    FilePenLine,
    LoaderCircle,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import api from "../../../api/axios";

const FIELD_TYPES = [
    {
        value: "text",
        label: "Text",
    },
    {
        value: "rich_text",
        label: "Rich Text",
    },
    {
        value: "number",
        label: "Number",
    },
    {
        value: "date",
        label: "Date",
    },
    {
        value: "url",
        label: "URL",
    },
    {
        value: "email",
        label: "Email",
    },
    {
        value: "phone",
        label: "Phone",
    },
    {
        value: "checkbox",
        label: "Checkbox",
    },
    {
        value: "select",
        label: "Select",
    },
    {
        value: "multi_select",
        label: "Multi Select",
    },
    {
        value: "file",
        label: "File",
    },
    {
        value: "relationship",
        label: "Relationship",
    },
];

function EditFieldModal({
    open = false,
    onClose = () => {},
    tenantId = null,
    layoutId = null,
    section = null,
    field = null,
    onUpdated = () => {},
}) {
    const [form, setForm] = useState({
        name: "",
        field_key: "",
        field_type: "text",
        label: "",
        description: "",
        placeholder: "",
        sort_order: 1,
        is_required: false,
        is_unique: false,
        is_visible: true,
        option_list_id: "",
    });

    const [optionLists, setOptionLists] =
        useState([]);

    const [loadingOptionLists, setLoadingOptionLists] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [validationErrors, setValidationErrors] =
        useState({});

    /*
    |--------------------------------------------------------------------------
    | Populate Field
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !open ||
            !field
        ) {
            return;
        }

        setForm({
            name:
                field.name || "",

            field_key:
                field.field_key || "",

            field_type:
                field.field_type || "text",

            label:
                field.label || "",

            description:
                field.description || "",

            placeholder:
                field.placeholder || "",

            sort_order:
                Number(
                    field.sort_order || 1
                ),

            is_required:
                Boolean(
                    field.is_required
                ),

            is_unique:
                Boolean(
                    field.is_unique
                ),

            is_visible:
                field.is_visible !== false,

            option_list_id:
                field.option_list_id || "",
        });

        setError("");
        setValidationErrors({});
    }, [
        open,
        field,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Load Option Lists
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !open ||
            !tenantId
        ) {
            return;
        }

        const loadOptionLists = async () => {
            setLoadingOptionLists(true);

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/option-lists`
                    );

                const lists =
                    response.data?.data
                        ?.option_lists || [];

                setOptionLists(
                    lists.filter(
                        (item) =>
                            item.is_active !== false
                    )
                );
            } catch (error) {
                console.error(
                    "Failed to load option lists:",
                    error
                );

                setOptionLists([]);
            } finally {
                setLoadingOptionLists(false);
            }
        };

        loadOptionLists();
    }, [
        open,
        tenantId,
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
        !field ||
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

        if (
            !tenantId ||
            !layoutId ||
            !section?.id ||
            !field?.id
        ) {
            setError(
                "Field information is unavailable."
            );

            return;
        }

        const errors = {};

        if (!form.name.trim()) {
            errors.name =
                "Field name is required.";
        }

        if (!form.field_key.trim()) {
            errors.field_key =
                "Field key is required.";
        }

        if (!form.label.trim()) {
            errors.label =
                "Field label is required.";
        }

        if (
            [
                "select",
                "multi_select",
            ].includes(
                form.field_type
            ) &&
            !form.option_list_id
        ) {
            errors.option_list_id =
                "Select an option list for this field type.";
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
            const usesOptionList =
                [
                    "select",
                    "multi_select",
                ].includes(
                    form.field_type
                );

            const payload = {
                name:
                    form.name.trim(),

                field_key:
                    form.field_key.trim(),

                field_type:
                    form.field_type,

                label:
                    form.label.trim(),

                description:
                    form.description.trim() ||
                    null,

                placeholder:
                    form.placeholder.trim() ||
                    null,

                sort_order:
                    Number(
                        form.sort_order
                    ),

                is_required:
                    Boolean(
                        form.is_required
                    ),

                is_unique:
                    Boolean(
                        form.is_unique
                    ),

                is_visible:
                    Boolean(
                        form.is_visible
                    ),

                option_list_id:
                    usesOptionList
                        ? form.option_list_id
                        : null,
            };

            const response =
                await api.patch(
                    `/tenants/${tenantId}/asset-layouts/${layoutId}/sections/${section.id}/fields/${field.id}`,
                    payload
                );

            const updatedField =
                response.data?.data
                    ?.field || null;

            await onUpdated(
                updatedField
            );

            onClose();
        } catch (error) {
            console.error(
                "Failed to update asset layout field:",
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
                    "Unable to update field."
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

    const usesOptionList =
        [
            "select",
            "multi_select",
        ].includes(
            form.field_type
        );

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

            <div className="relative z-10 w-full max-w-[680px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
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
                            <FilePenLine
                                size={20}
                                strokeWidth={1.8}
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Edit Field
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Update{" "}
                                <span className="font-semibold text-slate-700">
                                    {field.label ||
                                        field.name}
                                </span>{" "}
                                in{" "}
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
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
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

                        <div className="grid gap-5 md:grid-cols-2">
                            <FieldGroup
                                label="Field Name"
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

                            <FieldGroup
                                label="Field Key"
                                required
                                error={getError(
                                    "field_key"
                                )}
                            >
                                <input
                                    type="text"
                                    name="field_key"
                                    value={
                                        form.field_key
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass(
                                        getError(
                                            "field_key"
                                        )
                                    )}
                                />
                            </FieldGroup>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <FieldGroup
                                label="Label"
                                required
                                error={getError(
                                    "label"
                                )}
                            >
                                <input
                                    type="text"
                                    name="label"
                                    value={
                                        form.label
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass(
                                        getError(
                                            "label"
                                        )
                                    )}
                                />
                            </FieldGroup>

                            <FieldGroup
                                label="Field Type"
                                required
                                error={getError(
                                    "field_type"
                                )}
                            >
                                <select
                                    name="field_type"
                                    value={
                                        form.field_type
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass(
                                        getError(
                                            "field_type"
                                        )
                                    )}
                                >
                                    {FIELD_TYPES.map(
                                        (type) => (
                                            <option
                                                key={
                                                    type.value
                                                }
                                                value={
                                                    type.value
                                                }
                                            >
                                                {
                                                    type.label
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </FieldGroup>
                        </div>

                        {usesOptionList && (
                            <FieldGroup
                                label="Option List"
                                required
                                error={getError(
                                    "option_list_id"
                                )}
                                description="Reusable options used by this field."
                            >
                                <select
                                    name="option_list_id"
                                    value={
                                        form.option_list_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        loadingOptionLists
                                    }
                                    className={inputClass(
                                        getError(
                                            "option_list_id"
                                        )
                                    )}
                                >
                                    <option value="">
                                        {loadingOptionLists
                                            ? "Loading option lists..."
                                            : "Select option list"}
                                    </option>

                                    {optionLists.map(
                                        (item) => (
                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.id
                                                }
                                            >
                                                {
                                                    item.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </FieldGroup>
                        )}

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
                                rows={3}
                                className="
                                    min-h-[95px] w-full
                                    resize-y rounded-xl
                                    border border-slate-200
                                    bg-white px-3.5 py-3
                                    text-sm text-slate-800
                                    outline-none transition
                                    focus:border-slate-300
                                    focus:ring-4
                                    focus:ring-slate-100
                                "
                            />
                        </FieldGroup>

                        <FieldGroup
                            label="Placeholder"
                            error={getError(
                                "placeholder"
                            )}
                        >
                            <input
                                type="text"
                                name="placeholder"
                                value={
                                    form.placeholder
                                }
                                onChange={
                                    handleChange
                                }
                                className={inputClass(
                                    getError(
                                        "placeholder"
                                    )
                                )}
                            />
                        </FieldGroup>

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

                        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <CheckboxOption
                                name="is_visible"
                                checked={
                                    form.is_visible
                                }
                                onChange={
                                    handleChange
                                }
                                title="Visible field"
                                description="Show this field when this layout is used."
                            />

                            <CheckboxOption
                                name="is_required"
                                checked={
                                    form.is_required
                                }
                                onChange={
                                    handleChange
                                }
                                title="Required field"
                                description="Require a value for this field."
                            />

                            <CheckboxOption
                                name="is_unique"
                                checked={
                                    form.is_unique
                                }
                                onChange={
                                    handleChange
                                }
                                title="Unique value"
                                description="Values stored in this field should be unique."
                            />
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
    description = null,
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

            {error ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
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
| Checkbox Option
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
        placeholder:text-slate-400
        ${
            error
                ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                : "border-slate-200 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
        }
    `;
}

export default EditFieldModal;