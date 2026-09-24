import {
    ListChecks,
    LoaderCircle,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import api from "../../../api/axios";

function OptionListFormModal({
    open = false,
    tenantId = null,
    optionList = null,
    onClose = () => {},
    onSaved = () => {},
}) {
    const isEditing =
        Boolean(optionList?.id);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        is_active: true,
    });

    const [
        slugManuallyEdited,
        setSlugManuallyEdited,
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
            name:
                optionList?.name || "",
            slug:
                optionList?.slug || "",
            description:
                optionList?.description ||
                "",
            is_active:
                optionList?.is_active !==
                false,
        });

        setSlugManuallyEdited(
            Boolean(optionList?.id)
        );

        setError("");
        setValidationErrors({});
    }, [
        open,
        optionList,
    ]);

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

        return () =>
            window.removeEventListener(
                "keydown",
                handleEscape
            );
    }, [
        open,
        submitting,
        onClose,
    ]);

    if (!open) {
        return null;
    }

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        if (name === "name") {
            setForm((current) => ({
                ...current,
                name: value,
                slug:
                    slugManuallyEdited
                        ? current.slug
                        : createSlug(
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

        if (name === "slug") {
            setSlugManuallyEdited(true);
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

        if (!tenantId) {
            return;
        }

        const errors = {};

        if (!form.name.trim()) {
            errors.name =
                "Option list name is required.";
        }

        if (!form.slug.trim()) {
            errors.slug =
                "Slug is required.";
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
        setValidationErrors({});

        try {
            const payload = {
                name:
                    form.name.trim(),
                slug:
                    form.slug.trim(),
                description:
                    form.description.trim() ||
                    null,
                is_active:
                    Boolean(
                        form.is_active
                    ),
            };

            let response;

            if (isEditing) {
                response =
                    await api.patch(
                        `/tenants/${tenantId}/option-lists/${optionList.id}`,
                        payload
                    );
            } else {
                response =
                    await api.post(
                        `/tenants/${tenantId}/option-lists`,
                        payload
                    );
            }

            const saved =
                response.data?.data
                    ?.option_list ||
                response.data?.data ||
                null;

            await onSaved(saved);

            onClose();
        } catch (error) {
            console.error(
                "Failed to save option list:",
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
                    "Unable to save option list."
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
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <button
                type="button"
                onClick={() => {
                    if (!submitting) {
                        onClose();
                    }
                }}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            />

            <div className="relative z-10 w-full max-w-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div
                    className="h-1"
                    style={{
                        backgroundColor:
                            "var(--brand-primary)",
                    }}
                />

                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-11 w-11 items-center justify-center rounded-xl"
                            style={{
                                color:
                                    "var(--brand-primary)",
                                backgroundColor:
                                    "color-mix(in srgb, var(--brand-primary) 9%, white)",
                            }}
                        >
                            <ListChecks
                                size={20}
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                {isEditing
                                    ? "Edit Option List"
                                    : "Create Option List"}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Create reusable
                                options for select
                                fields.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={
                            submitting
                        }
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100"
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
                            label="List Name"
                            required
                            error={getError(
                                "name"
                            )}
                        >
                            <input
                                name="name"
                                value={
                                    form.name
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Example: Device Status"
                                className={inputClass(
                                    getError(
                                        "name"
                                    )
                                )}
                            />
                        </FieldGroup>

                        <FieldGroup
                            label="Slug"
                            required
                            error={getError(
                                "slug"
                            )}
                        >
                            <input
                                name="slug"
                                value={
                                    form.slug
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="device-status"
                                className={inputClass(
                                    getError(
                                        "slug"
                                    )
                                )}
                            />
                        </FieldGroup>

                        <FieldGroup
                            label="Description"
                            error={getError(
                                "description"
                            )}
                        >
                            <textarea
                                name="description"
                                rows={4}
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Describe where this option list should be used."
                                className="
                                    min-h-[105px]
                                    w-full resize-y
                                    rounded-xl border
                                    border-slate-200
                                    bg-white px-3.5
                                    py-3 text-sm
                                    text-slate-800
                                    outline-none
                                    transition
                                    focus:ring-4
                                    focus:ring-slate-100
                                "
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
                                    Active List
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Allow this list
                                    to be selected by
                                    custom fields.
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
                                min-w-[130px]
                                items-center
                                justify-center gap-2
                                rounded-xl px-5
                                text-sm font-semibold
                                text-white
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
                            ) : isEditing ? (
                                "Save Changes"
                            ) : (
                                "Create List"
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
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

function inputClass(error) {
    return `
        h-11 w-full rounded-xl
        border bg-white px-3.5
        text-sm text-slate-800
        outline-none transition
        ${
            error
                ? "border-red-300 focus:ring-4 focus:ring-red-50"
                : "border-slate-200 focus:ring-4 focus:ring-slate-100"
        }
    `;
}

function createSlug(value) {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default OptionListFormModal;