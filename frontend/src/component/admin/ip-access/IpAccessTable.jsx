import {
    Pencil,
    Trash2,
} from "lucide-react";

const IpAccessTable = ({
    entries,
    canManage,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">
                    Allowlist Rules
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Add individual IP addresses or CIDR network ranges.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Label
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                IP / CIDR
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Created
                            </th>

                            {canManage && (
                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {entries.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={canManage ? 5 : 4}
                                    className="px-6 py-16 text-center"
                                >
                                    <p className="text-sm font-semibold text-slate-700">
                                        No IP allowlist rules yet.
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Add an IP address or CIDR range before enabling restrictions.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className="transition hover:bg-slate-50/70"
                                >
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {entry.label || "Unlabeled Rule"}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-700">
                                            {entry.ip_or_cidr}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                entry.is_active
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                    : "border-slate-200 bg-slate-50 text-slate-500"
                                            }`}
                                        >
                                            {entry.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {entry.created_at
                                            ? new Date(
                                                  entry.created_at
                                              ).toLocaleString()
                                            : "—"}
                                    </td>

                                    {canManage && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onEdit(entry)
                                                    }
                                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDelete(entry)
                                                    }
                                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IpAccessTable;