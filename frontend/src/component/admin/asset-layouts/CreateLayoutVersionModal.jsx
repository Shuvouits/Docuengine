import {
    GitBranch,
    LoaderCircle,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import api from "../../../api/axios";

function CreateLayoutVersionModal({
    open = false,
    tenantId = null,
    layout = null,
    onClose = () => {},
    onCreated = () => {},
}) {
    const [changeSummary, setChangeSummary] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (!open) {
            return;
        }

        setChangeSummary("");
        setError("");
    }, [open]);

    if (!open || !layout) {
        return null;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!changeSummary.trim()) {
            setError(
                "Change summary is required."
            );

            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response =
                await api.post(
                    `/tenants/${tenantId}/asset-layouts/${layout.id}/versions`,
                    {
                        change_summary:
                            changeSummary.trim(),
                    }
                );

            await onCreated(
                response.data?.data
                    ?.version || null
            );

            onClose();
        } catch (error) {
            console.error(
                "Failed to create layout version:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to create layout version."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[145] flex items-center justify-center p-4">
            <button
                type="button"
                onClick={() => {
                    if (!submitting) {
                        onClose();
                    }
                }}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
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
                    <div className="flex gap-3">
                        <div
                            className="flex h-11 w-11 items-center justify-center rounded-xl"
                            style={{
                                color:
                                    "var(--brand-primary)",

                                backgroundColor:
                                    "color-mix(in srgb, var(--brand-primary) 9%, white)",
                            }}
                        >
                            <GitBranch size={20} />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Create Schema Version
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Save an immutable snapshot
                                of the current layout.
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
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Current Version
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-900">
                                v
                                {layout.current_version ??
                                    1}
                            </p>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Change Summary
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <textarea
                                rows={5}
                                value={
                                    changeSummary
                                }
                                onChange={(event) => {
                                    setChangeSummary(
                                        event.target.value
                                    );

                                    setError("");
                                }}
                                placeholder="Describe the changes included in this schema version."
                                className="
                                    min-h-[130px] w-full
                                    resize-y rounded-xl
                                    border border-slate-200
                                    px-3.5 py-3
                                    text-sm text-slate-800
                                    outline-none
                                    focus:ring-4
                                    focus:ring-slate-100
                                "
                            />
                        </div>
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
                                min-w-[145px]
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

                                    Creating...
                                </>
                            ) : (
                                "Create Version"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateLayoutVersionModal;