import {
    Building2,
    LoaderCircle,
    Search,
    ShieldCheck,
    X,
} from "lucide-react";

import {
    useMemo,
    useState,
} from "react";

const SecurityGroupCompanyAccessModal = ({
    group,
    companies = [],
    restrictions = [],
    loading = false,
    onClose,
    onChangeAccess,
}) => {
    /**
     * --------------------------------------------------------------------------
     * Search
     * --------------------------------------------------------------------------
     */

    const [search, setSearch] =
        useState("");


    /**
     * --------------------------------------------------------------------------
     * Company Restriction Map
     * --------------------------------------------------------------------------
     */

    const companyRestrictions =
        useMemo(() => {
            const map =
                new Map();

            restrictions
                .filter(
                    (restriction) =>
                        restriction.resource_type ===
                        "company"
                )
                .forEach(
                    (restriction) => {
                        map.set(
                            restriction.resource_id,
                            restriction
                        );
                    }
                );

            return map;
        }, [restrictions]);


    /**
     * --------------------------------------------------------------------------
     * Filter Companies
     * --------------------------------------------------------------------------
     */

    const filteredCompanies =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return companies;
            }

            return companies.filter(
                (company) =>
                    company.name
                        ?.toLowerCase()
                        .includes(
                            keyword
                        ) ||
                    company.legal_name
                        ?.toLowerCase()
                        .includes(
                            keyword
                        ) ||
                    company.slug
                        ?.toLowerCase()
                        .includes(
                            keyword
                        )
            );
        }, [
            companies,
            search,
        ]);


    /**
     * --------------------------------------------------------------------------
     * Restriction State
     * --------------------------------------------------------------------------
     *
     * Important:
     *
     * 0 company restrictions
     * = Security Group is unrestricted
     * = Members can access all companies
     *
     * 1+ company restrictions
     * = Restricted mode
     * = Only explicitly configured companies are accessible
     *
     */

    const restrictedCount =
        companyRestrictions.size;

    const hasRestrictions =
        restrictedCount > 0;


    /**
     * --------------------------------------------------------------------------
     * Effective Access
     * --------------------------------------------------------------------------
     */

    const getAccessLevel = (
        companyId
    ) => {
        const restriction =
            companyRestrictions.get(
                companyId
            );

        if (restriction) {
            return (
                restriction.access_level
            );
        }

        return hasRestrictions
            ? "none"
            : "unrestricted";
    };


    /**
     * --------------------------------------------------------------------------
     * Change Access
     * --------------------------------------------------------------------------
     */

    const handleChange = async (
        company,
        accessLevel
    ) => {
        const existingRestriction =
            companyRestrictions.get(
                company.id
            ) || null;

        await onChangeAccess?.({
            company,
            accessLevel,
            restriction:
                existingRestriction,
        });
    };


    /**
     * --------------------------------------------------------------------------
     * Render
     * --------------------------------------------------------------------------
     */

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]">
            <div className="flex max-h-[88vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#159edb]">
                            <Building2
                                size={20}
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-[#07111f]">
                                Manage Company Access
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Control which
                                companies members
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {group?.name}
                                </span>{" "}
                                can access.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        disabled={
                            loading
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X
                            size={18}
                        />
                    </button>
                </div>


                {/* Toolbar */}
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                                Company Restrictions
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {restrictedCount}{" "}
                                configured
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-[320px]">
                            <Search
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search companies..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                            />
                        </div>
                    </div>
                </div>


                {/* Content */}
                <div className="overflow-y-auto px-6 py-5">

                    {/* Access explanation */}
                    <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
                        <div className="flex gap-3">
                            <ShieldCheck
                                size={18}
                                className="mt-0.5 shrink-0 text-sky-600"
                            />

                            <div>
                                <p className="text-sm font-semibold text-sky-900">
                                    How company access works
                                </p>

                                <p className="mt-1 text-xs leading-5 text-sky-700">
                                    When no company
                                    restrictions exist,
                                    this group has
                                    unrestricted company
                                    access. Once a company
                                    restriction is added,
                                    only explicitly
                                    configured companies
                                    are accessible.
                                </p>
                            </div>
                        </div>
                    </div>


                    {/* Loading */}
                    {loading &&
                    !companies.length ? (
                        <div className="flex min-h-[260px] items-center justify-center">
                            <div className="text-center">
                                <LoaderCircle
                                    size={28}
                                    className="mx-auto animate-spin text-[#19b5fe]"
                                />

                                <p className="mt-3 text-sm text-slate-500">
                                    Loading company
                                    access...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">

                            {/* Companies */}
                            {filteredCompanies.map(
                                (
                                    company
                                ) => {
                                    const currentAccess =
                                        getAccessLevel(
                                            company.id
                                        );

                                    return (
                                        <div
                                            key={
                                                company.id
                                            }
                                            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                                    <Building2
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-[#07111f]">
                                                        {
                                                            company.name
                                                        }
                                                    </p>

                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                                        {company.status && (
                                                            <span className="capitalize">
                                                                {
                                                                    company.status
                                                                }
                                                            </span>
                                                        )}

                                                        {company.slug && (
                                                            <>
                                                                <span>
                                                                    •
                                                                </span>

                                                                <span className="truncate">
                                                                    {
                                                                        company.slug
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>


                                            {/* Access Level */}
                                            <div className="w-full sm:w-[190px]">
                                                <select
                                                    value={
                                                        currentAccess
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleChange(
                                                            company,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                                                >
                                                    {!hasRestrictions && (
                                                        <option value="unrestricted">
                                                            Unrestricted
                                                        </option>
                                                    )}

                                                    {hasRestrictions && (
                                                        <option value="none">
                                                            No Access
                                                        </option>
                                                    )}

                                                    <option value="view">
                                                        View
                                                    </option>

                                                    <option value="edit">
                                                        Edit
                                                    </option>

                                                    <option value="manage">
                                                        Manage
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                }
                            )}


                            {/* Empty Result */}
                            {!filteredCompanies.length && (
                                <div className="rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center">
                                    <Building2
                                        size={28}
                                        className="mx-auto text-slate-300"
                                    />

                                    <h3 className="mt-3 text-sm font-semibold text-slate-700">
                                        No companies found
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Try another
                                        company search.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>


                {/* Footer */}
                <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            disabled={
                                loading
                            }
                            className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityGroupCompanyAccessModal;