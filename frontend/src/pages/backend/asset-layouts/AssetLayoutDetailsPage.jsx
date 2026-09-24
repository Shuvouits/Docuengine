import {
    Archive,
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Eye,
    FilePenLine,
    FileText,
    GitBranch,
    History,
    Layers3,
    LoaderCircle,
    Plus,
    RefreshCw,
    ShieldCheck,
    Tag,
    XCircle,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../../../api/axios";

import ArchiveConfirmModal from "../../../component/admin/asset-layouts/ArchiveConfirmModal";
import CreateFieldModal from "../../../component/admin/asset-layouts/CreateFieldModal";
import CreateLayoutVersionModal from "../../../component/admin/asset-layouts/CreateLayoutVersionModal";
import CreateSectionModal from "../../../component/admin/asset-layouts/CreateSectionModal";
import EditAssetLayoutModal from "../../../component/admin/asset-layouts/EditAssetLayoutModal";
import EditSectionModal from "../../../component/admin/asset-layouts/EditSectionModal";
import LayoutBuilderPreviewModal from "../../../component/admin/asset-layouts/LayoutBuilderPreviewModal";
import SectionFieldsList from "../../../component/admin/asset-layouts/SectionFieldsList";
import VersionHistoryModal from "../../../component/admin/asset-layouts/VersionHistoryModal";

function AssetLayoutDetailsPage({
    authData = null,
    authLoading = false,
}) {
    const navigate = useNavigate();
    const { id } = useParams();

    /*
    |--------------------------------------------------------------------------
    | Tenant + Permissions
    |--------------------------------------------------------------------------
    */

    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const permissions =
        currentTenant?.access?.permissions || [];

    const canManage =
        permissions.includes(
            "asset_layouts.manage"
        );

    /*
    |--------------------------------------------------------------------------
    | Main Data
    |--------------------------------------------------------------------------
    */

    const [layout, setLayout] =
        useState(null);

    const [sections, setSections] =
        useState([]);

    const [versions, setVersions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | Refresh State
    |--------------------------------------------------------------------------
    */

    const [refreshing, setRefreshing] =
        useState(false);

    const [fieldRefreshKey, setFieldRefreshKey] =
        useState(0);

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    const [validating, setValidating] =
        useState(false);

    const [validationResult, setValidationResult] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | Section State
    |--------------------------------------------------------------------------
    */

    const [createSectionOpen, setCreateSectionOpen] =
        useState(false);

    const [editingSection, setEditingSection] =
        useState(null);

    const [archiveSection, setArchiveSection] =
        useState(null);

    const [archivingSection, setArchivingSection] =
        useState(false);

    const [expandedSections, setExpandedSections] =
        useState({});

    /*
    |--------------------------------------------------------------------------
    | Field State
    |--------------------------------------------------------------------------
    */

    const [selectedSection, setSelectedSection] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | Layout Actions
    |--------------------------------------------------------------------------
    */

    const [editLayoutOpen, setEditLayoutOpen] =
        useState(false);

    const [archiveLayoutOpen, setArchiveLayoutOpen] =
        useState(false);

    const [archivingLayout, setArchivingLayout] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Builder + Versions
    |--------------------------------------------------------------------------
    */

    const [builderPreviewOpen, setBuilderPreviewOpen] =
        useState(false);

    const [createVersionOpen, setCreateVersionOpen] =
        useState(false);

    const [versionHistoryOpen, setVersionHistoryOpen] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Load Data
    |--------------------------------------------------------------------------
    */

    const loadLayout = useCallback(
        async ({
            initial = false,
        } = {}) => {
            if (!tenantId || !id) {
                return;
            }

            if (initial) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            try {
                const [
                    layoutResponse,
                    sectionsResponse,
                    versionsResponse,
                ] = await Promise.all([
                    api.get(
                        `/tenants/${tenantId}/asset-layouts/${id}`
                    ),

                    api.get(
                        `/tenants/${tenantId}/asset-layouts/${id}/sections`
                    ),

                    api.get(
                        `/tenants/${tenantId}/asset-layouts/${id}/versions`
                    ),
                ]);

                setLayout(
                    layoutResponse.data?.data
                        ?.asset_layout || null
                );

                setSections(
                    sectionsResponse.data?.data
                        ?.sections || []
                );

                setVersions(
                    versionsResponse.data?.data
                        ?.versions || []
                );
            } catch (error) {
                console.error(
                    "Failed to load asset layout:",
                    error
                );

                if (
                    error.response?.status === 404
                ) {
                    setError(
                        "Asset layout not found."
                    );
                } else {
                    setError(
                        error.response?.data?.message ||
                            "Unable to load asset layout."
                    );
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [
            tenantId,
            id,
        ]
    );

    useEffect(() => {
        if (
            !authLoading &&
            tenantId &&
            id
        ) {
            loadLayout({
                initial: true,
            });
        }
    }, [
        authLoading,
        tenantId,
        id,
        loadLayout,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Shared Refresh
    |--------------------------------------------------------------------------
    */

    const refreshEverything = async ({
        refreshFields = false,
    } = {}) => {
        setValidationResult(null);

        if (refreshFields) {
            setFieldRefreshKey(
                (current) =>
                    current + 1
            );
        }

        await loadLayout();
    };

    /*
    |--------------------------------------------------------------------------
    | Section Expand
    |--------------------------------------------------------------------------
    */

    const toggleSection = (sectionId) => {
        setExpandedSections(
            (current) => ({
                ...current,
                [sectionId]:
                    !current[sectionId],
            })
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Add Field
    |--------------------------------------------------------------------------
    */

    const handleAddField = (
        event,
        section
    ) => {
        event.stopPropagation();

        setExpandedSections(
            (current) => ({
                ...current,
                [section.id]: true,
            })
        );

        setSelectedSection(section);
    };

    /*
    |--------------------------------------------------------------------------
    | Edit Section
    |--------------------------------------------------------------------------
    */

    const handleEditSection = (
        event,
        section
    ) => {
        event.stopPropagation();

        setEditingSection(section);
    };

    /*
    |--------------------------------------------------------------------------
    | Archive Section
    |--------------------------------------------------------------------------
    */

    const handleOpenArchiveSection = (
        event,
        section
    ) => {
        event.stopPropagation();

        setArchiveSection(section);
    };

    const handleArchiveSection = async () => {
        if (
            !tenantId ||
            !id ||
            !archiveSection?.id
        ) {
            return;
        }

        setArchivingSection(true);

        try {
            await api.delete(
                `/tenants/${tenantId}/asset-layouts/${id}/sections/${archiveSection.id}`
            );

            const archivedId =
                archiveSection.id;

            setArchiveSection(null);

            setExpandedSections(
                (current) => {
                    const next = {
                        ...current,
                    };

                    delete next[
                        archivedId
                    ];

                    return next;
                }
            );

            await refreshEverything({
                refreshFields: true,
            });
        } catch (error) {
            console.error(
                "Failed to archive section:",
                error
            );

            alert(
                error.response?.data?.message ||
                    "Unable to archive section."
            );
        } finally {
            setArchivingSection(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Archive Layout
    |--------------------------------------------------------------------------
    */

    const handleArchiveLayout = async () => {
        if (
            !tenantId ||
            !layout?.id
        ) {
            return;
        }

        setArchivingLayout(true);

        try {
            await api.delete(
                `/tenants/${tenantId}/asset-layouts/${layout.id}`
            );

            navigate(
                "/admin/asset-layouts",
                {
                    replace: true,
                }
            );
        } catch (error) {
            console.error(
                "Failed to archive asset layout:",
                error
            );

            alert(
                error.response?.data?.message ||
                    "Unable to archive asset layout."
            );
        } finally {
            setArchivingLayout(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Validate Layout
    |--------------------------------------------------------------------------
    */

    const handleValidate = async () => {
        if (!tenantId || !id) {
            return;
        }

        setValidating(true);
        setValidationResult(null);

        try {
            const response =
                await api.get(
                    `/tenants/${tenantId}/asset-layouts/${id}/validate`
                );

            setValidationResult(
                response.data?.data || {
                    valid: false,
                    errors: [],
                }
            );
        } catch (error) {
            console.error(
                "Failed to validate asset layout:",
                error
            );

            setValidationResult({
                valid: false,
                errors: [
                    error.response?.data?.message ||
                        "Layout validation failed.",
                ],
            });
        } finally {
            setValidating(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Initial Loading
    |--------------------------------------------------------------------------
    */

    if (
        authLoading ||
        loading
    ) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={30}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading asset layout...
                    </p>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error || !layout) {
        return (
            <div className="mx-auto max-w-[900px] rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
                <XCircle
                    size={30}
                    className="mx-auto text-red-500"
                />

                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    Unable to load layout
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    {error ||
                        "Asset layout could not be found."}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/admin/asset-layouts"
                        )
                    }
                    className="
                        mt-6 inline-flex h-10
                        items-center gap-2
                        rounded-xl border
                        border-slate-200
                        bg-white px-4
                        text-sm font-semibold
                        text-slate-700
                        transition
                        hover:bg-slate-50
                    "
                >
                    <ArrowLeft size={16} />

                    Back to layouts
                </button>
            </div>
        );
    }

    const latestVersion =
        versions?.[0] || null;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/asset-layouts"
                            )
                        }
                        className="
                            mb-4 inline-flex
                            items-center gap-2
                            text-sm font-medium
                            text-slate-500
                            transition
                            hover:text-slate-900
                        "
                    >
                        <ArrowLeft size={16} />

                        Asset Layouts
                    </button>

                    <div className="mb-2 flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{
                                backgroundColor:
                                    "var(--brand-primary)",
                            }}
                        />

                        <span
                            className="
                                text-[11px]
                                font-semibold
                                uppercase
                                tracking-[0.16em]
                            "
                            style={{
                                color:
                                    "var(--brand-primary)",
                            }}
                        >
                            Asset Layout
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[30px]">
                            {layout.name}
                        </h1>

                        {layout.is_template && (
                            <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-600">
                                Template
                            </span>
                        )}

                        <span
                            className={`
                                rounded-full px-3 py-1
                                text-[11px] font-semibold
                                capitalize
                                ${
                                    layout.status ===
                                    "published"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-amber-50 text-amber-700"
                                }
                            `}
                        >
                            {layout.status}
                        </span>
                    </div>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {layout.description ||
                            "No description provided for this layout."}
                    </p>
                </div>

                {/* Header Actions */}

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            loadLayout()
                        }
                        disabled={refreshing}
                        className="
                            inline-flex h-10
                            items-center gap-2
                            rounded-xl border
                            border-slate-200
                            bg-white px-3.5
                            text-xs font-semibold
                            text-slate-700
                            shadow-sm transition
                            hover:bg-slate-50
                            disabled:opacity-60
                        "
                    >
                        <RefreshCw
                            size={15}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setBuilderPreviewOpen(
                                true
                            )
                        }
                        className="
                            inline-flex h-10
                            items-center gap-2
                            rounded-xl border
                            border-slate-200
                            bg-white px-3.5
                            text-xs font-semibold
                            text-slate-700
                            shadow-sm transition
                            hover:bg-slate-50
                        "
                    >
                        <Eye size={15} />

                        Preview
                    </button>

                    {canManage && (
                        <button
                            type="button"
                            onClick={() =>
                                setEditLayoutOpen(
                                    true
                                )
                            }
                            className="
                                inline-flex h-10
                                items-center gap-2
                                rounded-xl border
                                border-slate-200
                                bg-white px-3.5
                                text-xs font-semibold
                                text-slate-700
                                shadow-sm transition
                                hover:bg-slate-50
                            "
                        >
                            <FilePenLine
                                size={15}
                            />

                            Edit
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={
                            handleValidate
                        }
                        disabled={validating}
                        className="
                            inline-flex h-10
                            items-center gap-2
                            rounded-xl px-3.5
                            text-xs font-semibold
                            text-white shadow-sm
                            transition
                            hover:opacity-90
                            disabled:opacity-60
                        "
                        style={{
                            backgroundColor:
                                "var(--brand-primary)",
                        }}
                    >
                        {validating ? (
                            <LoaderCircle
                                size={15}
                                className="animate-spin"
                            />
                        ) : (
                            <ShieldCheck
                                size={15}
                            />
                        )}

                        Validate
                    </button>

                    {canManage && (
                        <button
                            type="button"
                            onClick={() =>
                                setArchiveLayoutOpen(
                                    true
                                )
                            }
                            className="
                                inline-flex h-10
                                items-center gap-2
                                rounded-xl border
                                border-amber-200
                                bg-white px-3.5
                                text-xs font-semibold
                                text-amber-700
                                shadow-sm transition
                                hover:bg-amber-50
                            "
                        >
                            <Archive
                                size={15}
                            />

                            Archive
                        </button>
                    )}
                </div>
            </div>

            {/* Validation Result */}

            {validationResult && (
                <ValidationResult
                    result={
                        validationResult
                    }
                />
            )}

            {/* Summary */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    icon={Layers3}
                    label="Sections"
                    value={
                        layout.sections_count ??
                        sections.length
                    }
                    description="Active layout sections"
                />

                <SummaryCard
                    icon={FileText}
                    label="Fields"
                    value={
                        layout.fields_count ??
                        0
                    }
                    description="Configured custom fields"
                />

                <SummaryCard
                    icon={History}
                    label="Current Version"
                    value={`v${
                        layout.current_version ??
                        1
                    }`}
                    description={`${versions.length} saved versions`}
                />

                <SummaryCard
                    icon={Tag}
                    label="Layout Type"
                    value={
                        layout.is_template
                            ? "Template"
                            : "Custom"
                    }
                    description={
                        layout.is_template
                            ? "Reusable structure"
                            : "Organization layout"
                    }
                />
            </div>

            {/* Main Grid */}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* Sections */}

                <div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {/* Sections Header */}

                        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Sections
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Structure and field
                                    groups used by this
                                    layout.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    {
                                        sections.length
                                    }
                                </span>

                                {canManage && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCreateSectionOpen(
                                                true
                                            )
                                        }
                                        className="
                                            inline-flex h-9
                                            items-center gap-2
                                            rounded-xl px-3.5
                                            text-xs font-semibold
                                            text-white shadow-sm
                                            transition
                                            hover:opacity-90
                                        "
                                        style={{
                                            backgroundColor:
                                                "var(--brand-primary)",
                                        }}
                                    >
                                        <Plus
                                            size={15}
                                        />

                                        Add Section
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Empty */}

                        {!sections.length ? (
                            <div className="px-6 py-14 text-center">
                                <div
                                    className="
                                        mx-auto flex
                                        h-12 w-12
                                        items-center
                                        justify-center
                                        rounded-2xl
                                    "
                                    style={{
                                        color:
                                            "var(--brand-primary)",

                                        backgroundColor:
                                            "color-mix(in srgb, var(--brand-primary) 9%, white)",
                                    }}
                                >
                                    <Layers3
                                        size={21}
                                    />
                                </div>

                                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                    No sections yet
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                                    Sections organize
                                    related fields inside
                                    an asset layout.
                                </p>

                                {canManage && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCreateSectionOpen(
                                                true
                                            )
                                        }
                                        className="
                                            mt-5 inline-flex
                                            h-10 items-center
                                            gap-2 rounded-xl
                                            px-4 text-sm
                                            font-semibold
                                            text-white shadow-sm
                                        "
                                        style={{
                                            backgroundColor:
                                                "var(--brand-primary)",
                                        }}
                                    >
                                        <Plus
                                            size={16}
                                        />

                                        Add First Section
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {sections.map(
                                    (section) => (
                                        <SectionRow
                                            key={
                                                section.id
                                            }
                                            section={
                                                section
                                            }
                                            expanded={
                                                Boolean(
                                                    expandedSections[
                                                        section.id
                                                    ]
                                                )
                                            }
                                            canManage={
                                                canManage
                                            }
                                            tenantId={
                                                tenantId
                                            }
                                            layoutId={
                                                id
                                            }
                                            fieldRefreshKey={
                                                fieldRefreshKey
                                            }
                                            onToggle={() =>
                                                toggleSection(
                                                    section.id
                                                )
                                            }
                                            onEdit={(
                                                event
                                            ) =>
                                                handleEditSection(
                                                    event,
                                                    section
                                                )
                                            }
                                            onAddField={(
                                                event
                                            ) =>
                                                handleAddField(
                                                    event,
                                                    section
                                                )
                                            }
                                            onArchive={(
                                                event
                                            ) =>
                                                handleOpenArchiveSection(
                                                    event,
                                                    section
                                                )
                                            }
                                            onFieldChanged={async () => {
                                                await refreshEverything(
                                                    {
                                                        refreshFields: true,
                                                    }
                                                );
                                            }}
                                        />
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}

                <div className="space-y-6">
                    {/* Layout Information */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900">
                            Layout Information
                        </h2>

                        <div className="mt-5 space-y-4">
                            <InfoRow
                                label="Slug"
                                value={
                                    layout.slug
                                }
                            />

                            <InfoRow
                                label="Status"
                                value={
                                    layout.status
                                }
                                capitalize
                            />

                            <InfoRow
                                label="Version"
                                value={`v${
                                    layout.current_version ??
                                    1
                                }`}
                            />

                            <InfoRow
                                label="Template"
                                value={
                                    layout.is_template
                                        ? "Yes"
                                        : "No"
                                }
                            />

                            <InfoRow
                                label="Layout Active"
                                value={
                                    layout.is_active
                                        ? "Yes"
                                        : "No"
                                }
                            />
                        </div>
                    </div>

                    {/* Version Panel */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Version History
                                </h2>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Immutable schema
                                    snapshots
                                </p>
                            </div>

                            <History
                                size={17}
                                className="text-slate-400"
                            />
                        </div>

                        <div className="mt-4 space-y-3">
                            {versions
                                .slice(0, 3)
                                .map(
                                    (
                                        version
                                    ) => (
                                        <div
                                            key={
                                                version.id
                                            }
                                            className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs font-semibold text-slate-800">
                                                    Version{" "}
                                                    {
                                                        version.version_number
                                                    }
                                                </span>

                                                <span className="text-[10px] text-slate-400">
                                                    {formatDate(
                                                        version.created_at
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-slate-500">
                                                {version.change_summary ||
                                                    "No change summary."}
                                            </p>
                                        </div>
                                    )
                                )}

                            {!versions.length && (
                                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center">
                                    <p className="text-xs text-slate-500">
                                        No saved versions.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() =>
                                    setVersionHistoryOpen(
                                        true
                                    )
                                }
                                className="
                                    inline-flex h-9
                                    items-center justify-center
                                    gap-1.5 rounded-xl
                                    border border-slate-200
                                    bg-white px-3
                                    text-[11px] font-semibold
                                    text-slate-700
                                    transition
                                    hover:bg-slate-50
                                "
                            >
                                <History
                                    size={14}
                                />

                                View All
                            </button>

                            {canManage && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCreateVersionOpen(
                                            true
                                        )
                                    }
                                    className="
                                        inline-flex h-9
                                        items-center justify-center
                                        gap-1.5 rounded-xl
                                        px-3 text-[11px]
                                        font-semibold text-white
                                        transition
                                        hover:opacity-90
                                    "
                                    style={{
                                        backgroundColor:
                                            "var(--brand-primary)",
                                    }}
                                >
                                    <GitBranch
                                        size={14}
                                    />

                                    New Version
                                </button>
                            )}
                        </div>

                        {latestVersion && (
                            <p className="mt-3 text-center text-[10px] text-slate-400">
                                Latest saved: v
                                {
                                    latestVersion.version_number
                                }
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Section */}

            <CreateSectionModal
                open={
                    createSectionOpen
                }
                tenantId={
                    tenantId
                }
                layoutId={
                    id
                }
                onClose={() =>
                    setCreateSectionOpen(
                        false
                    )
                }
                onCreated={async () => {
                    setCreateSectionOpen(
                        false
                    );

                    await refreshEverything();
                }}
            />

            {/* Edit Section */}

            <EditSectionModal
                open={
                    Boolean(
                        editingSection
                    )
                }
                tenantId={
                    tenantId
                }
                layoutId={
                    id
                }
                section={
                    editingSection
                }
                onClose={() =>
                    setEditingSection(
                        null
                    )
                }
                onUpdated={async () => {
                    setEditingSection(
                        null
                    );

                    await refreshEverything();
                }}
            />

            {/* Archive Section */}

            <ArchiveConfirmModal
                open={
                    Boolean(
                        archiveSection
                    )
                }
                title="Archive Section"
                itemName={
                    archiveSection?.name ||
                    ""
                }
                description="The section and its active fields will no longer appear in the active layout. Archived data can be restored through the lifecycle tools."
                loading={
                    archivingSection
                }
                onClose={() =>
                    setArchiveSection(
                        null
                    )
                }
                onConfirm={
                    handleArchiveSection
                }
            />

            {/* Create Field */}

            <CreateFieldModal
                open={
                    Boolean(
                        selectedSection
                    )
                }
                tenantId={
                    tenantId
                }
                layoutId={
                    id
                }
                section={
                    selectedSection
                }
                onClose={() =>
                    setSelectedSection(
                        null
                    )
                }
                onCreated={async () => {
                    const sectionId =
                        selectedSection?.id;

                    setSelectedSection(
                        null
                    );

                    if (sectionId) {
                        setExpandedSections(
                            (current) => ({
                                ...current,
                                [sectionId]:
                                    true,
                            })
                        );
                    }

                    await refreshEverything(
                        {
                            refreshFields: true,
                        }
                    );
                }}
            />

            {/* Edit Layout */}

            <EditAssetLayoutModal
                open={
                    editLayoutOpen
                }
                tenantId={
                    tenantId
                }
                layout={
                    layout
                }
                onClose={() =>
                    setEditLayoutOpen(
                        false
                    )
                }
                onUpdated={async () => {
                    setEditLayoutOpen(
                        false
                    );

                    await refreshEverything();
                }}
            />

            {/* Archive Layout */}

            <ArchiveConfirmModal
                open={
                    archiveLayoutOpen
                }
                title="Archive Asset Layout"
                itemName={
                    layout.name
                }
                description="The layout will be removed from active asset layouts and moved into the archive lifecycle."
                loading={
                    archivingLayout
                }
                onClose={() =>
                    setArchiveLayoutOpen(
                        false
                    )
                }
                onConfirm={
                    handleArchiveLayout
                }
            />

            {/* Builder Preview */}

            <LayoutBuilderPreviewModal
                open={
                    builderPreviewOpen
                }
                tenantId={
                    tenantId
                }
                layoutId={
                    id
                }
                onClose={() =>
                    setBuilderPreviewOpen(
                        false
                    )
                }
            />

            {/* Create Version */}

            <CreateLayoutVersionModal
                open={
                    createVersionOpen
                }
                tenantId={
                    tenantId
                }
                layout={
                    layout
                }
                onClose={() =>
                    setCreateVersionOpen(
                        false
                    )
                }
                onCreated={async () => {
                    setCreateVersionOpen(
                        false
                    );

                    await refreshEverything();
                }}
            />

            {/* Version History */}

            <VersionHistoryModal
                open={
                    versionHistoryOpen
                }
                versions={
                    versions
                }
                onClose={() =>
                    setVersionHistoryOpen(
                        false
                    )
                }
            />
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Section Row
|--------------------------------------------------------------------------
*/

function SectionRow({
    section,
    expanded,
    canManage,
    tenantId,
    layoutId,
    fieldRefreshKey,
    onToggle,
    onEdit,
    onAddField,
    onArchive,
    onFieldChanged,
}) {
    return (
        <div>
            <div
                role="button"
                tabIndex={0}
                onClick={
                    onToggle
                }
                onKeyDown={(event) => {
                    if (
                        event.key ===
                            "Enter" ||
                        event.key === " "
                    ) {
                        event.preventDefault();
                        onToggle();
                    }
                }}
                className="
                    group flex cursor-pointer
                    items-center gap-4
                    px-6 py-5 transition
                    hover:bg-slate-50
                "
            >
                <div
                    className="
                        flex h-10 w-10
                        shrink-0 items-center
                        justify-center rounded-xl
                    "
                    style={{
                        color:
                            "var(--brand-primary)",

                        backgroundColor:
                            "color-mix(in srgb, var(--brand-primary) 9%, white)",
                    }}
                >
                    <Layers3
                        size={18}
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                            {
                                section.name
                            }
                        </p>

                        {!section.is_visible && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                Hidden
                            </span>
                        )}

                        {section.is_collapsible && (
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                                Collapsible
                            </span>
                        )}

                        {section.is_collapsed_by_default && (
                            <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
                                Default Collapsed
                            </span>
                        )}
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500">
                        {section.description ||
                            "No description"}
                    </p>
                </div>

                <div className="hidden min-w-[45px] text-right sm:block">
                    <p className="text-sm font-semibold text-slate-700">
                        {section.fields_count ??
                            0}
                    </p>

                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                        Fields
                    </p>
                </div>

                <div className="hidden min-w-[50px] text-right md:block">
                    <p className="text-sm font-semibold text-slate-700">
                        {section.columns ??
                            1}
                    </p>

                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                        Columns
                    </p>
                </div>

                {canManage && (
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={
                                onEdit
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
                                shadow-sm transition
                                hover:bg-slate-50
                            "
                        >
                            <FilePenLine
                                size={13}
                            />

                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={
                                onAddField
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
                                shadow-sm transition
                                hover:bg-slate-50
                            "
                        >
                            <Plus
                                size={13}
                            />

                            Add Field
                        </button>

                        <button
                            type="button"
                            onClick={
                                onArchive
                            }
                            className="
                                inline-flex h-8
                                items-center gap-1.5
                                rounded-lg border
                                border-amber-200
                                bg-white px-2.5
                                text-[11px]
                                font-semibold
                                text-amber-700
                                shadow-sm transition
                                hover:bg-amber-50
                            "
                        >
                            <Archive
                                size={13}
                            />

                            Archive
                        </button>
                    </div>
                )}

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400">
                    {expanded ? (
                        <ChevronDown
                            size={17}
                        />
                    ) : (
                        <ChevronRight
                            size={17}
                        />
                    )}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/40">
                    <div className="border-b border-slate-100 px-6 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Section Fields
                        </p>
                    </div>

                    <SectionFieldsList
                        tenantId={
                            tenantId
                        }
                        layoutId={
                            layoutId
                        }
                        section={
                            section
                        }
                        refreshKey={
                            fieldRefreshKey
                        }
                        canManage={
                            canManage
                        }
                        onChanged={
                            onFieldChanged
                        }
                    />
                </div>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Validation Result
|--------------------------------------------------------------------------
*/

function ValidationResult({
    result,
}) {
    const errors =
        Array.isArray(
            result?.errors
        )
            ? result.errors
            : [];

    return (
        <div
            className={`
                rounded-2xl border px-5 py-4
                ${
                    result.valid
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                }
            `}
        >
            <div className="flex items-start gap-3">
                {result.valid ? (
                    <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-600"
                    />
                ) : (
                    <XCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-600"
                    />
                )}

                <div>
                    <p
                        className={`
                            text-sm font-semibold
                            ${
                                result.valid
                                    ? "text-emerald-800"
                                    : "text-red-800"
                            }
                        `}
                    >
                        {result.valid
                            ? "Layout validation passed"
                            : "Layout validation failed"}
                    </p>

                    {errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {errors.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <p
                                        key={
                                            index
                                        }
                                        className="text-xs text-red-700"
                                    >
                                        {typeof item ===
                                        "string"
                                            ? item
                                            : item?.message ||
                                              JSON.stringify(
                                                  item
                                              )}
                                    </p>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Summary Card
|--------------------------------------------------------------------------
*/

function SummaryCard({
    icon: Icon,
    label,
    value,
    description,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                        {value}
                    </p>
                </div>

                <div
                    className="
                        flex h-10 w-10
                        shrink-0 items-center
                        justify-center rounded-xl
                    "
                    style={{
                        color:
                            "var(--brand-primary)",

                        backgroundColor:
                            "color-mix(in srgb, var(--brand-primary) 9%, white)",
                    }}
                >
                    <Icon
                        size={19}
                        strokeWidth={1.8}
                    />
                </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
                {description}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Information Row
|--------------------------------------------------------------------------
*/

function InfoRow({
    label,
    value,
    capitalize = false,
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <span className="text-xs text-slate-400">
                {label}
            </span>

            <span
                className={`
                    max-w-[190px]
                    break-all text-right
                    text-xs font-semibold
                    text-slate-700
                    ${
                        capitalize
                            ? "capitalize"
                            : ""
                    }
                `}
            >
                {value ?? "Not set"}
            </span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

function formatDate(value) {
    if (!value) {
        return "Unknown";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );
}

export default AssetLayoutDetailsPage;