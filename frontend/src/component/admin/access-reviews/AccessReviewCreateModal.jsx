import {
    ClipboardCheck,
    LoaderCircle,
    X,
} from "lucide-react";

import {
    useState,
} from "react";

const AccessReviewCreateModal = ({
    tenantUsers = [],
    loading,
    onClose,
    onSubmit,
}) => {
    const [name, setName] =
        useState("");

    const [
        reviewerUserId,
        setReviewerUserId,
    ] = useState("");

    const [dueAt, setDueAt] =
        useState("");

    const [notes, setNotes] =
        useState("");

    const [
        formError,
        setFormError,
    ] = useState("");

    const submit = async (
        e
    ) => {
        e.preventDefault();

        setFormError("");

        if (!name.trim()) {
            setFormError(
                "Review name is required."
            );

            return;
        }

        const result =
            await onSubmit({
                name:
                    name.trim(),

                reviewer_user_id:
                    reviewerUserId ||
                    null,

                due_at:
                    dueAt || null,

                notes:
                    notes.trim() ||
                    null,
            });

        if (
            result?.ok === false
        ) {
            setFormError(
                result.message
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 px-4 py-4 backdrop-blur-[2px]">
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
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#19b5fe]">
                            <ClipboardCheck
                                size={
                                    20
                                }
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                            New Access Review
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Create a draft review
                            before capturing
                            current tenant access.
                        </p>
                    </div>

                    <div className="space-y-5 p-6">
                        {formError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {
                                    formError
                                }
                            </div>
                        )}

                        <Field
                            label="Review Name"
                            value={
                                name
                            }
                            onChange={
                                setName
                            }
                            placeholder="Example: Q3 Access Review"
                        />

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Reviewer
                            </label>

                            <select
                                value={
                                    reviewerUserId
                                }
                                onChange={(
                                    e
                                ) =>
                                    setReviewerUserId(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#19b5fe]"
                            >
                                <option value="">
                                    No reviewer assigned
                                </option>

                                {tenantUsers.map(
                                    (
                                        membership
                                    ) => (
                                        <option
                                            key={
                                                membership
                                                    .user
                                                    ?.id
                                            }
                                            value={
                                                membership
                                                    .user
                                                    ?.id ||
                                                ""
                                            }
                                        >
                                            {membership
                                                .user
                                                ?.name ||
                                                membership
                                                    .user
                                                    ?.email}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Due Date
                            </label>

                            <input
                                type="datetime-local"
                                value={
                                    dueAt
                                }
                                onChange={(
                                    e
                                ) =>
                                    setDueAt(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#19b5fe]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Notes
                            </label>

                            <textarea
                                rows={4}
                                value={
                                    notes
                                }
                                maxLength={
                                    5000
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
                                placeholder="Optional notes for this review..."
                                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#19b5fe]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
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

                            Create Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Field = ({
    label,
    value,
    onChange,
    placeholder,
}) => (
    <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
            {label}
        </label>

        <input
            value={value}
            onChange={(e) =>
                onChange(
                    e.target.value
                )
            }
            placeholder={
                placeholder
            }
            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#19b5fe]"
        />
    </div>
);

export default AccessReviewCreateModal;