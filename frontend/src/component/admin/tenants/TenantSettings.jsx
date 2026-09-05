import {
    Settings2,
    Globe,
    Clock3,
    Palette,
} from "lucide-react";

function TenantSettings({ formData, onChange }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white">
            {/* Header */}
            <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                        <Settings2
                            size={19}
                            className="text-emerald-600"
                        />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-[#07111f]">
                            Workspace settings
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Configure the initial tenant environment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* Plan */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Subscription plan
                        </label>

                        <select
                            name="plan"
                            value={formData.plan}
                            onChange={onChange}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
                        >
                            <option value="starter">Starter</option>
                            <option value="professional">
                                Professional
                            </option>
                            <option value="enterprise">
                                Enterprise
                            </option>
                        </select>
                    </div>

                    {/* Locale */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Locale
                        </label>

                        <div className="relative">
                            <Globe
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <select
                                name="locale"
                                value={formData.locale}
                                onChange={onChange}
                                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
                            >
                                <option value="en">
                                    English
                                </option>

                                <option value="en-US">
                                    English (United States)
                                </option>

                                <option value="en-GB">
                                    English (United Kingdom)
                                </option>

                                <option value="fr">
                                    French
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Timezone */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Timezone
                        </label>

                        <div className="relative">
                            <Clock3
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <select
                                name="timezone"
                                value={formData.timezone}
                                onChange={onChange}
                                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
                            >
                                <option value="America/New_York">
                                    Eastern Time (ET)
                                </option>

                                <option value="America/Chicago">
                                    Central Time (CT)
                                </option>

                                <option value="America/Denver">
                                    Mountain Time (MT)
                                </option>

                                <option value="America/Los_Angeles">
                                    Pacific Time (PT)
                                </option>

                                <option value="Asia/Dhaka">
                                    Asia/Dhaka
                                </option>

                                <option value="UTC">
                                    UTC
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Initial status
                        </label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={onChange}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
                        >
                            <option value="onboarding">
                                Onboarding
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="suspended">
                                Suspended
                            </option>
                        </select>
                    </div>
                </div>

                {/* Branding */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                            <Palette
                                size={17}
                                className="text-[#7046f5]"
                            />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-slate-700">
                                Organization branding
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                Branding can be configured after the tenant
                                is created. You can set logo, colors and
                                organization identity.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Feature flags */}
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">
                        Initial features
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                        {/* Documentation */}
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                            <input
                                type="checkbox"
                                name="feature_documentation"
                                checked={formData.feature_documentation}
                                onChange={onChange}
                                className="h-4 w-4 rounded border-slate-300 text-[#7046f5] focus:ring-[#7046f5]"
                            />

                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    Documentation
                                </p>

                                <p className="text-xs text-slate-400">
                                    Enable documentation workspace
                                </p>
                            </div>
                        </label>

                        {/* Security */}
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                            <input
                                type="checkbox"
                                name="feature_security"
                                checked={formData.feature_security}
                                onChange={onChange}
                                className="h-4 w-4 rounded border-slate-300 text-[#7046f5] focus:ring-[#7046f5]"
                            />

                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    Security
                                </p>

                                <p className="text-xs text-slate-400">
                                    Enable security controls
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TenantSettings;