import {
    Building2,
    LoaderCircle,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import api from "../../../api/axios";

import CompanyLayoutsHeader from "../../../component/admin/company-layouts/CompanyLayoutsHeader";
import CompanyLayoutsSummary from "../../../component/admin/company-layouts/CompanyLayoutsSummary";
import CompanySelectorPanel from "../../../component/admin/company-layouts/CompanySelectorPanel";
import CompanyLayoutAssignmentsPanel from "../../../component/admin/company-layouts/CompanyLayoutAssignmentsPanel";
import CompanyLayoutActionModal from "../../../component/admin/company-layouts/CompanyLayoutActionModal";
import CompanyLayoutsAlert from "../../../component/admin/company-layouts/CompanyLayoutsAlert";

/*
|--------------------------------------------------------------------------
| Current Module 5 Company Foundation
|--------------------------------------------------------------------------
|
| Module 5 backend already has company-specific layout activation.
| Acme is the verified Second MSP company used during backend testing.
|
*/

const VERIFIED_COMPANIES = [
    {
        id: "01a0bb20-4a1d-7b2e-8c3f-91d2e4f5a601",
        tenant_id:
            "01a072e3-4c45-7374-bf56-e19db4a9057f",
        name: "Acme",
        status: "active",
        is_active: true,
    },
];

function CompanyLayoutsPage({
    authData = null,
    authLoading = false,
}) {
    /*
    |--------------------------------------------------------------------------
    | Tenant
    |--------------------------------------------------------------------------
    */

    const currentTenant =
        authData?.current_tenant || null;

    const tenantId =
        currentTenant?.id || null;

    const permissions =
        currentTenant?.access?.permissions || [];

    const canView =
        permissions.includes(
            "asset_layouts.view"
        );

    const canActivate =
        permissions.includes(
            "asset_layouts.activate"
        );

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [layouts, setLayouts] =
        useState([]);

    const [activationMap, setActivationMap] =
        useState({});

    const [selectedCompany, setSelectedCompany] =
        useState(null);

    const [companySearch, setCompanySearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [pendingAction, setPendingAction] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | Companies
    |--------------------------------------------------------------------------
    |
    | If companies later become available directly inside authData/currentTenant,
    | this page will use them automatically.
    |
    | Otherwise it uses the verified Module 5 company foundation data.
    |
    */

    const companies = useMemo(() => {
        const tenantCompanies =
            currentTenant?.companies ||
            authData?.companies ||
            [];

        if (
            Array.isArray(
                tenantCompanies
            ) &&
            tenantCompanies.length
        ) {
            return tenantCompanies;
        }

        return VERIFIED_COMPANIES.filter(
            (company) =>
                company.tenant_id ===
                tenantId
        );
    }, [
        currentTenant,
        authData,
        tenantId,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Filter Companies
    |--------------------------------------------------------------------------
    */

    const filteredCompanies =
        useMemo(() => {
            const keyword =
                companySearch
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return companies;
            }

            return companies.filter(
                (company) =>
                    company.name
                        ?.toLowerCase()
                        .includes(
                            keyword
                        )
            );
        }, [
            companies,
            companySearch,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const clearMessages =
        useCallback(() => {
            setError("");
            setMessage("");
        }, []);

    const extractLayouts = (
        response
    ) => {
        return (
            response.data?.data
                ?.asset_layouts ||
            response.data?.data
                ?.layouts ||
            response.data?.data ||
            []
        );
    };

    const extractActivations = (
        response
    ) => {
        const data =
            response.data?.data;

        if (Array.isArray(data)) {
            return data;
        }

        return (
            data?.asset_layout_activations ||
            data?.activations ||
            data?.items ||
            []
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Load Asset Layouts
    |--------------------------------------------------------------------------
    */

    const loadLayouts =
        useCallback(async () => {
            if (!tenantId) {
                setLayouts([]);
                return;
            }

            const response =
                await api.get(
                    `/tenants/${tenantId}/asset-layouts`
                );

            const result =
                extractLayouts(
                    response
                );

            setLayouts(
                Array.isArray(result)
                    ? result
                    : []
            );
        }, [tenantId]);

    /*
    |--------------------------------------------------------------------------
    | Load Company Activations
    |--------------------------------------------------------------------------
    */

    const loadCompanyActivations =
        useCallback(
            async (
                companyId,
                updateState = true
            ) => {
                if (
                    !tenantId ||
                    !companyId
                ) {
                    return [];
                }

                const response =
                    await api.get(
                        `/tenants/${tenantId}/companies/${companyId}/asset-layout-activations`
                    );

                const result =
                    extractActivations(
                        response
                    );

                const activations =
                    Array.isArray(result)
                        ? result
                        : [];

                if (updateState) {
                    setActivationMap(
                        (current) => ({
                            ...current,
                            [companyId]:
                                activations,
                        })
                    );
                }

                return activations;
            },
            [tenantId]
        );

    /*
    |--------------------------------------------------------------------------
    | Load All Company Activations
    |--------------------------------------------------------------------------
    */

    const loadAllActivations =
        useCallback(async () => {
            if (
                !tenantId ||
                !companies.length
            ) {
                setActivationMap({});
                return;
            }

            const entries =
                await Promise.all(
                    companies.map(
                        async (
                            company
                        ) => {
                            try {
                                const activations =
                                    await loadCompanyActivations(
                                        company.id,
                                        false
                                    );

                                return [
                                    company.id,
                                    activations,
                                ];
                            } catch (
                                error
                            ) {
                                console.error(
                                    `Unable to load activations for ${company.name}:`,
                                    error
                                );

                                return [
                                    company.id,
                                    [],
                                ];
                            }
                        }
                    )
                );

            setActivationMap(
                Object.fromEntries(
                    entries
                )
            );
        }, [
            tenantId,
            companies,
            loadCompanyActivations,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Initial Load
    |--------------------------------------------------------------------------
    */

    const loadPage =
        useCallback(
            async (
                showLoader = true
            ) => {
                if (!tenantId) {
                    setLoading(false);
                    return;
                }

                if (showLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                clearMessages();

                try {
                    await Promise.all([
                        loadLayouts(),
                        loadAllActivations(),
                    ]);
                } catch (error) {
                    console.error(
                        "Unable to load company layouts:",
                        error
                    );

                    setError(
                        getApiError(
                            error,
                            "Unable to load Company Layouts."
                        )
                    );
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            },
            [
                tenantId,
                loadLayouts,
                loadAllActivations,
                clearMessages,
            ]
        );

    useEffect(() => {
        if (
            authLoading ||
            !tenantId
        ) {
            return;
        }

        loadPage();
    }, [
        authLoading,
        tenantId,
        loadPage,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Auto Select Company
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            selectedCompany ||
            !companies.length
        ) {
            return;
        }

        setSelectedCompany(
            companies[0]
        );
    }, [
        companies,
        selectedCompany,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Refresh
    |--------------------------------------------------------------------------
    */

    const handleRefresh =
        async () => {
            await loadPage(false);
        };

    /*
    |--------------------------------------------------------------------------
    | Open Action Confirmation
    |--------------------------------------------------------------------------
    */

    const handleLayoutAction = (
        action
    ) => {
        if (
            !canActivate ||
            !selectedCompany
        ) {
            return;
        }

        clearMessages();

        setPendingAction(
            action
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Confirm Activate / Deactivate / Reactivate
    |--------------------------------------------------------------------------
    */

    const handleConfirmAction =
        async () => {
            if (
                !pendingAction ||
                !selectedCompany ||
                !tenantId
            ) {
                return;
            }

            const {
                type,
                layout,
            } = pendingAction;

            setActionLoading(true);
            clearMessages();

            try {
                /*
                |--------------------------------------------------------------------------
                | Activate / Reactivate
                |--------------------------------------------------------------------------
                |
                | Reactivation uses the same activate endpoint.
                |
                */

                if (
                    type === "activate" ||
                    type === "reactivate"
                ) {
                    await api.post(
                        `/tenants/${tenantId}/asset-layouts/${layout.id}/activate`,
                        {
                            company_id:
                                selectedCompany.id,
                        }
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Deactivate
                |--------------------------------------------------------------------------
                */

                if (
                    type ===
                    "deactivate"
                ) {
                    await api.post(
                        `/tenants/${tenantId}/asset-layouts/${layout.id}/deactivate`,
                        {
                            company_id:
                                selectedCompany.id,
                        }
                    );
                }

                await loadCompanyActivations(
                    selectedCompany.id
                );

                const actionMessage =
                    type === "deactivate"
                        ? "deactivated"
                        : type ===
                            "reactivate"
                          ? "reactivated"
                          : "activated";

                setMessage(
                    `${layout.name} was ${actionMessage} for ${selectedCompany.name}.`
                );

                setPendingAction(
                    null
                );
            } catch (error) {
                console.error(
                    "Company layout action failed:",
                    error
                );

                setError(
                    getApiError(
                        error,
                        "Unable to update this company layout assignment."
                    )
                );
            } finally {
                setActionLoading(
                    false
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Flatten Activations For Summary
    |--------------------------------------------------------------------------
    */

    const allActivations =
        useMemo(() => {
            return Object.values(
                activationMap
            ).flatMap(
                (items) =>
                    Array.isArray(
                        items
                    )
                        ? items
                        : []
            );
        }, [activationMap]);

    /*
    |--------------------------------------------------------------------------
    | Selected Company Activations
    |--------------------------------------------------------------------------
    */

    const selectedActivations =
        useMemo(() => {
            if (
                !selectedCompany
            ) {
                return [];
            }

            return (
                activationMap[
                    selectedCompany.id
                ] || []
            );
        }, [
            activationMap,
            selectedCompany,
        ]);

    /*
    |--------------------------------------------------------------------------
    | No Organization
    |--------------------------------------------------------------------------
    */

    if (
        !authLoading &&
        !currentTenant
    ) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <Building2
                    size={30}
                    className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                    No organization selected
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select an MSP organization
                    before managing company
                    Asset Layouts.
                </p>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Permission
    |--------------------------------------------------------------------------
    */

    if (
        !authLoading &&
        currentTenant &&
        !canView
    ) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <Building2
                    size={30}
                    className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                    Access unavailable
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    You do not have
                    permission to view Asset
                    Layout assignments.
                </p>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (
        loading ||
        authLoading
    ) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={30}
                        className="mx-auto animate-spin"
                        style={{
                            color:
                                "var(--brand-primary)",
                        }}
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading company
                        layouts...
                    </p>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="space-y-6">
            <CompanyLayoutsHeader
                tenantName={
                    currentTenant?.name
                }
                refreshing={
                    refreshing
                }
                onRefresh={
                    handleRefresh
                }
            />

            {error && (
                <CompanyLayoutsAlert
                    type="error"
                    message={error}
                    onClose={() =>
                        setError("")
                    }
                />
            )}

            {message && (
                <CompanyLayoutsAlert
                    type="success"
                    message={message}
                    onClose={() =>
                        setMessage("")
                    }
                />
            )}

            <CompanyLayoutsSummary
                companies={
                    companies
                }
                layouts={
                    layouts
                }
                activations={
                    allActivations
                }
            />

            <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
                <CompanySelectorPanel
                    companies={
                        filteredCompanies
                    }
                    selectedCompanyId={
                        selectedCompany?.id ||
                        null
                    }
                    search={
                        companySearch
                    }
                    onSearchChange={
                        setCompanySearch
                    }
                    onSelect={(
                        company
                    ) => {
                        clearMessages();

                        setSelectedCompany(
                            company
                        );

                        if (
                            !activationMap[
                                company.id
                            ]
                        ) {
                            loadCompanyActivations(
                                company.id
                            ).catch(
                                (
                                    error
                                ) => {
                                    setError(
                                        getApiError(
                                            error,
                                            "Unable to load company layout assignments."
                                        )
                                    );
                                }
                            );
                        }
                    }}
                />

                <CompanyLayoutAssignmentsPanel
                    company={
                        selectedCompany
                    }
                    layouts={
                        layouts
                    }
                    activations={
                        selectedActivations
                    }
                    canActivate={
                        canActivate
                    }
                    actionLoading={
                        actionLoading
                    }
                    onAction={
                        handleLayoutAction
                    }
                />
            </div>

            <CompanyLayoutActionModal
                open={Boolean(
                    pendingAction
                )}
                action={
                    pendingAction?.type ||
                    null
                }
                company={
                    selectedCompany
                }
                layout={
                    pendingAction
                        ?.layout ||
                    null
                }
                loading={
                    actionLoading
                }
                onClose={() => {
                    if (
                        !actionLoading
                    ) {
                        setPendingAction(
                            null
                        );
                    }
                }}
                onConfirm={
                    handleConfirmAction
                }
            />
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| API Error
|--------------------------------------------------------------------------
*/

function getApiError(
    error,
    fallback
) {
    const validationErrors =
        error.response?.data?.errors;

    if (validationErrors) {
        const firstError =
            Object.values(
                validationErrors
            )?.[0]?.[0];

        if (firstError) {
            return firstError;
        }
    }

    return (
        error.response?.data
            ?.message ||
        fallback
    );
}

export default CompanyLayoutsPage;