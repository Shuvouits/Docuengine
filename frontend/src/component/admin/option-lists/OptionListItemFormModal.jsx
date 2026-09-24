import {
    ListPlus,
    LoaderCircle,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import api from "../../../api/axios";

function OptionListItemFormModal({
    open = false,
    tenantId = null,
    optionList = null,
    item = null,
    nextSortOrder = 1,
    onClose = () => {},
    onSaved = () => {},
}) {
    const isEditing =
        Boolean(item?.id);

    const [form, setForm] = useState({
        label: "",
        value: "",
        sort_order: 1,
        is_active: true,
    });

    const [
        valueManuallyEdited,
        setValueManuallyEdited,
    ] = useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [
        validationErrors,
        setValidationErrors,
    ] = useState({});

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm({
            label:
                item?.label || "",
            value:
                item?.value || "",
            sort_order:
                Number(
                    item?.sort_order ||
                        nextSortOrder ||
                        1
                ),
            is_active:
                item?.is_active !==
                false,
        });

        setValueManuallyEdited(
            Boolean(item?.id)
        );

        setError("");
        setValidationErrors({});
    }, [
        open,
        item,
        nextSortOrder,
    ]);

    if (
        !open ||
        !optionList
    ) {
        return null;
    }

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        if (name === "label") {
            setForm((current) => ({
                ...current,
                label: value,
                value:
                    valueManuallyEdited
                        ? current.value
                        : createValue(
                              value
                          ),
            }));
        } else {
            setForm((current) => ({
                ...current,
                [name]:
                    type === "checkbox"
                        ? checked
                        : value,
            }));
        }

        if (name === "value") {
            setValueManuallyEdited(true);
        }

        setValidationErrors(
            (current) => ({
                ...current,
                [name]: undefined,
            })
        );

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = {};

        if (!form.label.trim()) {
            errors.label =
                "Label is required.";
        }

        if (!form.value.trim()) {
            errors.value =
                "Value is required.";
        }

        if (
            Number(form.sort_order) < 1
        ) {
            errors.sort_order =
                "Sort order must be at least 1.";
        }

        if (
            Object.keys(errors).length
        ) {
            setValidationErrors(
                errors
            );

            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const payload = {
                label:
                    form.label.trim(),
                value:
                    form.value.trim(),
                sort_order:
                    Number(
                        form.sort_order
                    ),
                is_active:
                    Boolean(
                        form.is_active
                    ),
            };

            let response;

            if (isEditing) {
                response =
                    await api.patch(
                        `/tenants/${tenantId}/option-lists/${optionList.id}/items/${item.id}`,
                        payload
                    );
            } else {
                response =
                    await api.post(
                        `/tenants/${tenantId}/option-lists/${optionList.id}/items`,
                        payload
                    );
            }

            const saved =
                response.data?.data
                    ?.item ||
                response.data?.data
                    ?.option_list_item ||
                response.data?.data ||
                null;

            await onSaved(saved);

            onClose();
        } catch (error) {
            console.error(
                "Failed to save option item:",
                error
            );

            if (
                error.response?.status ===
                422
            ) {
                setValidationErrors(
                    error.response?.data
                        ?.errors || {}
                );
            }

            setError(
                error.response?.data?.message ||
                    "Unable to save option."
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
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
            <button
                type="button"
                onClick={() => {
                    if (!submitting) {
                        onClose();
                    }
                }}
                className="absolute inset-0 bg-slate-950/50"
            />

            <div className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div
                    className="h-1"
                    style={{
                        backgroundColor:
                            "var(--brand-primary)",
                    }}
                />

                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{
                                color:
                                    "var(--brand-primary)",
                                backgroundColor:
                                    "color-mix(in srgb, var(--brand-primary) 9%, white)",
                            }}
                        >
                            <ListPlus
                                size={18}
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                {isEditing
                                    ? "Edit Option"
                                    : "Add Option"}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {
                                    optionList.name
                                }
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={
                            submitting
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="space-y-5 p-6">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <FieldGroup
                            label="Label"
                            required
                            error={getError(
                                "label"
                            )}
                        >
                            <input
                                name="label"
                                value={
                                    form.label
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Example: Active"
                                className={inputClass(
                                    getError(
                                        "label"
                                    )
                                )}
                            />
                        </FieldGroup>

                        <FieldGroup
                            label="Stored Value"
                            required
                            error={getError(
                                "value"
                            )}
                        >
                            <input
                                name="value"
                                value={
                                    form.value
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="active"
                                className={inputClass(
                                    getError(
                                        "value"
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

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={
                                    form.is_active
                                }
                                onChange={
                                    handleChange
                                }
                                className="mt-0.5 h-4 w-4"
                                style={{
                                    accentColor:
                                        "var(--brand-primary)",
                                }}
                            />

                            <div>
                                <p className="text-sm font-semibold text-slate-700">
                                    Active Option
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Make this value
                                    available for
                                    selection.
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={
                                submitting
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
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
                                items-center
                                justify-center gap-2
                                rounded-xl px-5
                                text-sm font-semibold
                                text-white
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
                            ) : isEditing ? (
                                "Save Changes"
                            ) : (
                                "Add Option"
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
                <p className="mt-1.5 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

function inputClass(error) {
    return `
        h-11 w-full rounded-xl border
        bg-white px-3.5 text-sm
        text-slate-800 outline-none
        ${
            error
                ? "border-red-300 focus:ring-4 focus:ring-red-50"
                : "border-slate-200 focus:ring-4 focus:ring-slate-100"
        }
    `;
}

function createValue(value) {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export default OptionListItemFormModal;