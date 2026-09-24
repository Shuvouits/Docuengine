import {
    FileText,
    Layers3,
    LoaderCircle,
    Monitor,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import api from "../../../api/axios";

function LayoutBuilderPreviewModal({
    open = false,
    tenantId = null,
    layoutId = null,
    onClose = () => {},
}) {
    const [builder, setBuilder] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (
            !open ||
            !tenantId ||
            !layoutId
        ) {
            return;
        }

        const loadBuilder = async () => {
            setLoading(true);
            setError("");

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/asset-layouts/${layoutId}/builder`
                    );

                setBuilder(
                    response.data?.data
                        ?.builder ||
                        response.data?.data ||
                        null
                );
            } catch (error) {
                console.error(
                    "Failed to load layout builder:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                        "Unable to load builder preview."
                );
            } finally {
                setLoading(false);
            }
        };

        loadBuilder();
    }, [
        open,
        tenantId,
        layoutId,
    ]);

    if (!open) {
        return null;
    }

    const layout =
        builder?.layout ||
        builder?.asset_layout ||
        builder ||
        null;

    const sections =
        builder?.sections ||
        layout?.sections ||
        [];

    return (
        <div className="fixed inset-0 z-[145] flex items-center justify-center p-4">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            />

            <div className="relative z-10 flex max-h-[90vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div
                    className="h-1 shrink-0"
                    style={{
                        backgroundColor:
                            "var(--brand-primary)",
                    }}
                />

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
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
                            <Monitor size={18} />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Builder Preview
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Preview the current layout
                                structure returned by the
                                builder API.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                    {loading ? (
                        <div className="flex min-h-[350px] items-center justify-center">
                            <div className="text-center">
                                <LoaderCircle
                                    size={28}
                                    className="mx-auto animate-spin text-slate-400"
                                />

                                <p className="mt-3 text-sm text-slate-500">
                                    Loading builder...
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                <h3 className="text-lg font-bold text-slate-950">
                                    {layout?.name ||
                                        "Asset Layout"}
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    {layout?.description ||
                                        "No description provided."}
                                </p>
                            </div>

                            {!sections.length ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
                                    <Layers3
                                        size={28}
                                        className="mx-auto text-slate-300"
                                    />

                                    <p className="mt-3 text-sm font-semibold text-slate-600">
                                        No sections available
                                    </p>
                                </div>
                            ) : (
                                sections.map(
                                    (section) => (
                                        <div
                                            key={
                                                section.id
                                            }
                                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                                        >
                                            <div className="border-b border-slate-200 px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Layers3
                                                        size={
                                                            17
                                                        }
                                                        style={{
                                                            color:
                                                                "var(--brand-primary)",
                                                        }}
                                                    />

                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {
                                                                section.name
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            {section.columns ||
                                                                1}{" "}
                                                            column(s)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className="grid gap-4 p-5"
                                                style={{
                                                    gridTemplateColumns:
                                                        `repeat(${Math.min(
                                                            Number(
                                                                section.columns ||
                                                                    1
                                                            ),
                                                            4
                                                        )}, minmax(0, 1fr))`,
                                                }}
                                            >
                                                {(
                                                    section.fields ||
                                                    []
                                                ).map(
                                                    (
                                                        field
                                                    ) => (
                                                        <div
                                                            key={
                                                                field.id
                                                            }
                                                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <FileText
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="text-slate-400"
                                                                />

                                                                <p className="text-xs font-semibold text-slate-800">
                                                                    {field.label ||
                                                                        field.name}
                                                                </p>
                                                            </div>

                                                            <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
                                                                {
                                                                    field.field_type
                                                                }
                                                            </p>

                                                            {field.placeholder && (
                                                                <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400">
                                                                    {
                                                                        field.placeholder
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LayoutBuilderPreviewModal;