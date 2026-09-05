import TenantTableRow from "./TenantTableRow";

function TenantTable({
    tenants,
    onRefresh,
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="overflow-x-auto">

                <table className="min-w-[1200px] w-full">

                    <thead>

                        <tr className="border-b border-slate-200 bg-slate-50/70">

                            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Organization
                            </th>

                            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Administrator
                            </th>

                            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Users
                            </th>

                            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Documents
                            </th>

                            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Plan
                            </th>

                            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Status
                            </th>

                            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Setup
                            </th>

                            <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {tenants.map((tenant) => (
                            <TenantTableRow
                                key={tenant.id}
                                tenant={tenant}
                                onRefresh={onRefresh}
                            />
                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default TenantTable;