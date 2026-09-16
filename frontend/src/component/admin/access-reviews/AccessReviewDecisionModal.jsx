import {
    LoaderCircle,
    ShieldCheck,
    X,
} from "lucide-react";

import {
    useState,
} from "react";

const AccessReviewDecisionModal = ({
    item,
    roles = [],
    loading,
    onClose,
    onSubmit,
}) => {
    const [
        decision,
        setDecision,
    ] = useState(
        "retain"
    );

    const [
        requestedRole,
        setRequestedRole,
    ] = useState("");

    const [notes, setNotes] =
        useState("");

    const [error, setError] =
        useState("");

    const currentRole =
        item.current_role ||
        item.access_snapshot
            ?.roles?.[0] ||
        "";

    const submit = async (
        e
    ) => {
        e.preventDefault();

        setError("");

        if (
            decision ===
                "change_role" &&
            !requestedRole
        ) {
            setError(
                "Select a new role."
            );

            return;
        }

        const result =
            await onSubmit({
                decision,

                requested_role:
                    decision ===
                    "change_role"
                        ? requestedRole
                        : null,

                notes:
                    notes.trim() ||
                    null,
            });

        if (
            result?.ok === false
        ) {
            setError(
                result.message
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={
                        onClose
                    }
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                    <X
                        size={18}
                    />
                </button>

                <form
                    onSubmit={
                        submit
                    }
                >
                    <div className="border-b border-slate-100 px-6 py-5">
                        <ShieldCheck
                            size={22}
                            className="text-[#19b5fe]"
                        />

                        <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                            Review Access
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Current role:{" "}
                            <span className="font-semibold text-slate-700">
                                {currentRole ||
                                    "No role"}
                            </span>
                        </p>
                    </div>

                    <div className="space-y-5 p-6">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                {
                                    error
                                }
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Decision
                            </label>

                            <select
                                value={
                                    decision
                                }
                                onChange={(
                                    e
                                ) =>
                                    setDecision(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
                            >
                                <option value="retain">
                                    Retain Access
                                </option>

                                <option value="revoke">
                                    Revoke Access
                                </option>

                                <option value="change_role">
                                    Change Role
                                </option>
                            </select>
                        </div>

                        {decision ===
                            "change_role" && (
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    New Role
                                </label>

                                <select
                                    value={
                                        requestedRole
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setRequestedRole(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
                                >
                                    <option value="">
                                        Select role
                                    </option>

                                    {roles
                                        .filter(
                                            (
                                                role
                                            ) =>
                                                role !==
                                                currentRole
                                        )
                                        .map(
                                            (
                                                role
                                            ) => (
                                                <option
                                                    key={
                                                        role
                                                    }
                                                    value={
                                                        role
                                                    }
                                                >
                                                    {
                                                        role
                                                    }
                                                </option>
                                            )
                                        )}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Decision Notes
                            </label>

                            <textarea
                                rows={4}
                                value={
                                    notes
                                }
                                onChange={(
                                    e
                                ) =>
                                    setNotes(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                placeholder="Optional notes..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#19b5fe] text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {loading && (
                                <LoaderCircle
                                    size={
                                        16
                                    }
                                    className="animate-spin"
                                />
                            )}

                            Save Decision
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccessReviewDecisionModal;