import {
    LoaderCircle,
    Shield,
    X,
} from "lucide-react";

import {
    useState,
} from "react";

const SecurityGroupFormModal = ({
    title,
    description,
    group = null,
    loading,
    onClose,
    onSubmit,
}) => {
    const [name, setName] =
        useState(
            group?.name || ""
        );

    const [
        groupDescription,
        setGroupDescription,
    ] = useState(
        group?.description || ""
    );

    const [
        formError,
        setFormError,
    ] = useState("");

    const submit = async (e) => {
        e.preventDefault();

        setFormError("");

        if (!name.trim()) {
            setFormError(
                "Security group name is required."
            );
            return;
        }

        const result =
            await onSubmit({
                name:
                    name.trim(),

                description:
                    groupDescription.trim() ||
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                    <X size={18} />
                </button>

                <form onSubmit={submit}>
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#19b5fe]">
                            <Shield
                                size={20}
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                            {title}
                        </h2>

                        <p className="mt-1 pr-8 text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>

                    <div className="space-y-5 p-6">
                        {formError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Group Name
                            </label>

                            <input
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        e.target.value
                                    )
                                }
                                placeholder="Example: Service Desk Team"
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Description
                            </label>

                            <textarea
                                value={
                                    groupDescription
                                }
                                onChange={(e) =>
                                    setGroupDescription(
                                        e.target.value
                                    )
                                }
                                rows={5}
                                maxLength={2000}
                                placeholder="Describe what this group is used for..."
                                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                            />

                            <p className="mt-1 text-right text-[10px] text-slate-400">
                                {
                                    groupDescription.length
                                }
                                /2000
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            disabled={
                                loading
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

                            {group
                                ? "Save Changes"
                                : "Create Group"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SecurityGroupFormModal;