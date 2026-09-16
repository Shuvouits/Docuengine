import {
    ChevronDown,
    ClipboardList,
    Search,
} from "lucide-react";

const AccessReviewsTable = ({
    reviews = [],
    totalReviews,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    loading,
    onOpen,
}) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={17}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={
                                search
                            }
                            onChange={(
                                e
                            ) =>
                                setSearch(
                                    e
                                        .target
                                        .value
                                )
                            }
                            placeholder="Search access reviews..."
                            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-[#19b5fe]"
                        />
                    </div>

                    <div className="relative min-w-[180px]">
                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                e
                            ) =>
                                setStatusFilter(
                                    e
                                        .target
                                        .value
                                )
                            }
                            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none"
                        >
                            <option value="all">
                                All Statuses
                            </option>

                            <option value="draft">
                                Draft
                            </option>

                            <option value="in_progress">
                                In Progress
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                            <option value="cancelled">
                                Cancelled
                            </option>
                        </select>

                        <ChevronDown
                            size={
                                15
                            }
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                            <TableHead>
                                Review
                            </TableHead>

                            <TableHead>
                                Status
                            </TableHead>

                            <TableHead>
                                Reviewer
                            </TableHead>

                            <TableHead>
                                Due
                            </TableHead>

                            <TableHead>
                                Progress
                            </TableHead>

                            <TableHead align="right">
                                Actions
                            </TableHead>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {reviews.map(
                            (review) => (
                                <tr
                                    key={
                                        review.id
                                    }
                                    className="hover:bg-slate-50/60"
                                >
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-[#07111f]">
                                            {
                                                review.name
                                            }
                                        </p>

                                        <p className="mt-1 max-w-[280px] truncate text-xs text-slate-400">
                                            {review.notes ||
                                                "No notes"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <StatusBadge
                                            status={
                                                review.status
                                            }
                                        />
                                    </td>

                                    <td className="px-5 py-4 text-xs text-slate-600">
                                        {getReviewerName(
                                            review
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-xs text-slate-500">
                                        {formatDate(
                                            review.due_at
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-xs text-slate-600">
                                        {getProgressText(
                                            review
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                disabled={
                                                    loading
                                                }
                                                onClick={() =>
                                                    onOpen(
                                                        review
                                                    )
                                                }
                                                className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-[#19b5fe]/40 hover:text-[#159edb]"
                                            >
                                                <ClipboardList
                                                    size={
                                                        14
                                                    }
                                                />

                                                Open
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {!reviews.length && (
                <div className="px-6 py-16 text-center">
                    <ClipboardList
                        size={30}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 font-semibold text-slate-700">
                        No access reviews found
                    </h3>
                </div>
            )}

            <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                    {reviews.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                    {totalReviews}
                </span>{" "}
                reviews
            </div>
        </div>
    );
};

const StatusBadge = ({
    status,
}) => {
    const styles = {
        draft:
            "border-slate-200 bg-slate-50 text-slate-600",

        in_progress:
            "border-blue-200 bg-blue-50 text-blue-700",

        completed:
            "border-emerald-200 bg-emerald-50 text-emerald-700",

        cancelled:
            "border-red-200 bg-red-50 text-red-600",
    };

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status] || styles.draft}`}
        >
            {formatStatus(
                status
            )}
        </span>
    );
};

const getReviewerName = (
    review
) => {
    return (
        review.reviewer_user?.name ||
        review.reviewer?.name ||
        "Not assigned"
    );
};

const getProgressText = (
    review
) => {
    const items =
        review.items ||
        review.review_items ||
        [];

    if (!items.length) {
        return review.status ===
            "draft"
            ? "Not started"
            : "—";
    }

    const reviewed =
        items.filter(
            (item) =>
                item.decision &&
                item.decision !==
                    "pending"
        ).length;

    return `${reviewed}/${items.length}`;
};

const formatStatus = (
    value
) =>
    String(value || "")
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (char) =>
                char.toUpperCase()
        );

const formatDate = (
    value
) => {
    if (!value) {
        return "No due date";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            dateStyle: "medium",
        }
    ).format(new Date(value));
};

const TableHead = ({
    children,
    align = "left",
}) => (
    <th
        className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 ${
            align === "right"
                ? "text-right"
                : "text-left"
        }`}
    >
        {children}
    </th>
);

export default AccessReviewsTable;