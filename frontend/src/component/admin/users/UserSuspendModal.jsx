import {
    LoaderCircle,
    UserX,
    X,
} from "lucide-react";

const UserSuspendModal = ({
    user,
    tenantName,
    loading,
    onClose,
    onConfirm,
}) => {
    const userName =
        user?.user?.name ||
        "this user";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="h-1 bg-red-500" />

                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
                >
                    <X size={18} />
                </button>

                <div className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <UserX
                            size={21}
                        />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-[#07111f]">
                        Suspend User
                    </h2>

                    <p className="mt-2 pr-3 text-sm leading-6 text-slate-500">
                        Suspend{" "}
                        <span className="font-semibold text-slate-700">
                            {userName}
                        </span>
                        's access to{" "}
                        <span className="font-semibold text-slate-700">
                            {tenantName}
                        </span>
                        ? This user will no
                        longer be able to
                        access this tenant
                        until reactivated.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={
                            onConfirm
                        }
                        disabled={loading}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                        {loading && (
                            <LoaderCircle
                                size={16}
                                className="animate-spin"
                            />
                        )}

                        Suspend User
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSuspendModal;