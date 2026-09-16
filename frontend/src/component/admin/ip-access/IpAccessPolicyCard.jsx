import {
    AlertTriangle,
    LoaderCircle,
    ShieldCheck,
    ShieldOff,
} from "lucide-react";

const IpAccessPolicyCard = ({
    policy,
    activeEntries,
    canManage,
    saving,
    onToggle,
}) => {
    const enabled = Boolean(policy?.enabled);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                            enabled
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                        }`}
                    >
                        {enabled ? (
                            <ShieldCheck size={23} />
                        ) : (
                            <ShieldOff size={23} />
                        )}
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            IP Restriction Policy
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {enabled
                                ? "Only requests matching active allowlist rules can access this tenant."
                                : "IP restrictions are currently disabled for this tenant."}
                        </p>
                    </div>
                </div>

                {canManage && (
                    <button
                        type="button"
                        onClick={onToggle}
                        disabled={saving}
                        className={`inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            enabled
                                ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                : "bg-[#07111f] text-white hover:bg-slate-800"
                        }`}
                    >
                        {saving && (
                            <LoaderCircle
                                size={16}
                                className="animate-spin"
                            />
                        )}

                        {enabled
                            ? "Disable Policy"
                            : "Enable Policy"}
                    </button>
                )}
            </div>

            <div className="px-6 py-5">
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <AlertTriangle
                        size={19}
                        className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>
                        <p className="text-sm font-semibold text-amber-900">
                            Self-lockout protection is active
                        </p>

                        <p className="mt-1 text-sm leading-6 text-amber-800">
                            The policy cannot be enabled unless your current IP is covered by an active rule.
                            While restrictions are enabled, DocuEngine also blocks changes that would remove
                            your current IP from the allowlist.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
                    <div>
                        Active rules:{" "}
                        <span className="font-semibold text-slate-800">
                            {activeEntries}
                        </span>
                    </div>

                    <div>
                        Last updated:{" "}
                        <span className="font-semibold text-slate-800">
                            {policy?.updated_at
                                ? new Date(
                                      policy.updated_at
                                  ).toLocaleString()
                                : "Not recorded"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IpAccessPolicyCard;