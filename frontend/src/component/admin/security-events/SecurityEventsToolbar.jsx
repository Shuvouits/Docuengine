import {
    Filter,
    RefreshCcw,
    Search,
} from "lucide-react";

const SecurityEventsToolbar = ({
    filters,
    onChange,
    onApply,
    onReset,
    loading,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <Filter
                    size={18}
                    className="text-slate-500"
                />

                <h2 className="font-semibold text-slate-900">
                    Filter Events
                </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Event Type
                    </label>

                    <div className="relative">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={filters.event_type}
                            onChange={(event) =>
                                onChange(
                                    "event_type",
                                    event.target.value
                                )
                            }
                            placeholder="Example: auth.login.success"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#19b5fe] focus:ring-2 focus:ring-cyan-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Category
                    </label>

                    <select
                        value={filters.category}
                        onChange={(event) =>
                            onChange(
                                "category",
                                event.target.value
                            )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#19b5fe] focus:ring-2 focus:ring-cyan-100"
                    >
                        <option value="">
                            All Categories
                        </option>
                        <option value="auth">
                            Authentication
                        </option>
                        <option value="mfa">
                            MFA
                        </option>
                        <option value="session">
                            Session
                        </option>
                        <option value="password">
                            Password
                        </option>
                        <option value="user">
                            User
                        </option>
                        <option value="security">
                            Security
                        </option>
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Severity
                    </label>

                    <select
                        value={filters.severity}
                        onChange={(event) =>
                            onChange(
                                "severity",
                                event.target.value
                            )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#19b5fe] focus:ring-2 focus:ring-cyan-100"
                    >
                        <option value="">
                            All Severities
                        </option>
                        <option value="info">
                            Info
                        </option>
                        <option value="warning">
                            Warning
                        </option>
                        <option value="critical">
                            Critical
                        </option>
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        From
                    </label>

                    <input
                        type="date"
                        value={filters.from}
                        onChange={(event) =>
                            onChange(
                                "from",
                                event.target.value
                            )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#19b5fe] focus:ring-2 focus:ring-cyan-100"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        To
                    </label>

                    <input
                        type="date"
                        value={filters.to}
                        min={filters.from || undefined}
                        onChange={(event) =>
                            onChange(
                                "to",
                                event.target.value
                            )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#19b5fe] focus:ring-2 focus:ring-cyan-100"
                    />
                </div>

                <div className="flex items-end gap-2 lg:col-span-4">
                    <button
                        type="button"
                        onClick={onApply}
                        disabled={loading}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#07111f] px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Apply Filters
                    </button>

                    <button
                        type="button"
                        onClick={onReset}
                        disabled={loading}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCcw size={16} />
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecurityEventsToolbar;