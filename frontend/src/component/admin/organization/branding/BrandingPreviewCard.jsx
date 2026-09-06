import {
    Building2,
    LayoutDashboard,
    Settings,
} from "lucide-react";

function BrandingPreviewCard({
    organization,
    branding,
    form,
    logoPreview,
}) {
    const logo =
        logoPreview ||
        branding?.logo_url ||
        null;

    const displayName =
        branding?.display_name ||
        organization?.name ||
        "Organization";

    const primaryColor =
        isValidHex(form.primary_color)
            ? form.primary_color
            : "#19b5fe";

    const secondaryColor =
        isValidHex(
            form.secondary_color
        )
            ? form.secondary_color
            : "#f4f7f5";

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-100 px-6 py-5">

                <h2 className="text-sm font-bold text-slate-900">
                    Branding Preview
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                    Preview of the current organization identity.
                </p>

            </div>

            <div className="p-6">

                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">

                    <div
                        className="flex min-h-[300px]"
                        style={{
                            backgroundColor:
                                secondaryColor,
                        }}
                    >

                        {/* Preview Sidebar */}

                        <div
                            className="w-[185px] shrink-0 p-4 text-white"
                            style={{
                                backgroundColor:
                                    form.sidebar_style ===
                                    "light"
                                        ? "#ffffff"
                                        : "#07111f",

                                color:
                                    form.sidebar_style ===
                                    "light"
                                        ? "#0f172a"
                                        : "#ffffff",
                            }}
                        >

                            <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white">

                                    {logo ? (
                                        <img
                                            src={logo}
                                            alt="Brand preview"
                                            className="h-full w-full object-contain p-1"
                                        />
                                    ) : (
                                        <Building2
                                            size={18}
                                            style={{
                                                color: primaryColor,
                                            }}
                                        />
                                    )}

                                </div>

                                <div className="min-w-0">

                                    <p className="truncate text-xs font-bold">
                                        {displayName}
                                    </p>

                                    <p className="mt-0.5 text-[8px] opacity-60">
                                        Workspace
                                    </p>

                                </div>

                            </div>

                            <div className="mt-7 space-y-2">

                                <PreviewMenu
                                    icon={LayoutDashboard}
                                    label="Dashboard"
                                    active
                                    primaryColor={
                                        primaryColor
                                    }
                                />

                                <PreviewMenu
                                    icon={Building2}
                                    label="Overview"
                                    primaryColor={
                                        primaryColor
                                    }
                                />

                                <PreviewMenu
                                    icon={Settings}
                                    label="Settings"
                                    primaryColor={
                                        primaryColor
                                    }
                                />

                            </div>

                        </div>

                        {/* Preview Content */}

                        <div className="flex-1 p-5">

                            <div className="rounded-xl bg-white p-5 shadow-sm">

                                <div className="flex items-center gap-3">

                                    <div
                                        className="h-10 w-10 rounded-xl"
                                        style={{
                                            backgroundColor:
                                                primaryColor,
                                        }}
                                    />

                                    <div>

                                        <div className="h-2.5 w-28 rounded bg-slate-800" />

                                        <div className="mt-2 h-2 w-20 rounded bg-slate-200" />

                                    </div>

                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">

                                    <div
                                        className="h-20 border border-slate-100 bg-slate-50"
                                        style={{
                                            borderRadius:
                                                form.border_radius ||
                                                "12px",
                                        }}
                                    />

                                    <div
                                        className="h-20 border border-slate-100 bg-slate-50"
                                        style={{
                                            borderRadius:
                                                form.border_radius ||
                                                "12px",
                                        }}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}

function PreviewMenu({
    icon: Icon,
    label,
    active = false,
    primaryColor,
}) {
    return (
        <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[10px]"
            style={{
                backgroundColor:
                    active
                        ? `${primaryColor}22`
                        : "transparent",

                color:
                    active
                        ? primaryColor
                        : "inherit",
            }}
        >
            <Icon size={13} />

            {label}
        </div>
    );
}

function isValidHex(value) {
    return /^#[0-9A-Fa-f]{6}$/.test(
        value || ""
    );
}

export default BrandingPreviewCard;