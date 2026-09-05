import {
    Building2,
    Globe2,
} from "lucide-react";

function TenantBasicInfo({ formData, onChange, errors = {} }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white">
            {/* Header */}
            <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10">
                        <Building2
                            size={19}
                            className="text-[#19b5fe]"
                        />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-[#07111f]">
                            Organization information
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Basic information about this tenant organization.
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* Organization Name */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Organization name
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            placeholder="e.g. Acme Corporation"
                            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10 ${
                                errors.name
                                    ? "border-red-300"
                                    : "border-slate-200"
                            }`}
                        />

                        {errors.name && (
                            <p className="mt-1.5 text-xs text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Tenant Code */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Tenant code
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            name="tenant_code"
                            value={formData.tenant_code}
                            onChange={onChange}
                            placeholder="ACME-001"
                            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm uppercase text-slate-700 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10 ${
                                errors.tenant_code
                                    ? "border-red-300"
                                    : "border-slate-200"
                            }`}
                        />

                        {errors.tenant_code ? (
                            <p className="mt-1.5 text-xs text-red-500">
                                {errors.tenant_code}
                            </p>
                        ) : (
                            <p className="mt-1.5 text-[11px] text-slate-400">
                                Unique identifier used internally by the platform.
                            </p>
                        )}
                    </div>

                    {/* Website */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Website
                        </label>

                        <div className="relative">
                            <Globe2
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={onChange}
                                placeholder="https://example.com"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onChange}
                            rows={4}
                            placeholder="Brief description of this organization..."
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TenantBasicInfo;