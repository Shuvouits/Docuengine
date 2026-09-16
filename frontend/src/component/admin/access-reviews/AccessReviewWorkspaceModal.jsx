import {
    CheckCircle2,
    ClipboardCheck,
    LoaderCircle,
    Play,
    ShieldAlert,
    UserCheck,
    UserCog,
    UserX,
    X,
} from "lucide-react";

import {
    useMemo,
    useState,
} from "react";

import AccessReviewDecisionModal from "./AccessReviewDecisionModal";
import AccessReviewActionModal from "./AccessReviewActionModal";

const AccessReviewWorkspaceModal = ({
    review,
    tenantUsers = [],
    roleOptions = [],
    canManage,
    loading,
    onClose,
    onStart,
    onDecision,
    onComplete,
    onCancel,
}) => {
    const [
        decisionItem,
        setDecisionItem,
    ] = useState(null);

    const [
        actionType,
        setActionType,
    ] = useState(null);

    const items =
        review?.items ||
        review?.review_items ||
        [];

    const progress =
        useMemo(() => {
            const reviewed =
                items.filter(
                    (item) =>
                        item.decision &&
                        item.decision !==
                            "pending"
                ).length;

            return {
                total:
                    items.length,

                reviewed,

                pending:
                    items.length -
                    reviewed,
            };
        }, [items]);

    const findUser = (
        item
    ) => {
        if (
            item.subject_user
        ) {
            return item.subject_user;
        }

        if (item.user) {
            return item.user;
        }

        const membership =
            tenantUsers.find(
                (row) =>
                    row.user?.id ===
                    item.subject_user_id
            );

        return (
            membership?.user ||
            null
        );
    };

    const executeAction =
        async () => {
            let result;

            if (
                actionType === "start"
            ) {
                result =
                    await onStart(
                        review.id
                    );
            }

            if (
                actionType ===
                "complete"
            ) {
                result =
                    await onComplete(
                        review.id
                    );
            }

            if (
                actionType ===
                "cancel"
            ) {
                result =
                    await onCancel(
                        review.id
                    );
            }

            if (
                result?.ok !== false
            ) {
                setActionType(
                    null
                );
            }

            return result;
        };

    return (
        <>
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 px-4 py-4 backdrop-blur-[2px]">
                <div className="relative flex max-h-[calc(100vh-32px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        disabled={
                            loading
                        }
                        className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                        <X
                            size={18}
                        />
                    </button>

                    <div className="shrink-0 border-b border-slate-100 px-6 py-5">
                        <div className="flex flex-col justify-between gap-4 pr-10 lg:flex-row lg:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ClipboardCheck
                                        size={
                                            19
                                        }
                                        className="text-[#19b5fe]"
                                    />

                                    <h2 className="text-lg font-bold text-[#07111f]">
                                        {
                                            review.name
                                        }
                                    </h2>
                                </div>

                                <p className="mt-2 text-sm text-slate-500">
                                    {review.notes ||
                                        "Review tenant access and confirm each user's access."}
                                </p>
                            </div>

                            <StatusBadge
                                status={
                                    review.status
                                }
                            />
                        </div>
                    </div>

                    <div className="shrink-0 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Metric
                                label="Users"
                                value={
                                    progress.total
                                }
                            />

                            <Metric
                                label="Reviewed"
                                value={
                                    progress.reviewed
                                }
                            />

                            <Metric
                                label="Pending"
                                value={
                                    progress.pending
                                }
                            />
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-6 [scrollbar-width:thin]">
                        {review.status ===
                            "draft" && (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
                                <Play
                                    size={
                                        30
                                    }
                                    className="mx-auto text-slate-300"
                                />

                                <h3 className="mt-4 font-semibold text-slate-700">
                                    Review has not started
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Starting the review
                                    will snapshot all
                                    active tenant users,
                                    roles and permissions.
                                </p>
                            </div>
                        )}

                        {review.status !==
                            "draft" &&
                            items.length >
                                0 && (
                                <div className="space-y-3">
                                    {items.map(
                                        (
                                            item
                                        ) => {
                                            const user =
                                                findUser(
                                                    item
                                                );

                                            const currentRole =
                                                item.current_role ||
                                                item.access_snapshot
                                                    ?.roles?.[0] ||
                                                "No role";

                                            const permissionCount =
                                                item.access_snapshot
                                                    ?.permissions
                                                    ?.length ||
                                                0;

                                            return (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="rounded-xl border border-slate-200 p-4"
                                                >
                                                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#07111f]">
                                                                {user?.name ||
                                                                    item.subject_user_id}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {user?.email ||
                                                                    ""}
                                                            </p>

                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                                                                    {
                                                                        currentRole
                                                                    }
                                                                </span>

                                                                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                                                                    {
                                                                        permissionCount
                                                                    }{" "}
                                                                    permissions
                                                                </span>

                                                                <DecisionBadge
                                                                    decision={
                                                                        item.decision
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        {canManage &&
                                                            review.status ===
                                                                "in_progress" &&
                                                            item.decision ===
                                                                "pending" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDecisionItem(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#19b5fe] px-4 text-xs font-semibold text-white"
                                                                >
                                                                    <UserCog
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    Review Access
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}

                        {review.status !==
                            "draft" &&
                            !items.length && (
                                <div className="py-12 text-center text-sm text-slate-400">
                                    No review items
                                    available.
                                </div>
                            )}
                    </div>

                    {canManage && (
                        <div className="flex shrink-0 flex-wrap justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <div>
                                {(review.status ===
                                    "draft" ||
                                    review.status ===
                                        "in_progress") && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActionType(
                                                "cancel"
                                            )
                                        }
                                        className="h-11 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        Cancel Review
                                    </button>
                                )}
                            </div>

                            <div>
                                {review.status ===
                                    "draft" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActionType(
                                                "start"
                                            )
                                        }
                                        className="flex h-11 items-center gap-2 rounded-xl bg-[#19b5fe] px-5 text-sm font-semibold text-white"
                                    >
                                        <Play
                                            size={
                                                16
                                            }
                                        />
                                        Start Review
                                    </button>
                                )}

                                {review.status ===
                                    "in_progress" && (
                                    <button
                                        type="button"
                                        disabled={
                                            progress.pending >
                                            0
                                        }
                                        onClick={() =>
                                            setActionType(
                                                "complete"
                                            )
                                        }
                                        className="flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <CheckCircle2
                                            size={
                                                16
                                            }
                                        />
                                        Complete Review
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {decisionItem && (
                <AccessReviewDecisionModal
                    review={
                        review
                    }
                    item={
                        decisionItem
                    }
                    roles={
                        roleOptions
                    }
                    loading={
                        loading
                    }
                    onClose={() =>
                        setDecisionItem(
                            null
                        )
                    }
                    onSubmit={async (
                        payload
                    ) => {
                        const result =
                            await onDecision(
                                review.id,
                                decisionItem.id,
                                payload
                            );

                        if (
                            result?.ok !==
                            false
                        ) {
                            setDecisionItem(
                                null
                            );
                        }

                        return result;
                    }}
                />
            )}

            {actionType && (
                <AccessReviewActionModal
                    type={
                        actionType
                    }
                    reviewName={
                        review.name
                    }
                    loading={
                        loading
                    }
                    onClose={() =>
                        setActionType(
                            null
                        )
                    }
                    onConfirm={
                        executeAction
                    }
                />
            )}
        </>
    );
};

const Metric = ({
    label,
    value,
}) => (
    <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
        </p>

        <p className="mt-1 text-xl font-bold text-[#07111f]">
            {value}
        </p>
    </div>
);

const StatusBadge = ({
    status,
}) => (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold capitalize text-slate-600">
        {String(status || "")
            .replaceAll(
                "_",
                " "
            )}
    </span>
);

const DecisionBadge = ({
    decision,
}) => {
    const config = {
        pending: {
            icon: ShieldAlert,
            classes:
                "bg-amber-50 text-amber-700",
        },

        retain: {
            icon: UserCheck,
            classes:
                "bg-emerald-50 text-emerald-700",
        },

        revoke: {
            icon: UserX,
            classes:
                "bg-red-50 text-red-600",
        },

        change_role: {
            icon: UserCog,
            classes:
                "bg-blue-50 text-blue-700",
        },
    };

    const current =
        config[decision] ||
        config.pending;

    const Icon =
        current.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold ${current.classes}`}
        >
            <Icon
                size={11}
            />

            {String(
                decision ||
                    "pending"
            ).replaceAll(
                "_",
                " "
            )}
        </span>
    );
};

export default AccessReviewWorkspaceModal;