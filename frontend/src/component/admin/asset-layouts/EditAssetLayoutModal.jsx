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

function EditAssetLayoutModal({
    open = false,
    tenantId = null,
    layout = null,
    onClose = () => {},
    onUpdated = () => {},
}) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        status: "draft",
        is_template: false,
    });

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [validationErrors, setValidationErrors] =
        useState({});

    useEffect(() => {
        if (!open || !layout) {
            return;
        }

        setForm({
            name:
                layout.name || "",

            description:
                layout.description || "",

            status:
                layout.status || "draft",

            is_template:
                Boolean(
                    layout.is_template
                ),
        });

        setError("");
        setValidationErrors({});
    }, [
        open,
        layout,
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

    if (!open || !layout) {
        return null;
    }

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

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!tenantId || !layout?.id) {
            return;
        }

        if (!form.name.trim()) {
            setValidationErrors({
                name:
                    "Layout name is required.",
            });

            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response =
                await api.patch(
                    `/tenants/${tenantId}/asset-layouts/${layout.id}`,
                    {
                        name:
                            form.name.trim(),

                        description:
                            form.description.trim() ||
                            null,

                        status:
                            form.status,

                        is_template:
                            Boolean(
                                form.is_template
                            ),
                    }
                );

            await onUpdated(
                response.data?.data
                    ?.asset_layout || null
            );

            onClose();
        } catch (error) {
            console.error(
                "Failed to update asset layout:",
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
                    "Unable to update asset layout."
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
                            <Layers3 size={20} />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Edit Asset Layout
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Update layout information
                                and lifecycle status.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 p-6">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <FieldGroup
                            label="Layout Name"
                            required
                            error={getError(
                                "name"
                            )}
                        >
                            <input
                                name="name"
                                value={form.name}
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
                                className="
                                    min-h-[110px] w-full
                                    resize-y rounded-xl
                                    border border-slate-200
                                    px-3.5 py-3
                                    text-sm text-slate-800
                                    outline-none
                                    focus:ring-4
                                    focus:ring-slate-100
                                "
                            />
                        </FieldGroup>

                        <FieldGroup
                            label="Status"
                            error={getError(
                                "status"
                            )}
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
                                    getError(
                                        "status"
                                    )
                                )}
                            >
                                <option value="draft">
                                    Draft
                                </option>

                                <option value="published">
                                    Published
                                </option>
                            </select>
                        </FieldGroup>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <input
                                type="checkbox"
                                name="is_template"
                                checked={
                                    form.is_template
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
                                    Reusable Template
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Make this layout
                                    available as a reusable
                                    template.
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
                                items-center justify-center
                                gap-2 rounded-xl px-5
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
        h-11 w-full rounded-xl
        border bg-white px-3.5
        text-sm text-slate-800
        outline-none
        focus:ring-4
        focus:ring-slate-100
        ${
            error
                ? "border-red-300"
                : "border-slate-200"
        }
    `;
}

export default EditAssetLayoutModal;