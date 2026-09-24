import {
    AlertCircle,
    Archive,
    CheckCircle2,
    FilePenLine,
    FileText,
    LoaderCircle,
    X,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import api from "../../../api/axios";

import EditFieldModal from "./EditFieldModal";

function SectionFieldsList({
    tenantId = null,
    layoutId = null,
    section = null,
    refreshKey = 0,
    canManage = false,
    onChanged = () => {},
}) {
    const [fields, setFields] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [editingField, setEditingField] =
        useState(null);

    const [archiveField, setArchiveField] =
        useState(null);

    const [archiving, setArchiving] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Load Fields
    |--------------------------------------------------------------------------
    */

    const loadFields = useCallback(async () => {
        if (
            !tenantId ||
            !layoutId ||
            !section?.id
        ) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                `/tenants/${tenantId}/asset-layouts/${layoutId}/sections/${section.id}/fields`
            );

            setFields(
                response.data?.data?.fields ||
                    []
            );
        } catch (error) {
            console.error(
                "Failed to load section fields:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to load section fields."
            );
        } finally {
            setLoading(false);
        }
    }, [
        tenantId,
        layoutId,
        section?.id,
    ]);

    useEffect(() => {
        loadFields();
    }, [
        loadFields,
        refreshKey,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Archive Field
    |--------------------------------------------------------------------------
    */

    const handleArchive = async () => {
        if (
            !tenantId ||
            !layoutId ||
            !section?.id ||
            !archiveField?.id
        ) {
            return;
        }

        setArchiving(true);
        setError("");

        try {
            await api.delete(
                `/tenants/${tenantId}/asset-layouts/${layoutId}/sections/${section.id}/fields/${archiveField.id}`
            );

            setArchiveField(null);

            await loadFields();

            await onChanged();
        } catch (error) {
            console.error(
                "Failed to archive asset layout field:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to archive field."
            );
        } finally {
            setArchiving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-5 py-4 text-xs text-slate-500">
                <LoaderCircle
                    size={15}
                    className="animate-spin"
                />

                Loading fields...
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error && !fields.length) {
        return (
            <div className="flex items-center gap-2 px-5 py-4 text-xs text-red-600">
                <AlertCircle size={15} />

                {error}
            </div>
        );
    }

    return (
        <>
            {/* Error */}

            {error && (
                <div className="border-b border-red-100 bg-red-50 px-5 py-3">
                    <div className="flex items-center gap-2 text-xs text-red-600">
                        <AlertCircle
                            size={14}
                        />

                        {error}
                    </div>
                </div>
            )}

            {/* Empty */}

            {!fields.length ? (
                <div className="px-5 py-5">
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
                        <FileText
                            size={20}
                            className="mx-auto text-slate-400"
                        />

                        <p className="mt-2 text-xs font-semibold text-slate-600">
                            No fields in this section
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                            Use Add Field to start
                            building this section.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {fields.map((field) => (
                        <div
                            key={field.id}
                            className="
                                flex flex-col gap-4
                                px-5 py-4
                                transition
                                hover:bg-white
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                            "
                        >
                            {/* Field Info */}

                            <div className="flex min-w-0 items-start gap-3">
                                <div
                                    className="
                                        flex h-9 w-9
                                        shrink-0 items-center
                                        justify-center
                                        rounded-xl
                                    "
                                    style={{
                                        color:
                                            "var(--brand-primary)",

                                        backgroundColor:
                                            "color-mix(in srgb, var(--brand-primary) 8%, white)",
                                    }}
                                >
                                    <FileText
                                        size={16}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {field.label ||
                                                field.name}
                                        </p>

                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                            {formatFieldType(
                                                field.field_type
                                            )}
                                        </span>

                                        {field.is_required && (
                                            <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                                Required
                                            </span>
                                        )}

                                        {field.is_unique && (
                                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                                                Unique
                                            </span>
                                        )}

                                        {!field.is_visible && (
                                            <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                Hidden
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                                        {field.field_key}
                                    </p>

                                    {field.description && (
                                        <p className="mt-1 max-w-[600px] text-xs leading-5 text-slate-500">
                                            {
                                                field.description
                                            }
                                        </p>
                                    )}

                                    {field.option_list && (
                                        <p className="mt-1.5 text-[11px] text-violet-600">
                                            Option List:{" "}
                                            <span className="font-semibold">
                                                {
                                                    field.option_list
                                                        .name
                                                }
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right Side */}

                            <div className="flex shrink-0 flex-wrap items-center gap-2 pl-12 lg:pl-0">
                                {field.is_visible && (
                                    <div className="mr-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                        <CheckCircle2
                                            size={13}
                                        />

                                        Visible
                                    </div>
                                )}

                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                                    #
                                    {field.sort_order ??
                                        0}
                                </span>

                                {canManage && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingField(
                                                    field
                                                )
                                            }
                                            className="
                                                inline-flex h-8
                                                items-center gap-1.5
                                                rounded-lg border
                                                border-slate-200
                                                bg-white px-2.5
                                                text-[11px]
                                                font-semibold
                                                text-slate-600
                                                shadow-sm
                                                transition
                                                hover:border-slate-300
                                                hover:bg-slate-50
                                                hover:text-slate-900
                                            "
                                        >
                                            <FilePenLine
                                                size={
                                                    13
                                                }
                                            />

                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setArchiveField(
                                                    field
                                                )
                                            }
                                            className="
                                                inline-flex h-8
                                                items-center gap-1.5
                                                rounded-lg border
                                                border-red-200
                                                bg-white px-2.5
                                                text-[11px]
                                                font-semibold
                                                text-red-600
                                                shadow-sm
                                                transition
                                                hover:bg-red-50
                                            "
                                        >
                                            <Archive
                                                size={
                                                    13
                                                }
                                            />

                                            Archive
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}

            <EditFieldModal
                open={
                    Boolean(
                        editingField
                    )
                }
                tenantId={
                    tenantId
                }
                layoutId={
                    layoutId
                }
                section={
                    section
                }
                field={
                    editingField
                }
                onClose={() =>
                    setEditingField(
                        null
                    )
                }
                onUpdated={async () => {
                    setEditingField(
                        null
                    );

                    await loadFields();

                    await onChanged();
                }}
            />

            {/* Archive Confirmation */}

            {archiveField && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Close archive confirmation"
                        onClick={() => {
                            if (!archiving) {
                                setArchiveField(
                                    null
                                );
                            }
                        }}
                        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                    />

                    <div className="relative z-10 w-full max-w-[470px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                        {/* Red Accent */}

                        <div className="h-1 w-full bg-red-500" />

                        {/* Close */}

                        <button
                            type="button"
                            disabled={
                                archiving
                            }
                            onClick={() =>
                                setArchiveField(
                                    null
                                )
                            }
                            className="
                                absolute right-4
                                top-4 flex h-9
                                w-9 items-center
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

                        {/* Content */}

                        <div className="px-6 pb-6 pt-7">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <Archive
                                    size={21}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <h2 className="mt-4 text-lg font-semibold text-slate-950">
                                Archive Field
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Are you sure you want
                                to archive{" "}
                                <span className="font-semibold text-slate-700">
                                    {archiveField.label ||
                                        archiveField.name}
                                </span>
                                ?
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                The field will no
                                longer appear in the
                                active layout, but it
                                can be restored later.
                            </p>
                        </div>

                        {/* Footer */}

                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                            <button
                                type="button"
                                disabled={
                                    archiving
                                }
                                onClick={() =>
                                    setArchiveField(
                                        null
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
                                    disabled:opacity-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    archiving
                                }
                                onClick={
                                    handleArchive
                                }
                                className="
                                    inline-flex h-11
                                    min-w-[125px]
                                    items-center
                                    justify-center
                                    gap-2 rounded-xl
                                    bg-red-600 px-5
                                    text-sm font-semibold
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-red-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                {archiving ? (
                                    <>
                                        <LoaderCircle
                                            size={
                                                16
                                            }
                                            className="animate-spin"
                                        />

                                        Archiving...
                                    </>
                                ) : (
                                    <>
                                        <Archive
                                            size={
                                                16
                                            }
                                        />

                                        Archive
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Field Type Formatter
|--------------------------------------------------------------------------
*/

function formatFieldType(value) {
    if (!value) {
        return "Unknown";
    }

    return String(value)
        .replace(/_/g, " ")
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}

export default SectionFieldsList;