import {
    Archive,
    FilePenLine,
    ListChecks,
    LoaderCircle,
    Plus,
    Search,
    X,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import api from "../../../api/axios";

import OptionListArchiveModal from "./OptionListArchiveModal";
import OptionListItemFormModal from "./OptionListItemFormModal";

function OptionListItemsModal({
    open = false,
    tenantId = null,
    optionList = null,
    canManage = false,
    onClose = () => {},
    onChanged = () => {},
}) {
    const [items, setItems] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [creating, setCreating] =
        useState(false);

    const [editingItem, setEditingItem] =
        useState(null);

    const [archiveItem, setArchiveItem] =
        useState(null);

    const [archiving, setArchiving] =
        useState(false);

    const loadItems = useCallback(
        async () => {
            if (
                !tenantId ||
                !optionList?.id
            ) {
                return;
            }

            setLoading(true);
            setError("");

            try {
                const response =
                    await api.get(
                        `/tenants/${tenantId}/option-lists/${optionList.id}/items`
                    );

                setItems(
                    response.data?.data
                        ?.items ||
                        response.data?.data
                            ?.option_list_items ||
                        []
                );
            } catch (error) {
                console.error(
                    "Failed to load option list items:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                        "Unable to load options."
                );
            } finally {
                setLoading(false);
            }
        },
        [
            tenantId,
            optionList?.id,
        ]
    );

    useEffect(() => {
        if (open) {
            setSearch("");
            loadItems();
        }
    }, [
        open,
        loadItems,
    ]);

    const filteredItems =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return items;
            }

            return items.filter(
                (item) =>
                    String(
                        item.label || ""
                    )
                        .toLowerCase()
                        .includes(query) ||
                    String(
                        item.value || ""
                    )
                        .toLowerCase()
                        .includes(query)
            );
        }, [
            items,
            search,
        ]);

    if (
        !open ||
        !optionList
    ) {
        return null;
    }

    const nextSortOrder =
        items.length
            ? Math.max(
                  ...items.map(
                      (item) =>
                          Number(
                              item.sort_order ||
                                  0
                          )
                  )
              ) + 1
            : 1;

    const handleArchive = async () => {
        if (!archiveItem?.id) {
            return;
        }

        setArchiving(true);

        try {
            await api.delete(
                `/tenants/${tenantId}/option-lists/${optionList.id}/items/${archiveItem.id}`
            );

            setArchiveItem(null);

            await loadItems();
            await onChanged();
        } catch (error) {
            console.error(
                "Failed to archive option item:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to archive option."
            );
        } finally {
            setArchiving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                />

                <div className="relative z-10 flex max-h-[88vh] w-full max-w-[850px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div
                        className="h-1 shrink-0"
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
                                    {
                                        optionList.name
                                    }
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Manage reusable
                                    values for this
                                    option list.
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

                    <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-[420px]">
                            <Search
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Search options..."
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-4 focus:ring-slate-100"
                            />
                        </div>

                        {canManage && (
                            <button
                                type="button"
                                onClick={() =>
                                    setCreating(
                                        true
                                    )
                                }
                                className="
                                    inline-flex h-10
                                    items-center justify-center
                                    gap-2 rounded-xl
                                    px-4 text-sm
                                    font-semibold
                                    text-white
                                "
                                style={{
                                    backgroundColor:
                                        "var(--brand-primary)",
                                }}
                            >
                                <Plus size={16} />

                                Add Option
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {error && (
                            <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex min-h-[300px] items-center justify-center">
                                <div className="text-center">
                                    <LoaderCircle
                                        size={28}
                                        className="mx-auto animate-spin text-slate-400"
                                    />

                                    <p className="mt-3 text-sm text-slate-500">
                                        Loading
                                        options...
                                    </p>
                                </div>
                            </div>
                        ) : !filteredItems.length ? (
                            <div className="px-6 py-16 text-center">
                                <ListChecks
                                    size={28}
                                    className="mx-auto text-slate-300"
                                />

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    No options found
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Add values that
                                    users can select
                                    from this list.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredItems.map(
                                    (item) => (
                                        <div
                                            key={
                                                item.id
                                            }
                                            className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {
                                                            item.label
                                                        }
                                                    </p>

                                                    {item.is_active !==
                                                    false ? (
                                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                                                    <span>
                                                        Value:{" "}
                                                        <strong className="font-semibold text-slate-500">
                                                            {
                                                                item.value
                                                            }
                                                        </strong>
                                                    </span>

                                                    <span>
                                                        Order: #
                                                        {item.sort_order ??
                                                            0}
                                                    </span>
                                                </div>
                                            </div>

                                            {canManage && (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingItem(
                                                                item
                                                            )
                                                        }
                                                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
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
                                                            setArchiveItem(
                                                                item
                                                            )
                                                        }
                                                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-2.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-50"
                                                    >
                                                        <Archive
                                                            size={
                                                                13
                                                            }
                                                        />

                                                        Archive
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                        <p className="text-xs text-slate-400">
                            {items.length} option
                            {items.length === 1
                                ? ""
                                : "s"}
                        </p>

                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <OptionListItemFormModal
                open={
                    creating
                }
                tenantId={
                    tenantId
                }
                optionList={
                    optionList
                }
                nextSortOrder={
                    nextSortOrder
                }
                onClose={() =>
                    setCreating(false)
                }
                onSaved={async () => {
                    setCreating(false);

                    await loadItems();
                    await onChanged();
                }}
            />

            <OptionListItemFormModal
                open={
                    Boolean(
                        editingItem
                    )
                }
                tenantId={
                    tenantId
                }
                optionList={
                    optionList
                }
                item={
                    editingItem
                }
                onClose={() =>
                    setEditingItem(null)
                }
                onSaved={async () => {
                    setEditingItem(null);

                    await loadItems();
                    await onChanged();
                }}
            />

            <OptionListArchiveModal
                open={
                    Boolean(
                        archiveItem
                    )
                }
                title="Archive Option"
                itemName={
                    archiveItem?.label ||
                    ""
                }
                description="This value will no longer be available for new selections. Existing historical values are not permanently deleted."
                loading={
                    archiving
                }
                onClose={() =>
                    setArchiveItem(null)
                }
                onConfirm={
                    handleArchive
                }
            />
        </>
    );
}

export default OptionListItemsModal;