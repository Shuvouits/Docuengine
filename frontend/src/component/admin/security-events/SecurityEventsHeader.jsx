import {
    ShieldCheck,
} from "lucide-react";

const SecurityEventsHeader = () => {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#19b5fe]">
                        <ShieldCheck size={22} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Security Events
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Review authentication, access, session, and account security activity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityEventsHeader;