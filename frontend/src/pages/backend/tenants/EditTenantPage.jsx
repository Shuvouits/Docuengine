import {
    ArrowLeft,
    Building2,
    Clock3,
    Globe,
    Save,
    Settings2,
    ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../../../api/axios";

function EditTenantPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        status: "onboarding",
        locale: "en-US",
        timezone: "America/New_York",
    });

    /*
    |--------------------------------------------------------------------------
    | Fetch Tenant
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.get(`/tenants/${id}`);

                const tenant = response.data?.data;

                if (!tenant) {
                    throw new Error("Tenant data was not found.");
                }

                setForm({
                    name: tenant.name || "",
                    slug: tenant.slug || "",
                    status: tenant.status || "onboarding",
                    locale: tenant.locale || "en-US",
                    timezone:
                        tenant.timezone || "America/New_York",
                });
            } catch (err) {
                console.error("Failed to load tenant:", err);

                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Failed to load tenant."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTenant();
        }
    }, [id]);

    /*
    |--------------------------------------------------------------------------
    | Input Handler
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError(null);
        setSuccess(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Update Tenant
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                name: form.name.trim(),
                slug: form.slug.trim().toLowerCase(),
                status: form.status,
                locale: form.locale,
                timezone: form.timezone,
            };

            await api.put(`/tenants/${id}`, payload);

            setSuccess("Tenant updated successfully.");

            /*
             * Small delay so user can see success message
             */
            setTimeout(() => {
                navigate("/admin/tenants");
            }, 700);
        } catch (err) {
            console.error("Failed to update tenant:", err);

            const validationErrors =
                err.response?.data?.errors;

            if (validationErrors) {
                const firstError = Object.values(
                    validationErrors
                )?.[0]?.[0];

                setError(
                    firstError ||
                        "Please check the form and try again."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                        "Failed to update tenant."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="min-h-full bg-[#f7f9fc]">
                <div className="flex min-h-[500px] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#7046f5]" />

                        <p className="text-sm text-slate-500">
                            Loading tenant...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Error State
    |--------------------------------------------------------------------------
    */

    if (error && !form.name) {
        return (
            <div className="min-h-full bg-[#f7f9fc]">
                <div className="mx-auto max-w-[1550px] px-6 py-8 xl:px-10">
                    <Link
                        to="/admin/tenants"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#7046f5]"
                    >
                        <ArrowLeft size={17} />
                        Back to tenants
                    </Link>

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#f7f9fc]">
            {/* =====================================================
                PAGE HEADER
            ====================================================== */}

            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-[1550px] px-6 py-6 xl:px-10">
                    <div className="flex items-center justify-between gap-6">
                        <div>
                            {/* Back */}

                            <Link
                                to="/admin/tenants"
                                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#7046f5]"
                            >
                                <ArrowLeft size={17} />
                                Back to tenants
                            </Link>

                            {/* Title */}

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
                                        Edit tenant
                                    </h1>
                                </div>
                            </div>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                                Update organization information and
                                workspace configuration for this tenant.
                            </p>
                        </div>

                        {/* Status */}

                        <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:flex">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                                <ShieldCheck
                                    size={17}
                                    className="text-emerald-600"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-700">
                                    Tenant configuration
                                </p>

                                <p className="text-[11px] text-slate-400">
                                    Editing workspace
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                FORM CONTENT
            ====================================================== */}

            <form onSubmit={handleSubmit}>
                <div className="mx-auto max-w-[1550px] px-6 py-8 xl:px-10">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

                        {/* =================================================
                            LEFT
                        ================================================== */}

                        <div className="space-y-6">

                            {/* Organization Information */}

                            <section className="rounded-2xl border border-slate-200 bg-white">
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

                                <div className="space-y-5 p-6">
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                        {/* Organization Name */}

                                        <div className="md:col-span-2">
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Organization name
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                placeholder="e.g. Acme Corporation"
                                                required
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
                                            />
                                        </div>

                                        {/* Tenant Code / Slug */}

                                        <div className="md:col-span-2">
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Tenant code
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="slug"
                                                value={form.slug}
                                                onChange={handleChange}
                                                placeholder="acme-corporation"
                                                required
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm lowercase text-slate-700 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
                                            />

                                            <p className="mt-1.5 text-[11px] text-slate-400">
                                                Unique identifier used internally by the platform.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Workspace Settings */}

                            <section className="rounded-2xl border border-slate-200 bg-white">
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
                                                Configure the tenant environment.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 p-6">
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

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
                                                    value={form.locale}
                                                    onChange={handleChange}
                                                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
                                                >
                                                    <option value="en-US">
                                                        English (United States)
                                                    </option>

                                                    <option value="en-GB">
                                                        English (United Kingdom)
                                                    </option>

                                                    <option value="fr-FR">
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
                                                    value={form.timezone}
                                                    onChange={handleChange}
                                                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
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

                                                    <option value="UTC">
                                                        UTC
                                                    </option>

                                                    <option value="Asia/Dhaka">
                                                        Bangladesh Time (BST)
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Status */}

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Status
                                            </label>

                                            <select
                                                name="status"
                                                value={form.status}
                                                onChange={handleChange}
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#7046f5] focus:ring-4 focus:ring-[#7046f5]/10"
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
                                </div>
                            </section>

                            {/* Error */}

                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-sm font-medium text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Success */}

                            {success && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                    <p className="text-sm font-medium text-emerald-600">
                                        {success}
                                    </p>
                                </div>
                            )}

                            {/* Mobile / Main Actions */}

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Link
                                    to="/admin/tenants"
                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7046f5] px-6 text-sm font-semibold text-white shadow-lg shadow-[#7046f5]/20 transition hover:bg-[#825cf7] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            Save changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* =================================================
                            RIGHT SIDEBAR
                        ================================================== */}

                        <div className="space-y-6">

                            {/* Configuration Summary */}

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
                                            Configuration summary
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Current tenant settings
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">

                                    {/* Organization */}

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Organization
                                        </span>

                                        <span className="max-w-[180px] truncate text-right text-sm font-medium text-slate-700">
                                            {form.name || "Not configured"}
                                        </span>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    {/* Tenant Code */}

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Tenant code
                                        </span>

                                        <span className="max-w-[180px] truncate text-right text-sm font-medium text-slate-700">
                                            {form.slug || "Not configured"}
                                        </span>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    {/* Locale */}

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Locale
                                        </span>

                                        <span className="text-sm font-medium text-slate-700">
                                            {form.locale}
                                        </span>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    {/* Timezone */}

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Timezone
                                        </span>

                                        <span className="max-w-[180px] truncate text-right text-sm font-medium text-slate-700">
                                            {form.timezone}
                                        </span>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    {/* Status */}

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">
                                            Status
                                        </span>

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                form.status === "active"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : form.status ===
                                                        "suspended"
                                                    ? "bg-red-50 text-red-600"
                                                    : "bg-amber-50 text-amber-600"
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    form.status === "active"
                                                        ? "bg-emerald-500"
                                                        : form.status ===
                                                            "suspended"
                                                        ? "bg-red-500"
                                                        : "bg-amber-500"
                                                }`}
                                            />

                                            {form.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                form.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Help */}

                            <div className="rounded-2xl border border-[#19b5fe]/10 bg-gradient-to-br from-[#19b5fe]/5 to-[#7046f5]/5 p-5">
                                <h3 className="text-sm font-semibold text-[#07111f]">
                                    Tenant configuration
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    Update the organization identity,
                                    locale, timezone and access status.
                                    Additional workspace configuration
                                    can be managed after the tenant is
                                    updated.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EditTenantPage;