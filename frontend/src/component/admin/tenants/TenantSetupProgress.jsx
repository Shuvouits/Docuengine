function TenantSetupProgress({ progress }) {
    return (
        <div className="w-[130px]">
            <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                    Setup
                </span>

                <span className="text-xs font-semibold text-slate-700">
                    {progress}%
                </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-[#19b5fe] to-[#7c3aed]"
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default TenantSetupProgress;