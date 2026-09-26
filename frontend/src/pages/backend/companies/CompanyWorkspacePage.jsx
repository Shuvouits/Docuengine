import {
    AlertTriangle,
    ArrowLeft,
    Boxes,
    Building2,
    CalendarDays,
    ContactRound,
    FileText,
    Globe2,
    Hash,
    LayoutDashboard,
    LayoutTemplate,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../../../api/axios";

const tabs = [
    {
        key: "overview",
        label: "Overview",
        icon: LayoutDashboard,
    },
    {
        key: "information",
        label: "Company Information",
        icon: Building2,
    },
    {
        key: "contacts",
        label: "Contacts",
        icon: ContactRound,
    },
    {
        key: "locations",
        label: "Locations",
        icon: MapPin,
    },
    {
        key: "documentation",
        label: "Documentation Summary",
        icon: FileText,
    },
    {
        key: "asset-layouts",
        label: "Asset Layout Summary",
        icon: LayoutTemplate,
    },
    {
        key: "future-assets",
        label: "Future Assets Summary",
        icon: Boxes,
    },
];

const CompanyWorkspacePage = ({
    authData = null,
    authLoading = false,
}) => {
    const navigate = useNavigate();

    const { companyId } =
        useParams();

    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const [company, setCompany] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [activeTab, setActiveTab] =
        useState("overview");


    useEffect(() => {
        const loadWorkspace = async () => {
            if (
                authLoading ||
                !tenantId ||
                !companyId
            ) {
                return;
            }

            setLoading(true);
            setError("");

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/companies/${companyId}/workspace`
                    );

                const workspace =
                    response.data?.data || null;

                if (!workspace?.company) {
                    throw new Error(
                        "Invalid company workspace response."
                    );
                }

                const companyData =
                    workspace.company;

                const contact =
                    workspace.contact || {};

                const location =
                    workspace.location || {};

                const lifecycle =
                    workspace.lifecycle || {};

                const resources =
                    workspace.resources || {};

                /*
                |--------------------------------------------------------------------------
                | Normalize Workspace Response
                |--------------------------------------------------------------------------
                |
                | Keep the current UI structure unchanged while using the dedicated
                | Company Workspace API.
                |
                */

                setCompany({
                    ...companyData,

                    contact: {
                        name:
                            contact.name ||
                            null,

                        email:
                            contact.email ||
                            null,

                        phone:
                            contact.phone ||
                            null,
                    },

                    address: {
                        line1:
                            location.address_line1 ||
                            null,

                        line2:
                            location.address_line2 ||
                            null,

                        city:
                            location.city ||
                            null,

                        state_region:
                            location.state_region ||
                            null,

                        postal_code:
                            location.postal_code ||
                            null,

                        country:
                            location.country ||
                            null,
                    },

                    created_at:
                        lifecycle.created_at ||
                        null,

                    updated_at:
                        lifecycle.updated_at ||
                        null,

                    archived_at:
                        lifecycle.archived_at ||
                        null,

                    created_by:
                        lifecycle.created_by ||
                        null,

                    updated_by:
                        lifecycle.updated_by ||
                        null,

                    archived_by:
                        lifecycle.archived_by ||
                        null,

                    asset_layout_activations_count:
                        resources
                            ?.asset_layouts
                            ?.count ?? null,
                });
            } catch (error) {
                console.error(
                    "Unable to load company workspace:",
                    error
                );

                setError(
                    error.response?.data
                        ?.message ||
                    error.message ||
                    "Unable to load company workspace."
                );

                setCompany(null);
            } finally {
                setLoading(false);
            }
        };

        loadWorkspace();
    }, [
        authLoading,
        tenantId,
        companyId,
    ]);

    const fullLocation =
        useMemo(() => {
            if (!company) {
                return "";
            }

            return [
                company.address?.city,
                company.address
                    ?.state_region,
                company.address?.country,
            ]
                .filter(Boolean)
                .join(", ");
        }, [company]);

    const fullAddress =
        useMemo(() => {
            if (!company) {
                return [];
            }

            return [
                company.address?.line1,
                company.address?.line2,
                [
                    company.address?.city,
                    company.address
                        ?.state_region,
                    company.address
                        ?.postal_code,
                ]
                    .filter(Boolean)
                    .join(", "),
                company.address?.country,
            ].filter(Boolean);
        }, [company]);

    const profileCompletion =
        useMemo(() => {
            if (!company) {
                return 0;
            }

            const fields = [
                company.name,
                company.legal_name,
                company.website,
                company.contact?.name,
                company.contact?.email,
                company.contact?.phone,
                company.address?.line1,
                company.address?.city,
                company.address
                    ?.state_region,
                company.address?.country,
                company.description,
            ];

            const completed =
                fields.filter(
                    (value) =>
                        String(
                            value || ""
                        ).trim() !== ""
                ).length;

            return Math.round(
                (completed /
                    fields.length) *
                100
            );
        }, [company]);

    if (
        authLoading ||
        loading
    ) {
        return (
            <div className="flex min-h-[520px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={32}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading company workspace...
                    </p>
                </div>
            </div>
        );
    }

    if (
        error ||
        !company
    ) {
        return (
            <div className="mx-auto max-w-[900px] px-6 py-10">
                <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
                    <AlertTriangle
                        size={34}
                        className="mx-auto text-red-500"
                    />

                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                        Unable to load company
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {error ||
                            "Company could not be found."}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/companies"
                            )
                        }
                        className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        <ArrowLeft size={16} />

                        Back to Companies
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-slate-50">
            <div className="mx-auto w-full max-w-[1600px] px-6 py-6">
                {/* Back */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/admin/companies"
                        )
                    }
                    className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                    <ArrowLeft size={17} />

                    Back to Companies
                </button>

                {/* Header */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#159edb]">
                                <Building2
                                    size={22}
                                />
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#159edb]">
                                    Company Workspace
                                </p>

                                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                                    {company.name}
                                </h1>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                    {company.legal_name && (
                                        <span>
                                            {
                                                company.legal_name
                                            }
                                        </span>
                                    )}

                                    {company.legal_name &&
                                        fullLocation && (
                                            <span>
                                                •
                                            </span>
                                        )}

                                    {fullLocation && (
                                        <span>
                                            {
                                                fullLocation
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span
                                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${company.status ===
                                    "active"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-slate-100 text-slate-600"
                                    }`}
                            >
                                {company.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Workspace */}

                <div className="mt-6 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
                    {/* Navigation */}

                    <div className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="px-3 pb-3 pt-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                Workspace
                            </p>
                        </div>

                        <div className="space-y-1">
                            {tabs.map(
                                (tab) => {
                                    const Icon =
                                        tab.icon;

                                    const active =
                                        activeTab ===
                                        tab.key;

                                    return (
                                        <button
                                            key={
                                                tab.key
                                            }
                                            type="button"
                                            onClick={() =>
                                                setActiveTab(
                                                    tab.key
                                                )
                                            }
                                            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${active
                                                ? "bg-[#19b5fe]/10 text-[#159edb]"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                                }`}
                                        >
                                            <Icon
                                                size={
                                                    18
                                                }
                                                strokeWidth={
                                                    1.8
                                                }
                                            />

                                            <span>
                                                {
                                                    tab.label
                                                }
                                            </span>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {/* Content */}

                    <div className="min-w-0">
                        {activeTab ===
                            "overview" && (
                                <OverviewSection
                                    company={
                                        company
                                    }
                                    fullLocation={
                                        fullLocation
                                    }
                                    profileCompletion={
                                        profileCompletion
                                    }
                                    onNavigate={
                                        setActiveTab
                                    }
                                />
                            )}

                        {activeTab ===
                            "information" && (
                                <CompanyInformationSection
                                    company={
                                        company
                                    }
                                />
                            )}

                        {activeTab ===
                            "contacts" && (
                                <ContactsSection
                                    company={
                                        company
                                    }
                                />
                            )}

                        {activeTab ===
                            "locations" && (
                                <LocationsSection
                                    company={
                                        company
                                    }
                                    fullAddress={
                                        fullAddress
                                    }
                                />
                            )}

                        {activeTab ===
                            "documentation" && (
                                <DocumentationSummarySection />
                            )}

                        {activeTab ===
                            "asset-layouts" && (

                                <AssetLayoutSummarySection
                                    company={company}
                                    tenantId={tenantId}
                                    companyId={companyId}
                                />


                            )}

                        {activeTab ===
                            "future-assets" && (
                                <FutureAssetsSummarySection />
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Overview
|--------------------------------------------------------------------------
*/

const OverviewSection = ({
    company,
    fullLocation,
    profileCompletion,
    onNavigate,
}) => {
    return (
        <div className="space-y-6">
            <SectionHeader
                title="Overview"
                description="A quick snapshot of the company profile, contact details, location and documentation readiness."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Profile Completion"
                    value={`${profileCompletion}%`}
                    icon={Building2}
                />

                <StatCard
                    label="Primary Contact"
                    value={
                        company.contact
                            ?.name ||
                        "Not added"
                    }
                    icon={ContactRound}
                />

                <StatCard
                    label="Location"
                    value={
                        fullLocation ||
                        "Not specified"
                    }
                    icon={MapPin}
                />

                <StatCard
                    label="Status"
                    value={
                        company.status ||
                        "Unknown"
                    }
                    icon={LayoutDashboard}
                    capitalize
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <OverviewCard
                    title="Company Information"
                    description="Core company profile and business details."
                    icon={Building2}
                    onClick={() =>
                        onNavigate(
                            "information"
                        )
                    }
                >
                    <DetailRow
                        label="Company Name"
                        value={company.name}
                    />

                    <DetailRow
                        label="Legal Name"
                        value={
                            company.legal_name
                        }
                    />

                    <DetailRow
                        label="Website"
                        value={
                            company.website
                        }
                    />
                </OverviewCard>

                <OverviewCard
                    title="Primary Contact"
                    description="Main contact information for this company."
                    icon={ContactRound}
                    onClick={() =>
                        onNavigate(
                            "contacts"
                        )
                    }
                >
                    <DetailRow
                        label="Name"
                        value={
                            company.contact
                                ?.name
                        }
                    />

                    <DetailRow
                        label="Email"
                        value={
                            company.contact
                                ?.email
                        }
                    />

                    <DetailRow
                        label="Phone"
                        value={
                            company.contact
                                ?.phone
                        }
                    />
                </OverviewCard>

                <OverviewCard
                    title="Documentation"
                    description="Company documentation and knowledge summary."
                    icon={FileText}
                    onClick={() =>
                        onNavigate(
                            "documentation"
                        )
                    }
                >
                    <EmptyInlineState text="Documentation summary API will be connected when the documentation module is available." />
                </OverviewCard>



                <OverviewCard
                    title="Asset Layouts"
                    description="Layouts currently associated with this company."
                    icon={LayoutTemplate}
                    onClick={() =>
                        onNavigate(
                            "asset-layouts"
                        )
                    }
                >
                    <DetailRow
                        label="Assigned Layouts"
                        value={
                            company
                                ?.asset_layout_activations_count ??
                            0
                        }
                    />

                    <DetailRow
                        label="Configuration"
                        value={
                            (
                                company
                                    ?.asset_layout_activations_count ??
                                0
                            ) > 0
                                ? "Configured"
                                : "Not Assigned"
                        }
                    />
                </OverviewCard>




            </div>
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Company Information
|--------------------------------------------------------------------------
*/

const CompanyInformationSection = ({
    company,
}) => {
    return (
        <div className="space-y-6">
            <SectionHeader
                title="Company Information"
                description="Business identity, workspace details and internal company information."
            />

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid gap-0 md:grid-cols-2">
                    <InformationCell
                        icon={Building2}
                        label="Company Name"
                        value={company.name}
                    />

                    <InformationCell
                        icon={Building2}
                        label="Legal Name"
                        value={
                            company.legal_name
                        }
                    />

                    <InformationCell
                        icon={Hash}
                        label="Slug"
                        value={company.slug}
                    />

                    <InformationCell
                        icon={Globe2}
                        label="Website"
                        value={
                            company.website
                        }
                    />

                    <InformationCell
                        icon={LayoutDashboard}
                        label="Status"
                        value={
                            company.status
                        }
                        capitalize
                    />

                    <InformationCell
                        icon={CalendarDays}
                        label="Created"
                        value={formatDate(
                            company.created_at
                        )}
                    />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <TextCard
                    title="Description"
                    text={
                        company.description
                    }
                    emptyText="No company description has been added."
                />

                <TextCard
                    title="Internal Notes"
                    text={company.notes}
                    emptyText="No internal notes have been added."
                />
            </div>
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Contacts
|--------------------------------------------------------------------------
*/

const ContactsSection = ({
    company,
}) => {
    const hasContact =
        company.contact?.name ||
        company.contact?.email ||
        company.contact?.phone;

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Contacts"
                description="Primary people and communication details associated with this company."
            />

            {hasContact ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#159edb]">
                            <ContactRound
                                size={21}
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Primary
                                        Contact
                                    </p>

                                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                                        {company
                                            .contact
                                            ?.name ||
                                            "Unnamed Contact"}
                                    </h3>
                                </div>

                                <span className="rounded-full border border-[#19b5fe]/20 bg-[#19b5fe]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#159edb]">
                                    Primary
                                </span>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <ContactItem
                                    icon={
                                        Mail
                                    }
                                    label="Email"
                                    value={
                                        company
                                            .contact
                                            ?.email
                                    }
                                />

                                <ContactItem
                                    icon={
                                        Phone
                                    }
                                    label="Phone"
                                    value={
                                        company
                                            .contact
                                            ?.phone
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <LargeEmptyState
                    icon={ContactRound}
                    title="No contact information"
                    text="Primary contact information has not been added to this company yet."
                />
            )}
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Locations
|--------------------------------------------------------------------------
*/

const LocationsSection = ({
    company,
    fullAddress,
}) => {
    const hasLocation =
        fullAddress.length > 0;

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Locations"
                description="Physical address and location information for this company."
            />

            {hasLocation ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#159edb]">
                            <MapPin
                                size={21}
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                                Primary
                                Location
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                                {company.name}
                            </h3>

                            <div className="mt-4 space-y-1 text-sm leading-6 text-slate-600">
                                {fullAddress.map(
                                    (
                                        line,
                                        index
                                    ) => (
                                        <p
                                            key={
                                                index
                                            }
                                        >
                                            {
                                                line
                                            }
                                        </p>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
                        <SmallInfo
                            label="City"
                            value={
                                company.address
                                    ?.city
                            }
                        />

                        <SmallInfo
                            label="State / Region"
                            value={
                                company.address
                                    ?.state_region
                            }
                        />

                        <SmallInfo
                            label="Country"
                            value={
                                company.address
                                    ?.country
                            }
                        />
                    </div>
                </div>
            ) : (
                <LargeEmptyState
                    icon={MapPin}
                    title="No location information"
                    text="A primary business location has not been added to this company yet."
                />
            )}
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Documentation Summary
|--------------------------------------------------------------------------
*/

const DocumentationSummarySection = () => {
    return (
        <div className="space-y-6">
            <SectionHeader
                title="Documentation Summary"
                description="Company-specific documentation, knowledge and documentation health will appear here."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryPlaceholder
                    icon={FileText}
                    title="Documentation"
                    description="Company documentation totals and recent documents will be connected here."
                />

                <SummaryPlaceholder
                    icon={FileText}
                    title="Knowledge"
                    description="Knowledge base coverage and related documentation will appear here."
                />

                <SummaryPlaceholder
                    icon={CalendarDays}
                    title="Recent Activity"
                    description="Recent documentation changes will appear when the documentation module is connected."
                />
            </div>

            <ModuleNotice
                title="Documentation module connection pending"
                text="This workspace section is ready. It will be connected to the company documentation APIs when that module is implemented."
            />
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Asset Layout Summary
|--------------------------------------------------------------------------
*/

const AssetLayoutSummarySection = ({
    company,
    tenantId,
    companyId,
}) => {
    const [activations, setActivations] =
        useState([]);

    const [loadingLayouts, setLoadingLayouts] =
        useState(true);

    const [layoutError, setLayoutError] =
        useState("");

    useEffect(() => {
        const loadActivations = async () => {
            if (
                !tenantId ||
                !companyId
            ) {
                return;
            }

            setLoadingLayouts(true);
            setLayoutError("");

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/companies/${companyId}/asset-layout-activations`
                    );

                setActivations(
                    response.data?.data
                        ?.activations || []
                );
            } catch (error) {
                console.error(
                    "Unable to load company asset layout activations:",
                    error
                );

                setLayoutError(
                    error.response?.data
                        ?.message ||
                    "Unable to load assigned layouts."
                );

                setActivations([]);
            } finally {
                setLoadingLayouts(false);
            }
        };

        loadActivations();
    }, [
        tenantId,
        companyId,
    ]);

    const activationCount =
        company
            ?.asset_layout_activations_count ??
        activations.length;

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Asset Layout Summary"
                description="Review asset layouts currently assigned to this company."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    label="Assigned Layouts"
                    value={activationCount}
                    icon={LayoutTemplate}
                />

                <StatCard
                    label="Layout Status"
                    value={
                        activationCount > 0
                            ? "Configured"
                            : "Not Assigned"
                    }
                    icon={LayoutDashboard}
                />

                <StatCard
                    label="Asset Module"
                    value="Module 6"
                    icon={Boxes}
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Assigned Asset Layouts
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Layouts currently activated for this company.
                        </p>
                    </div>

                    {!loadingLayouts && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                            {activations.length}{" "}
                            {activations.length === 1
                                ? "Layout"
                                : "Layouts"}
                        </span>
                    )}
                </div>

                {loadingLayouts && (
                    <div className="flex min-h-[180px] items-center justify-center">
                        <div className="text-center">
                            <LoaderCircle
                                size={24}
                                className="mx-auto animate-spin text-slate-400"
                            />

                            <p className="mt-3 text-xs text-slate-500">
                                Loading assigned layouts...
                            </p>
                        </div>
                    </div>
                )}

                {!loadingLayouts &&
                    layoutError && (
                        <div className="px-6 py-10 text-center">
                            <AlertTriangle
                                size={26}
                                className="mx-auto text-red-500"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-800">
                                Unable to load layouts
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {layoutError}
                            </p>
                        </div>
                    )}

                {!loadingLayouts &&
                    !layoutError &&
                    activations.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                                <LayoutTemplate
                                    size={21}
                                />
                            </div>

                            <h3 className="mt-4 text-sm font-bold text-slate-800">
                                No layouts assigned
                            </h3>

                            <p className="mt-2 text-xs text-slate-500">
                                This company does not currently have an active asset layout assignment.
                            </p>
                        </div>
                    )}

                {!loadingLayouts &&
                    !layoutError &&
                    activations.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Layout
                                        </th>

                                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Version
                                        </th>

                                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Layout Status
                                        </th>

                                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Assignment
                                        </th>

                                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Activated
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {activations.map(
                                        (
                                            activation
                                        ) => {
                                            const layout =
                                                activation.layout ||
                                                {};

                                            return (
                                                <tr
                                                    key={
                                                        activation.id
                                                    }
                                                    className="border-b border-slate-100 last:border-0"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#19b5fe]/10 text-[#159edb]">
                                                                <LayoutTemplate
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-slate-800">
                                                                    {layout.name ||
                                                                        "Unnamed Layout"}
                                                                </p>

                                                                <p className="mt-1 max-w-[420px] truncate text-xs text-slate-500">
                                                                    {layout.description ||
                                                                        "No description available."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-semibold text-slate-700">
                                                            v
                                                            {layout.current_version ??
                                                                1}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold capitalize text-amber-700">
                                                            {layout.status ||
                                                                "Unknown"}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${activation.is_active
                                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                    : "border-slate-200 bg-slate-50 text-slate-500"
                                                                }`}
                                                        >
                                                            {activation.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-medium text-slate-600">
                                                            {formatDate(
                                                                activation.activated_at
                                                            )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
            </div>
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Future Assets Summary
|--------------------------------------------------------------------------
*/

const FutureAssetsSummarySection =
    () => {
        return (
            <div className="space-y-6">
                <SectionHeader
                    title="Future Assets Summary"
                    description="This area is reserved for the company asset inventory that will be introduced in Module 6."
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <SummaryPlaceholder
                        icon={Boxes}
                        title="Assets"
                        description="Asset inventory totals will appear here after the Asset Management module is implemented."
                    />

                    <SummaryPlaceholder
                        icon={
                            LayoutTemplate
                        }
                        title="Asset Types"
                        description="Workstations, servers, network devices and other configured asset types will appear here."
                    />

                    <SummaryPlaceholder
                        icon={
                            LayoutDashboard
                        }
                        title="Asset Health"
                        description="Asset status and operational summaries can be surfaced here in the future."
                    />
                </div>

                <ModuleNotice
                    title="Reserved for Module 6"
                    text="No asset totals are being fabricated. This section is prepared for real company asset data when Asset Management is built."
                />
            </div>
        );
    };

/*
|--------------------------------------------------------------------------
| Shared Components
|--------------------------------------------------------------------------
*/

const SectionHeader = ({
    title,
    description,
}) => {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-900">
                {title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
            </p>
        </div>
    );
};

const StatCard = ({
    label,
    value,
    icon: Icon,
    capitalize = false,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        {label}
                    </p>

                    <p
                        className={`mt-3 truncate text-lg font-bold text-slate-900 ${capitalize
                            ? "capitalize"
                            : ""
                            }`}
                    >
                        {value}
                    </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                    <Icon size={18} />
                </div>
            </div>
        </div>
    );
};

const OverviewCard = ({
    title,
    description,
    icon: Icon,
    onClick,
    children,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#159edb]">
                        <Icon size={18} />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            {title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClick}
                    className="text-xs font-bold text-[#159edb] transition hover:text-[#118bc0]"
                >
                    View
                </button>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
                {children}
            </div>
        </div>
    );
};

const DetailRow = ({
    label,
    value,
}) => {
    return (
        <div className="flex items-start justify-between gap-5 border-b border-slate-50 py-2.5 last:border-0">
            <span className="text-xs text-slate-400">
                {label}
            </span>

            <span className="max-w-[65%] text-right text-xs font-semibold text-slate-700">
                {value || "Not added"}
            </span>
        </div>
    );
};

const InformationCell = ({
    icon: Icon,
    label,
    value,
    capitalize = false,
}) => {
    return (
        <div className="border-b border-slate-100 p-6 md:border-r md:odd:border-r">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                    <Icon size={16} />
                </div>

                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {label}
                    </p>

                    <p
                        className={`mt-1.5 break-words text-sm font-semibold text-slate-800 ${capitalize
                            ? "capitalize"
                            : ""
                            }`}
                    >
                        {value ||
                            "Not added"}
                    </p>
                </div>
            </div>
        </div>
    );
};

const TextCard = ({
    title,
    text,
    emptyText,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">
                {title}
            </h3>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {text || emptyText}
            </p>
        </div>
    );
};

const ContactItem = ({
    icon: Icon,
    label,
    value,
}) => {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
                <Icon
                    size={17}
                    className="text-slate-400"
                />

                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {label}
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                        {value ||
                            "Not added"}
                    </p>
                </div>
            </div>
        </div>
    );
};

const SmallInfo = ({
    label,
    value,
}) => {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
            </p>

            <p className="mt-1.5 text-sm font-semibold text-slate-700">
                {value || "Not added"}
            </p>
        </div>
    );
};

const LargeEmptyState = ({
    icon: Icon,
    title,
    text,
}) => {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <Icon size={21} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
                {title}
            </h3>

            <p className="mx-auto mt-2 max-w-[480px] text-sm leading-6 text-slate-500">
                {text}
            </p>
        </div>
    );
};

const EmptyInlineState = ({
    text,
}) => {
    return (
        <p className="text-xs leading-6 text-slate-500">
            {text}
        </p>
    );
};

const SummaryPlaceholder = ({
    icon: Icon,
    title,
    description,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <Icon size={18} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
                {title}
            </h3>

            <p className="mt-2 text-xs leading-6 text-slate-500">
                {description}
            </p>

            <div className="mt-5">
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Pending Connection
                </span>
            </div>
        </div>
    );
};

const ModuleNotice = ({
    title,
    text,
}) => {
    return (
        <div className="rounded-2xl border border-[#19b5fe]/20 bg-[#19b5fe]/5 p-5">
            <div className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#159edb]">
                    <LayoutTemplate
                        size={17}
                    />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-800">
                        {title}
                    </h3>

                    <p className="mt-1 text-xs leading-6 text-slate-500">
                        {text}
                    </p>
                </div>
            </div>
        </div>
    );
};

const formatDate = (value) => {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Not available";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    ).format(date);
};

export default CompanyWorkspacePage;