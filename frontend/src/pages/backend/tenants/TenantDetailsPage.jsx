import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    Globe2,
    Hash,
    LoaderCircle,
    MapPin,
    ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../../../api/axios";

const TenantDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTenant = async () => {
            if (!id) {
                return;
            }

            setLoading(true);
            setError("");

            try {
                const response = await api.get(
                    `/tenants/${id}`
                );

                setTenant(
                    response.data?.data || null
                );
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Unable to load tenant details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTenant();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[450px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={30}
                        className="mx-auto animate-spin text-[#19b5fe]"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading tenant details...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
                <h2 className="font-semibold text-red-700">
                    Tenant unavailable
                </h2>

                <p className="mt-1 text-sm text-red-600">
                    {error ||
                        "Tenant information could not be found."}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/admin/tenants")
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600"
                >
                    <ArrowLeft size={16} />
                    Back to tenants
                </button>
            </div>
        );
    }

    const initials = String(
        tenant.name || "Tenant"
    )
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    return (
        <div className="space-y-7">
            {/* Header */}

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/tenants")
                        }
                        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#19b5fe]"
                    >
                        <ArrowLeft size={16} />
                        MSP Organizations
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#19b5fe]/15 to-[#7046f5]/15 text-lg font-bold text-[#7046f5]">
                            {initials}
                        </div>

                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#19b5fe]">
                                    MSP Organization
                                </span>

                                <StatusBadge
                                    status={tenant.status}
                                />
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-[#07111f] lg:text-3xl">
                                {tenant.name}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Review organization identity,
                                regional settings and platform
                                status.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/admin/tenants/${tenant.id}/edit`
                        )
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7046f5] px-5 text-sm font-semibold text-white shadow-lg shadow-[#7046f5]/20 transition hover:bg-[#825cf7]"
                >
                    <Edit3 size={17} />
                    Edit Tenant
                </button>
            </div>

            {/* Summary */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Status"
                    value={formatLabel(
                        tenant.status
                    )}
                    description="Current organization lifecycle"
                    icon={CheckCircle2}
                />

                <SummaryCard
                    title="Locale"
                    value={tenant.locale || "Not set"}
                    description="Default organization locale"
                    icon={Globe2}
                />

                <SummaryCard
                    title="Timezone"
                    value={
                        tenant.timezone || "Not set"
                    }
                    description="Organization timezone"
                    icon={Clock3}
                    compact
                />

                <SummaryCard
                    title="Created"
                    value={formatDate(
                        tenant.created_at
                    )}
                    description="Platform registration date"
                    icon={CalendarDays}
                    compact
                />
            </div>

            {/* Main details */}

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <SectionHeader
                        icon={Building2}
                        title="Organization Details"
                        description="Core information registered for this MSP."
                    />

                    <div className="px-6 py-2">
                        <DetailRow
                            label="Organization Name"
                            value={tenant.name}
                        />

                        <DetailRow
                            label="Slug"
                            value={tenant.slug}
                            mono
                        />

                        <DetailRow
                            label="Status"
                            value={formatLabel(
                                tenant.status
                            )}
                        />

                        <DetailRow
                            label="Locale"
                            value={tenant.locale}
                        />

                        <DetailRow
                            label="Timezone"
                            value={tenant.timezone}
                        />

                        <DetailRow
                            label="Created At"
                            value={formatDateTime(
                                tenant.created_at
                            )}
                        />

                        <DetailRow
                            label="Last Updated"
                            value={formatDateTime(
                                tenant.updated_at
                            )}
                        />
                    </div>
                </section>

                <div className="space-y-6">
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <SectionHeader
                            icon={ShieldCheck}
                            title="Platform Identity"
                            description="Internal tenant information."
                        />

                        <div className="p-6">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10">
                                        <Hash
                                            size={18}
                                            className="text-[#19b5fe]"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-500">
                                            Tenant ID
                                        </p>

                                        <p className="mt-1 break-all font-mono text-xs font-semibold leading-5 text-slate-700">
                                            {tenant.id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <SectionHeader
                            icon={MapPin}
                            title="Regional Context"
                            description="Current localization settings."
                        />

                        <div className="px-6 py-2">
                            <DetailRow
                                label="Language / Locale"
                                value={
                                    tenant.locale
                                }
                            />

                            <DetailRow
                                label="Timezone"
                                value={
                                    tenant.timezone
                                }
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({
    title,
    value,
    description,
    icon: Icon,
    compact = false,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe]/10 to-[#7046f5]/10">
                <Icon
                    size={20}
                    className="text-[#7046f5]"
                />
            </div>

            <p className="mt-5 text-xs font-medium text-slate-500">
                {title}
            </p>

            <p
                className={`mt-1 font-bold text-[#07111f] ${
                    compact
                        ? "text-lg"
                        : "text-2xl"
                }`}
            >
                {value}
            </p>

            <p className="mt-2 text-xs text-slate-400">
                {description}
            </p>
        </div>
    );
};

const SectionHeader = ({
    icon: Icon,
    title,
    description,
}) => {
    return (
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10">
                <Icon
                    size={17}
                    className="text-[#19b5fe]"
                />
            </div>

            <div>
                <h2 className="text-sm font-bold text-slate-900">
                    {title}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
};

const DetailRow = ({
    label,
    value,
    mono = false,
}) => {
    return (
        <div className="flex items-center justify-between gap-5 border-b border-slate-100 py-4 last:border-0">
            <span className="text-xs text-slate-500">
                {label}
            </span>

            <span
                className={`max-w-[65%] break-all text-right text-xs font-semibold text-slate-800 ${
                    mono ? "font-mono" : ""
                }`}
            >
                {value || "Not set"}
            </span>
        </div>
    );
};

const StatusBadge = ({
    status,
}) => {
    const value = String(
        status || ""
    ).toLowerCase();

    const styles = {
        active:
            "bg-emerald-50 text-emerald-700",
        suspended:
            "bg-amber-50 text-amber-700",
        archived:
            "bg-slate-100 text-slate-600",
        inactive:
            "bg-red-50 text-red-600",
        onboarding:
            "bg-blue-50 text-blue-600",
    };

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                styles[value] ||
                "bg-slate-100 text-slate-600"
            }`}
        >
            {formatLabel(status)}
        </span>
    );
};

const formatLabel = (
    value
) => {
    if (!value) {
        return "Unknown";
    }

    return String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
};

const formatDate = (
    value
) => {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );
};

const formatDateTime = (
    value
) => {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString();
};

export default TenantDetailsPage;