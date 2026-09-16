import {
    LoaderCircle,
    Network,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

const IpAccessEntryModal = ({
    open,
    entry,
    saving,
    onClose,
    onSave,
}) => {
    const [form, setForm] = useState({
        label: "",
        ip_or_cidr: "",
        is_active: true,
    });

    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm({
            label: entry?.label || "",
            ip_or_cidr: entry?.ip_or_cidr || "",
            is_active:
                entry?.is_active !== undefined
                    ? Boolean(entry.is_active)
                    : true,
        });

        setError("");
    }, [
        open,
        entry,
    ]);

    if (!open) {
        return null;
    }

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (!form.ip_or_cidr.trim()) {
            setError(
                "IP address or CIDR range is required."
            );

            return;
        }

        setError("");

        try {
            await onSave({
                label:
                    form.label.trim() || null,
                ip_or_cidr:
                    form.ip_or_cidr.trim(),
                is_active:
                    Boolean(form.is_active),
            });
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "IP allowlist entry could not be saved."
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#19b5fe]">
                            <Network size={20} />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                {entry
                                    ? "Edit IP Rule"
                                    : "Add IP Rule"}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Allow an individual IP address or CIDR network range.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 px-6 py-5">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Label
                            </label>

                            <input
                                type="text"
                                maxLength={100}
                                value={form.label}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        label: event.target.value,
                                    }))
                                }
                                placeholder="Example: Main Office"
                                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#19b5fe] focus:ring-2 focus:ring-cyan-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                IP Address or CIDR
                            </label>

                            <input
                                type="text"
                                value={form.ip_or_cidr}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        ip_or_cidr:
                                            event.target.value,
                                    }))
                                }
                                placeholder="192.168.1.20 or 192.168.1.0/24"
                                className="h-11 w-full rounded-xl border border-slate-200 px-3 font-mono text-sm outline-none transition focus:border-[#19b5fe] focus:ring-2 focus:ring-cyan-100"
                            />

                            <p className="mt-2 text-xs leading-5 text-slate-400">
                                IPv4, IPv6, and CIDR ranges are supported. CIDR values are normalized by the server.
                            </p>
                        </div>

                        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Active Rule
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Only active rules are used when IP restrictions are enabled.
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        is_active:
                                            event.target.checked,
                                    }))
                                }
                                className="h-5 w-5 accent-[#19b5fe]"
                            />
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex h-11 min-w-[130px] items-center justify-center gap-2 rounded-xl bg-[#19b5fe] px-5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving && (
                                <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                />
                            )}

                            {entry
                                ? "Save Changes"
                                : "Add Rule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IpAccessEntryModal;