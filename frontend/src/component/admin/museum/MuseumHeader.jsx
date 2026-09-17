import {
    Archive,
} from "lucide-react";

const MuseumHeader = () => {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Archive size={22} />
                </div>

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Museum
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Review archived resources and their historical details.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MuseumHeader;