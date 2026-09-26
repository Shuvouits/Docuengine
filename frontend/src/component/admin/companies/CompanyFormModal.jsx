import {
    Building2,
    LoaderCircle,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

const emptyForm = {
    name: "",
    legal_name: "",
    slug: "",
    website: "",

    primary_contact_name: "",
    primary_contact_email: "",
    primary_contact_phone: "",

    address_line1: "",
    address_line2: "",
    city: "",
    state_region: "",
    postal_code: "",
    country: "",

    description: "",
    notes: "",

    status: "active",
};

const generateSlug = (value = "") => {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const CompanyFormModal = ({
    open = false,
    company = null,
    saving = false,
    onClose,
    onSubmit,
}) => {
    const [form, setForm] =
        useState(emptyForm);

    const [error, setError] =
        useState("");

    const [
        slugManuallyEdited,
        setSlugManuallyEdited,
    ] = useState(false);

    const isEditing =
        Boolean(company?.id);

    useEffect(() => {
        if (!open) {
            return;
        }

        setError("");

        if (!company) {
            setForm(emptyForm);
            setSlugManuallyEdited(false);

            return;
        }

        setSlugManuallyEdited(true);

        setForm({
            name:
                company.name || "",

            legal_name:
                company.legal_name || "",

            slug:
                company.slug || "",

            website:
                company.website || "",

            primary_contact_name:
                company.contact?.name || "",

            primary_contact_email:
                company.contact?.email || "",

            primary_contact_phone:
                company.contact?.phone || "",

            address_line1:
                company.address?.line1 || "",

            address_line2:
                company.address?.line2 || "",

            city:
                company.address?.city || "",

            state_region:
                company.address?.state_region || "",

            postal_code:
                company.address?.postal_code || "",

            country:
                company.address?.country || "",

            description:
                company.description || "",

            notes:
                company.notes || "",

            status:
                company.status || "active",
        });
    }, [
        open,
        company,
    ]);

    if (!open) {
        return null;
    }

    const handleChange = (
        field,
        value
    ) => {
        if (field === "name") {
            setForm((previous) => ({
                ...previous,

                name: value,

                ...(
                    !isEditing &&
                    !slugManuallyEdited
                        ? {
                              slug: generateSlug(
                                  value
                              ),
                          }
                        : {}
                ),
            }));

            return;
        }

        if (field === "slug") {
            setSlugManuallyEdited(true);

            setForm((previous) => ({
                ...previous,

                slug: generateSlug(
                    value
                ),
            }));

            return;
        }

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setError("");

        if (!form.name.trim()) {
            setError(
                "Company name is required."
            );

            return;
        }

        const result =
            await onSubmit(form);

        if (
            result &&
            result.ok === false
        ) {
            setError(
                result.message ||
                    "Unable to save company."
            );
        }
    };

    const inputClass =
        "mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#19b5fe] focus:ring-2 focus:ring-[#19b5fe]/10";

    const textareaClass =
        "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#19b5fe] focus:ring-2 focus:ring-[#19b5fe]/10";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
            <div className="flex max-h-[92vh] w-full max-w-[850px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#159edb]">
                            <Building2 size={18} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {isEditing
                                    ? "Edit Company"
                                    : "Add Company"}
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                                {isEditing
                                    ? "Update company profile and business information."
                                    : "Create a new company workspace."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-bold text-slate-800">
                                Company Information
                            </h3>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <label className="text-xs font-semibold text-slate-600">
                                    Company Name *

                                    <input
                                        value={
                                            form.name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "name",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                        placeholder="Acme Corporation"
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    Legal Name

                                    <input
                                        value={
                                            form.legal_name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "legal_name",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    Slug

                                    <input
                                        value={
                                            form.slug
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "slug",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                        placeholder="acme-corporation"
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    Website

                                    <input
                                        value={
                                            form.website
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "website",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                        placeholder="https://example.com"
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    Status

                                    <select
                                        value={
                                            form.status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "status",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="mt-7 border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-bold text-slate-800">
                                Primary Contact
                            </h3>

                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <label className="text-xs font-semibold text-slate-600">
                                    Contact Name

                                    <input
                                        value={
                                            form.primary_contact_name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "primary_contact_name",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    Email

                                    <input
                                        type="email"
                                        value={
                                            form.primary_contact_email
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "primary_contact_email",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    Phone

                                    <input
                                        value={
                                            form.primary_contact_phone
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "primary_contact_phone",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="mt-7 border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-bold text-slate-800">
                                Location
                            </h3>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <label className="text-xs font-semibold text-slate-600 md:col-span-2">
                                    Address Line 1

                                    <input
                                        value={
                                            form.address_line1
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "address_line1",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600 md:col-span-2">
                                    Address Line 2

                                    <input
                                        value={
                                            form.address_line2
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "address_line2",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    City

                                    <input
                                        value={
                                            form.city
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "city",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    State / Region

                                    <input
                                        value={
                                            form.state_region
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "state_region",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    Postal Code

                                    <input
                                        value={
                                            form.postal_code
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "postal_code",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    Country

                                    <input
                                        value={
                                            form.country
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "country",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="mt-7 border-t border-slate-100 pt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="text-xs font-semibold text-slate-600">
                                    Description

                                    <textarea
                                        rows={5}
                                        value={
                                            form.description
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "description",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            textareaClass
                                        }
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-600">
                                    Internal Notes

                                    <textarea
                                        rows={5}
                                        value={
                                            form.notes
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleChange(
                                                "notes",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={
                                            textareaClass
                                        }
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="h-10 min-w-[100px] rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex h-10 min-w-[130px] items-center justify-center gap-2 rounded-lg bg-[#19b5fe] px-4 text-sm font-semibold text-white transition hover:bg-[#0da7eb] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving && (
                                <LoaderCircle
                                    size={15}
                                    className="animate-spin"
                                />
                            )}

                            {isEditing
                                ? "Save Changes"
                                : "Create Company"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyFormModal;