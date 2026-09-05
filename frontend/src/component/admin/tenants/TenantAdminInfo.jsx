import {
    UserRound,
    Mail,
    Phone,
} from "lucide-react";

function TenantAdminInfo({ formData, onChange, errors = {} }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white">
            {/* Header */}
            <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7046f5]/10">
                        <UserRound
                            size={19}
                            className="text-[#7046f5]"
                        />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-[#07111f]">
                            Tenant administrator
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Assign the primary administrator for this organization.
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* First Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            First name
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            name="admin_first_name"
                            value={formData.admin_first_name}
                            onChange={onChange}
                            placeholder="Michael"
                            className={`h-11 w-full rounded-xl border px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10 ${
                                errors.admin_first_name
                                    ? "border-red-300"
                                    : "border-slate-200"
                            }`}
                        />

                        {errors.admin_first_name && (
                            <p className="mt-1.5 text-xs text-red-500">
                                {errors.admin_first_name}
                            </p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Last name
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            name="admin_last_name"
                            value={formData.admin_last_name}
                            onChange={onChange}
                            placeholder="Carter"
                            className={`h-11 w-full rounded-xl border px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10 ${
                                errors.admin_last_name
                                    ? "border-red-300"
                                    : "border-slate-200"
                            }`}
                        />

                        {errors.admin_last_name && (
                            <p className="mt-1.5 text-xs text-red-500">
                                {errors.admin_last_name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Email address
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <div className="relative">
                            <Mail
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="email"
                                name="admin_email"
                                value={formData.admin_email}
                                onChange={onChange}
                                placeholder="admin@company.com"
                                className={`h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10 ${
                                    errors.admin_email
                                        ? "border-red-300"
                                        : "border-slate-200"
                                }`}
                            />
                        </div>

                        {errors.admin_email && (
                            <p className="mt-1.5 text-xs text-red-500">
                                {errors.admin_email}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Phone number
                        </label>

                        <div className="relative">
                            <Phone
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                name="admin_phone"
                                value={formData.admin_phone}
                                onChange={onChange}
                                placeholder="+1 (555) 123-4567"
                                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
                            />
                        </div>
                    </div>
                </div>

                {/* Invite checkbox */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input
                        type="checkbox"
                        name="send_invitation"
                        checked={formData.send_invitation}
                        onChange={onChange}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#7046f5] focus:ring-[#7046f5]"
                    />

                    <span>
                        <span className="block text-sm font-medium text-slate-700">
                            Send administrator invitation
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-slate-400">
                            Send an email invitation so the administrator can
                            create their password and access the workspace.
                        </span>
                    </span>
                </label>
            </div>
        </section>
    );
}

export default TenantAdminInfo;