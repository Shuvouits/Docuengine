import {
    Building2,
    ChevronRight,
    Search,
} from "lucide-react";

function CompanySelectorPanel({
    companies = [],
    selectedCompanyId = null,
    search = "",
    onSearchChange = () => {},
    onSelect = () => {},
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                            color:
                                "var(--brand-primary)",
                            backgroundColor:
                                "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
                        }}
                    >
                        <Building2 size={19} />
                    </div>

                    <div>
                        <h2 className="text-sm font-bold text-[#07111f]">
                            Managed Companies
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Select a company to manage
                            its layouts.
                        </p>
                    </div>
                </div>

                <div className="relative mt-4">
                    <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            onSearchChange(
                                event.target.value
                            )
                        }
                        placeholder="Search companies..."
                        className="
                            h-11 w-full rounded-xl
                            border border-slate-200
                            bg-white pl-10 pr-4
                            text-sm text-slate-700
                            outline-none transition
                            placeholder:text-slate-400
                            focus:ring-4
                        "
                        style={{
                            "--tw-ring-color":
                                "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
                        }}
                    />
                </div>
            </div>

            <div className="max-h-[620px] overflow-y-auto p-2">
                {companies.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <Building2
                            size={28}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                            No companies found
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                            No managed companies match
                            the current search.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {companies.map(
                            (company) => {
                                const active =
                                    selectedCompanyId ===
                                    company.id;

                                return (
                                    <button
                                        key={
                                            company.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            onSelect(
                                                company
                                            )
                                        }
                                        className={`
                                            flex w-full
                                            items-center gap-3
                                            rounded-xl px-3
                                            py-3 text-left
                                            transition
                                            ${
                                                active
                                                    ? ""
                                                    : "hover:bg-slate-50"
                                            }
                                        `}
                                        style={
                                            active
                                                ? {
                                                      backgroundColor:
                                                          "color-mix(in srgb, var(--brand-primary) 9%, transparent)",
                                                  }
                                                : undefined
                                        }
                                    >
                                        <div
                                            className="
                                                flex h-10 w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                            "
                                            style={{
                                                color:
                                                    active
                                                        ? "var(--brand-primary)"
                                                        : "#64748b",
                                                backgroundColor:
                                                    active
                                                        ? "color-mix(in srgb, var(--brand-primary) 12%, transparent)"
                                                        : "#f8fafc",
                                            }}
                                        >
                                            <Building2
                                                size={
                                                    18
                                                }
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-[#07111f]">
                                                {
                                                    company.name
                                                }
                                            </p>

                                            <div className="mt-1 flex items-center gap-1.5">
                                                <span
                                                    className={`
                                                        h-1.5
                                                        w-1.5
                                                        rounded-full
                                                        ${
                                                            company.status ===
                                                                "inactive" ||
                                                            company.is_active ===
                                                                false
                                                                ? "bg-amber-400"
                                                                : "bg-emerald-400"
                                                        }
                                                    `}
                                                />

                                                <span className="text-[11px] capitalize text-slate-400">
                                                    {company.status ||
                                                        (company.is_active ===
                                                        false
                                                            ? "inactive"
                                                            : "active")}
                                                </span>
                                            </div>
                                        </div>

                                        <ChevronRight
                                            size={16}
                                            className={
                                                active
                                                    ? ""
                                                    : "text-slate-300"
                                            }
                                            style={
                                                active
                                                    ? {
                                                          color:
                                                              "var(--brand-primary)",
                                                      }
                                                    : undefined
                                            }
                                        />
                                    </button>
                                );
                            }
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompanySelectorPanel;