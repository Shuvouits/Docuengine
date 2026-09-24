import {
    AlertCircle,
    ListChecks,
    LoaderCircle,
    Plus,
    RefreshCw,
    Search,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import api from "../../../api/axios";

import OptionListArchiveModal from "../../../component/admin/option-lists/OptionListArchiveModal";
import OptionListFormModal from "../../../component/admin/option-lists/OptionListFormModal";
import OptionListItemsModal from "../../../component/admin/option-lists/OptionListItemsModal";
import OptionListsSummary from "../../../component/admin/option-lists/OptionListsSummary";
import OptionListsTable from "../../../component/admin/option-lists/OptionListsTable";

function OptionListsPage({
    authData = null,
    authLoading = false,
}) {
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
            "option_lists.manage"
        );

    /*
    |--------------------------------------------------------------------------
    | Data
    |--------------------------------------------------------------------------
    */

    const [optionLists, setOptionLists] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | Modals
    |--------------------------------------------------------------------------
    */

    const [createOpen, setCreateOpen] =
        useState(false);

    const [editingList, setEditingList] =
        useState(null);

    const [selectedList, setSelectedList] =
        useState(null);

    const [archiveList, setArchiveList] =
        useState(null);

    const [archiving, setArchiving] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Load Option Lists
    |--------------------------------------------------------------------------
    */

    const loadOptionLists = useCallback(
        async ({
            initial = false,
        } = {}) => {
            if (!tenantId) {
                return;
            }

            if (initial) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/option-lists`
                    );

                setOptionLists(
                    response.data?.data
                        ?.option_lists ||
                        []
                );
            } catch (error) {
                console.error(
                    "Failed to load option lists:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                        "Unable to load option lists."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [tenantId]
    );

    useEffect(() => {
        if (
            !authLoading &&
            tenantId
        ) {
            loadOptionLists({
                initial: true,
            });
        }
    }, [
        authLoading,
        tenantId,
        loadOptionLists,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const filteredLists =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return optionLists;
            }

            return optionLists.filter(
                (item) => {
                    return [
                        item.name,
                        item.slug,
                        item.description,
                    ].some((value) =>
                        String(
                            value || ""
                        )
                            .toLowerCase()
                            .includes(
                                query
                            )
                    );
                }
            );
        }, [
            optionLists,
            search,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Archive Option List
    |--------------------------------------------------------------------------
    */

    const handleArchive = async () => {
        if (
            !tenantId ||
            !archiveList?.id
        ) {
            return;
        }

        setArchiving(true);
        setError("");

        try {
            await api.delete(
                `/tenants/${tenantId}/option-lists/${archiveList.id}`
            );

            if (
                selectedList?.id ===
                archiveList.id
            ) {
                setSelectedList(null);
            }

            setArchiveList(null);

            await loadOptionLists();
        } catch (error) {
            console.error(
                "Failed to archive option list:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to archive option list."
            );
        } finally {
            setArchiving(false);
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
                        Loading option lists...
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
            {/* Page Header */}

            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
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
                            Documentation
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[30px]">
                        Option Lists
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        Create reusable sets of
                        values for select and
                        multi-select fields across
                        asset layouts.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            loadOptionLists()
                        }
                        disabled={
                            refreshing
                        }
                        className="
                            inline-flex h-11
                            items-center gap-2
                            rounded-xl border
                            border-slate-200
                            bg-white px-4
                            text-sm font-semibold
                            text-slate-700
                            shadow-sm transition
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    {canManage && (
                        <button
                            type="button"
                            onClick={() =>
                                setCreateOpen(
                                    true
                                )
                            }
                            className="
                                inline-flex h-11
                                items-center gap-2
                                rounded-xl px-4
                                text-sm font-semibold
                                text-white shadow-sm
                                transition
                                hover:opacity-90
                            "
                            style={{
                                backgroundColor:
                                    "var(--brand-primary)",
                            }}
                        >
                            <Plus size={17} />

                            New Option List
                        </button>
                    )}
                </div>
            </div>

            {/* Error */}

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                    <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>
                        <p className="text-sm font-semibold text-red-800">
                            Something went wrong
                        </p>

                        <p className="mt-1 text-xs text-red-700">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Summary */}

            <OptionListsSummary
                optionLists={
                    optionLists
                }
            />

            {/* Search */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-[520px]">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search option lists..."
                            className="
                                h-11 w-full
                                rounded-xl border
                                border-slate-200
                                bg-white pl-10
                                pr-4 text-sm
                                text-slate-800
                                outline-none
                                transition
                                placeholder:text-slate-400
                                focus:border-slate-300
                                focus:ring-4
                                focus:ring-slate-100
                            "
                        />
                    </div>

                    <p className="text-xs text-slate-400">
                        Showing{" "}
                        <span className="font-semibold text-slate-600">
                            {
                                filteredLists.length
                            }
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-600">
                            {
                                optionLists.length
                            }
                        </span>{" "}
                        lists
                    </p>
                </div>
            </div>

            {/* Table */}

            <OptionListsTable
                optionLists={
                    filteredLists
                }
                canManage={
                    canManage
                }
                onManageItems={(
                    optionList
                ) =>
                    setSelectedList(
                        optionList
                    )
                }
                onEdit={(
                    optionList
                ) =>
                    setEditingList(
                        optionList
                    )
                }
                onArchive={(
                    optionList
                ) =>
                    setArchiveList(
                        optionList
                    )
                }
            />

            {/* Create List */}

            <OptionListFormModal
                open={
                    createOpen
                }
                tenantId={
                    tenantId
                }
                optionList={null}
                onClose={() =>
                    setCreateOpen(
                        false
                    )
                }
                onSaved={async () => {
                    setCreateOpen(
                        false
                    );

                    await loadOptionLists();
                }}
            />

            {/* Edit List */}

            <OptionListFormModal
                open={
                    Boolean(
                        editingList
                    )
                }
                tenantId={
                    tenantId
                }
                optionList={
                    editingList
                }
                onClose={() =>
                    setEditingList(
                        null
                    )
                }
                onSaved={async () => {
                    setEditingList(
                        null
                    );

                    await loadOptionLists();
                }}
            />

            {/* Manage Items */}

            <OptionListItemsModal
                open={
                    Boolean(
                        selectedList
                    )
                }
                tenantId={
                    tenantId
                }
                optionList={
                    selectedList
                }
                canManage={
                    canManage
                }
                onClose={() =>
                    setSelectedList(
                        null
                    )
                }
                onChanged={async () => {
                    await loadOptionLists();
                }}
            />

            {/* Archive List */}

            <OptionListArchiveModal
                open={
                    Boolean(
                        archiveList
                    )
                }
                title="Archive Option List"
                itemName={
                    archiveList?.name ||
                    ""
                }
                description="This option list will no longer be available for new field configuration. Existing layout references and historical data are not permanently deleted."
                loading={
                    archiving
                }
                onClose={() =>
                    setArchiveList(
                        null
                    )
                }
                onConfirm={
                    handleArchive
                }
            />
        </div>
    );
}

export default OptionListsPage;