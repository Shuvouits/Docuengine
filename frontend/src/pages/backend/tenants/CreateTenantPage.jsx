import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    Building2,
    ShieldCheck,
    Settings2,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";

import TenantBasicInfo from "../../../component/admin/tenants/TenantBasicInfo";
import TenantAdminInfo from "../../../component/admin/tenants/TenantAdminInfo";
import TenantSettings from "../../../component/admin/tenants/TenantSettings";

import api from "../../../api/axios";

function CreateTenantPage() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        tenant_code: "",
        website: "",
        description: "",

        admin_first_name: "",
        admin_last_name: "",
        admin_email: "",
        admin_phone: "",
        send_invitation: true,

        plan: "professional",
        locale: "en",
        timezone: "America/New_York",
        status: "onboarding",

        feature_documentation: true,
        feature_security: true,
    });

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear field error while typing
        if (errors[name]) {
            setErrors((previous) => ({
                ...previous,
                [name]: "",
            }));
        }

        setSubmitError("");
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Organization name is required.";
        }

        if (!formData.tenant_code.trim()) {
            newErrors.tenant_code = "Tenant code is required.";
        }

        if (!formData.admin_first_name.trim()) {
            newErrors.admin_first_name =
                "Administrator first name is required.";
        }

        if (!formData.admin_last_name.trim()) {
            newErrors.admin_last_name =
                "Administrator last name is required.";
        }

        if (!formData.admin_email.trim()) {
            newErrors.admin_email =
                "Administrator email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.admin_email
            )
        ) {
            newErrors.admin_email =
                "Please enter a valid email address.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitError("");
        setErrors({});

        if (!validateForm()) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: formData.name.trim(),

                slug: generateSlug(formData.name),

                tenant_code: formData.tenant_code.trim(),

                website: formData.website.trim() || null,

                description:
                    formData.description.trim() || null,

                admin_first_name:
                    formData.admin_first_name.trim(),

                admin_last_name:
                    formData.admin_last_name.trim(),

                admin_email:
                    formData.admin_email.trim(),

                admin_phone:
                    formData.admin_phone.trim() || null,

                send_invitation:
                    formData.send_invitation,

                plan: formData.plan,

                locale: formData.locale,

                timezone: formData.timezone,

                status: formData.status,

                features: {
                    documentation:
                        formData.feature_documentation,

                    security:
                        formData.feature_security,
                },
            };

            const response = await api.post(
                "/tenants",
                payload
            );

            console.log(
                "Tenant created successfully:",
                response.data
            );

            navigate("/admin/tenants", {
                replace: true,
                state: {
                    success:
                        response.data?.message ||
                        "Tenant created successfully.",
                },
            });
        } catch (error) {
            console.error(
                "Failed to create tenant:",
                error
            );

            // Laravel validation errors
            if (error.response?.status === 422) {
                const validationErrors =
                    error.response?.data?.errors || {};

                setErrors(validationErrors);

                setSubmitError(
                    error.response?.data?.message ||
                    "Please check the form and try again."
                );

                return;
            }

            setSubmitError(
                error.response?.data?.message ||
                "Failed to create tenant. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-[#f7f9fc]">

            {/* =====================================================
                PAGE HEADER
            ====================================================== */}
            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-[1550px] px-6 py-6 xl:px-10">

                    <div className="flex items-center justify-between gap-6">

                        <div>
                            <Link
                                to="/admin/tenants"
                                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#7046f5]"
                            >
                                <ArrowLeft size={17} />
                                Back to tenants
                            </Link>

                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7046f5]/10">
                                    <Building2
                                        size={21}
                                        className="text-[#7046f5]"
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#19b5fe]">
                                        Organization Management
                                    </p>

                                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#07111f]">
                                        Create new tenant
                                    </h1>
                                </div>
                            </div>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                                Create a new organization, assign its administrator,
                                and configure the initial workspace settings.
                            </p>
                        </div>

                        {/* Status */}
                        <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:flex">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                                <ShieldCheck
                                    size={17}
                                    className="text-amber-600"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-700">
                                    Tenant onboarding
                                </p>

                                <p className="text-[11px] text-slate-400">
                                    Initial setup
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                FORM CONTENT
            ====================================================== */}
            <div className="mx-auto max-w-[1550px] px-6 py-8 xl:px-10">

                {/* Submit Error */}
                {submitError && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0 text-red-500"
                        />

                        <div>
                            <p className="text-sm font-semibold text-red-700">
                                Unable to create tenant
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                                {submitError}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

                        {/* LEFT */}
                        <div className="space-y-6">

                            <TenantBasicInfo
                                formData={formData}
                                onChange={handleChange}
                                errors={errors}
                            />

                            <TenantAdminInfo
                                formData={formData}
                                onChange={handleChange}
                                errors={errors}
                            />

                            <TenantSettings
                                formData={formData}
                                onChange={handleChange}
                            />

                            {/* Submit Actions */}
                            <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">

                                <Link
                                    to="/admin/tenants"
                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7046f5] px-6 text-sm font-semibold text-white shadow-lg shadow-[#7046f5]/20 transition hover:bg-[#825cf7] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />

                                            Creating tenant...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={17} />

                                            Create tenant
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="space-y-6">

                            {/* Setup summary */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5">

                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#19b5fe]/10">
                                        <Settings2
                                            size={18}
                                            className="text-[#19b5fe]"
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-[#07111f]">
                                            Setup summary
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Tenant configuration
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Organization
                                        </span>

                                        <span className="max-w-[180px] truncate text-right text-sm font-medium text-slate-700">
                                            {formData.name || "Not configured"}
                                        </span>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Administrator
                                        </span>

                                        <span className="max-w-[180px] truncate text-right text-sm font-medium text-slate-700">
                                            {formData.admin_first_name ||
                                            formData.admin_last_name
                                                ? `${formData.admin_first_name} ${formData.admin_last_name}`.trim()
                                                : "Not assigned"}
                                        </span>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">
                                            Plan
                                        </span>

                                        <span className="text-sm font-medium capitalize text-slate-700">
                                            {formData.plan}
                                        </span>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">
                                            Locale
                                        </span>

                                        <span className="text-sm font-medium text-slate-700">
                                            {formData.locale}
                                        </span>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Status
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-600">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            {formData.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Help */}
                            <div className="rounded-2xl border border-[#19b5fe]/10 bg-gradient-to-br from-[#19b5fe]/5 to-[#7046f5]/5 p-5">
                                <h3 className="text-sm font-semibold text-[#07111f]">
                                    Tenant onboarding
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    After creating the organization, you can configure
                                    branding, workspace preferences, feature flags,
                                    administrators and access policies.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTenantPage;