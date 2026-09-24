import {
    FileText,
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

function CreateFieldModal({
    open = false,
    onClose = () => {},
    tenantId = null,
    layoutId = null,
    section = null,
    onCreated = () => {},
}) {
    const [form, setForm] = useState({
        name: "",
        field_key: "",
        field_type: "text",
        label: "",
        description: "",
        placeholder: "",
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

    const [keyManuallyEdited, setKeyManuallyEdited] =
        useState(false);

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
            field_key: "",
            field_type: "text",
            label: "",
            description: "",
            placeholder: "",
            is_required: false,
            is_unique: false,
            is_visible: true,
            option_list_id: "",
        });

        setError("");
        setValidationErrors({});
        setKeyManuallyEdited(false);
    }, [open]);

    /*
    |--------------------------------------------------------------------------
    | Generate Field Key
    |--------------------------------------------------------------------------
    */

    const generateFieldKey = (value) => {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    };

    useEffect(() => {
        if (keyManuallyEdited) {
            return;
        }

        setForm((current) => ({
            ...current,
            field_key: generateFieldKey(
                current.name
            ),
            label:
                current.label ||
                current.name,
        }));
    }, [
        form.name,
        keyManuallyEdited,
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

    if (!open || !section) {
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

        if (name === "field_key") {
            setKeyManuallyEdited(true);
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
            ["select", "multi_select"].includes(
                form.field_type
            ) &&
            !form.option_list_id
        ) {
            errors.option_list_id =
                "Select an option list for this field type.";
        }

        if (Object.keys(errors).length) {
            setValidationErrors(errors);
            return;
        }

        setSubmitting(true);
        setError("");
        setValidationErrors({});

        try {
            const payload = {
                name: form.name.trim(),

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
                        section.fields_count || 0
                    ) + 1,

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
                    [
                        "select",
                        "multi_select",
                    ].includes(
                        form.field_type
                    )
                        ? form.option_list_id
                        : null,
            };

            const response =
                await api.post(
                    `/tenants/${tenantId}/asset-layouts/${layoutId}/sections/${section.id}/fields`,
                    payload
                );

            const field =
                response.data?.data
                    ?.field || null;

            await onCreated(field);

            onClose();
        } catch (error) {
            console.error(
                "Failed to create asset layout field:",
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
                    "Unable to create field."
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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

            <div className="relative z-10 w-full max-w-[680px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div
                    className="h-1 w-full"
                    style={{
                        backgroundColor:
                            "var(--brand-primary)",
                    }}
                />

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
                            <FileText
                                size={20}
                                strokeWidth={1.8}
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Add Field
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Add a field to{" "}
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
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
                                    value={form.name}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: Device Name"
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
                                    placeholder="device_name"
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
                                    placeholder="Device Name"
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
                                description="Select the reusable option list used by this field."
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
                                placeholder="Describe what this field stores."
                                className="
                                    min-h-[95px] w-full
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
                                placeholder="Example: Enter workstation name"
                                className={inputClass(
                                    getError(
                                        "placeholder"
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
                                description="Require a value before the asset record can be considered complete."
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
                                description="Values entered in this field should be unique."
                            />
                        </div>
                    </div>

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
                                items-center justify-center
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
                                min-w-[125px]
                                items-center justify-center
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
                                        size={16}
                                        className="animate-spin"
                                    />

                                    Creating...
                                </>
                            ) : (
                                "Add Field"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

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

export default CreateFieldModal;