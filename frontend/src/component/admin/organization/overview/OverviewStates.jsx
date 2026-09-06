import {
    AlertCircle,
    Building2,
    LoaderCircle,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Loading State
|--------------------------------------------------------------------------
*/

export function OrganizationLoadingState() {
    return (
        <div className="flex min-h-[450px] items-center justify-center">
            <div className="text-center">

                <LoaderCircle
                    size={30}
                    className="mx-auto animate-spin text-[#19b5fe]"
                />

                <p className="mt-3 text-sm text-slate-500">
                    Loading organization...
                </p>

            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Error State
|--------------------------------------------------------------------------
*/

export function OrganizationErrorState({
    message,
}) {
    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <div className="flex items-start gap-3">

                <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-500"
                />

                <div>

                    <h2 className="font-semibold text-red-700">
                        Unable to load organization
                    </h2>

                    <p className="mt-1 text-sm text-red-600">
                        {message}
                    </p>

                </div>

            </div>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

export function OrganizationEmptyState() {
    return (
        <div className="flex min-h-[450px] items-center justify-center">

            <div className="max-w-md text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#19b5fe]/10">

                    <Building2
                        size={24}
                        className="text-[#19b5fe]"
                    />

                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-900">
                    No organization selected
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Select an MSP organization before
                    viewing organization-specific settings.
                </p>

            </div>

        </div>
    );
}