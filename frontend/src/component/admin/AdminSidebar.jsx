import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Building2,
    Settings,
    LogOut,
    X,
    Palette,
    Flag,
    Languages,
    Clock3,
    Users,
    UserPlus,
    Shield,
    KeyRound,
    ClipboardCheck,
    Activity,
    Network,
    Monitor,
    Lock,
    ScrollText,
    Archive,
    LayoutTemplate,
    ListChecks,
} from "lucide-react";

function AdminSidebar({
    mobileOpen = false,
    onClose = () => {},
    authData = null,
    authLoading = false,
}) {
    const navigate = useNavigate();

    const user = authData?.user || null;
    const currentTenant = authData?.current_tenant || null;

    const isPlatformOwner = Boolean(user?.is_platform_owner);

    /*
    |--------------------------------------------------------------------------
    | Roles & Permissions
    |--------------------------------------------------------------------------
    */

    const tenantRoles =
        currentTenant?.access?.roles || [];

    const tenantPermissions =
        currentTenant?.access?.permissions || [];

    const hasRole = (role) =>
        tenantRoles.includes(role);

    const can = (permission) =>
        tenantPermissions.includes(permission);

    const isTenantAdmin =
        hasRole("MSP Admin") ||
        currentTenant?.membership?.role === "admin";

    /*
    |--------------------------------------------------------------------------
    | Feature Flags
    |--------------------------------------------------------------------------
    */

    const featureFlags =
        currentTenant?.feature_flags || {};

    const isFeatureEnabled = (key) => {
        if (Array.isArray(featureFlags)) {
            const feature = featureFlags.find((item) => {
                if (typeof item === "string") {
                    return item === key;
                }

                return (
                    item?.key === key ||
                    item?.name === key ||
                    item?.slug === key
                );
            });

            if (!feature) {
                return false;
            }

            if (typeof feature === "string") {
                return true;
            }

            return Boolean(
                feature.enabled ??
                    feature.is_enabled ??
                    feature.value
            );
        }

        if (
            featureFlags &&
            typeof featureFlags === "object"
        ) {
            const feature = featureFlags[key];

            if (typeof feature === "boolean") {
                return feature;
            }

            if (typeof feature === "number") {
                return feature === 1;
            }

            if (typeof feature === "string") {
                return [
                    "1",
                    "true",
                    "enabled",
                    "on",
                ].includes(
                    feature.toLowerCase()
                );
            }

            if (
                feature &&
                typeof feature === "object"
            ) {
                return Boolean(
                    feature.enabled ??
                        feature.is_enabled ??
                        feature.value
                );
            }
        }

        return false;
    };

    /*
    |--------------------------------------------------------------------------
    | Organization Branding
    |--------------------------------------------------------------------------
    */

    const branding =
        currentTenant?.branding || null;

    const organizationName =
        branding?.display_name ||
        currentTenant?.name ||
        "Organization";

    const organizationLogo =
        branding?.logo_url || null;

    const tenantStatus =
        currentTenant?.status || null;

    const tenantTimezone =
        currentTenant?.timezone || null;

    const tenantRole =
        tenantRoles[0] ||
        currentTenant?.membership?.role ||
        null;

    /*
    |--------------------------------------------------------------------------
    | Sidebar Appearance
    |--------------------------------------------------------------------------
    */

    const sidebarStyle = String(
        branding?.custom_styles?.sidebar_style ||
            "dark"
    ).toLowerCase();

    const isLightSidebar =
        sidebarStyle === "light";

    const isBrandSidebar = [
        "brand",
        "branded",
        "primary",
    ].includes(sidebarStyle);

    const sidebarBackground =
        isLightSidebar
            ? "#ffffff"
            : isBrandSidebar
              ? "color-mix(in srgb, var(--brand-primary) 72%, #07111f)"
              : "#07111f";

    const sidebarBorderClass =
        isLightSidebar
            ? "border-slate-200"
            : "border-white/10";

    const primaryTextClass =
        isLightSidebar
            ? "text-slate-900"
            : "text-white";

    const secondaryTextClass =
        isLightSidebar
            ? "text-slate-500"
            : "text-slate-400";

    const mutedTextClass =
        isLightSidebar
            ? "text-slate-400"
            : "text-slate-500";

    /*
    |--------------------------------------------------------------------------
    | Platform
    |--------------------------------------------------------------------------
    */

    const platformItems = [
        ...(isPlatformOwner || isTenantAdmin
            ? [
                  {
                      label: "Dashboard",
                      path: "/admin/dashboard",
                      icon: LayoutDashboard,
                      end: true,
                  },
              ]
            : []),

        ...(isPlatformOwner
            ? [
                  {
                      label: "MSP Organizations",
                      path: "/admin/tenants",
                      icon: Building2,
                  },
              ]
            : []),
    ];

    /*
    |--------------------------------------------------------------------------
    | Organization
    |--------------------------------------------------------------------------
    */

    const organizationItems = currentTenant
        ? [
              ...(can("organization.view")
                  ? [
                        {
                            label: "Overview",
                            path: "/admin/organization",
                            icon: Building2,
                            end: true,
                        },
                    ]
                  : []),

              ...(can("organization.update")
                  ? [
                        {
                            label: "General Settings",
                            path: "/admin/organization/settings",
                            icon: Settings,
                        },
                        {
                            label: "Branding",
                            path: "/admin/organization/branding",
                            icon: Palette,
                        },
                        {
                            label: "Regional Settings",
                            path: "/admin/organization/regional",
                            icon: Clock3,
                        },
                        {
                            label: "Terminology",
                            path: "/admin/organization/terminology",
                            icon: Languages,
                        },
                        {
                            label: "Feature Flags",
                            path: "/admin/organization/feature-flags",
                            icon: Flag,
                        },
                    ]
                  : []),
          ]
        : [];

   

          /*
|--------------------------------------------------------------------------
| Documentation
|--------------------------------------------------------------------------
*/

const documentationItems = currentTenant
    ? [
          ...(
              isFeatureEnabled("asset_layouts") &&
              can("asset_layouts.view")
                  ? [
                        {
                            label: "Asset Layouts",
                            path: "/admin/asset-layouts",
                            icon: LayoutTemplate,
                        },
                    ]
                  : []
          ),

          ...(
              isFeatureEnabled("asset_layouts") &&
              can("option_lists.view")
                  ? [
                        {
                            label: "Option Lists",
                            path: "/admin/option-lists",
                            icon: ListChecks,
                        },
                    ]
                  : []
          ),

          ...(
              isFeatureEnabled("asset_layouts") &&
              can("asset_layouts.activate")
                  ? [
                        {
                            label: "Company Layouts",
                            path: "/admin/company-layouts",
                            icon: Building2,
                        },
                    ]
                  : []
          ),
      ]
    : [];

    /*
    |--------------------------------------------------------------------------
    | Identity & Access
    |--------------------------------------------------------------------------
    */

    const identityAccessItems = currentTenant
        ? [
              ...(can("users.view")
                  ? [
                        {
                            label: "Users",
                            path: "/admin/users",
                            icon: Users,
                        },
                    ]
                  : []),

              ...(can("users.invite")
                  ? [
                        {
                            label: "Invitations",
                            path: "/admin/invitations",
                            icon: UserPlus,
                        },
                    ]
                  : []),

              ...(can("roles.view")
                  ? [
                        {
                            label: "Roles & Permissions",
                            path: "/admin/roles",
                            icon: KeyRound,
                        },
                    ]
                  : []),

              ...(can("security_groups.view")
                  ? [
                        {
                            label: "Security Groups",
                            path: "/admin/security-groups",
                            icon: Shield,
                        },
                    ]
                  : []),

              ...(
                  can("access_reviews.view") &&
                  isFeatureEnabled(
                      "access_reviews"
                  )
                      ? [
                            {
                                label: "Access Reviews",
                                path: "/admin/access-reviews",
                                icon: ClipboardCheck,
                            },
                        ]
                      : []
              ),
          ]
        : [];

    /*
    |--------------------------------------------------------------------------
    | Security
    |--------------------------------------------------------------------------
    */

    const tenantSecurityItems = currentTenant
        ? [
              ...(
                  can("security.events.view") &&
                  isFeatureEnabled(
                      "security_events"
                  )
                      ? [
                            {
                                label: "Security Events",
                                path: "/admin/security-events",
                                icon: Activity,
                            },
                        ]
                      : []
              ),

              ...(
                  can(
                      "security.ip_allowlist.view"
                  ) &&
                  isFeatureEnabled("ip_access")
                      ? [
                            {
                                label: "IP Access",
                                path: "/admin/ip-access",
                                icon: Network,
                            },
                        ]
                      : []
              ),
          ]
        : [];

    /*
    |--------------------------------------------------------------------------
    | Audit & Archive
    |--------------------------------------------------------------------------
    */

    const auditArchiveItems = currentTenant
        ? [
              ...(can("audit.view")
                  ? [
                        {
                            label: "Audit Logs",
                            path: "/admin/audit-logs",
                            icon: ScrollText,
                        },
                    ]
                  : []),

              ...(can("archive.view")
                  ? [
                        {
                            label: "Museum",
                            path: "/admin/museum",
                            icon: Archive,
                        },
                    ]
                  : []),
          ]
        : [];

    /*
    |--------------------------------------------------------------------------
    | Account Security
    |--------------------------------------------------------------------------
    */

    const accountSecurityItems = user
        ? [
              {
                  label: "MFA & Recovery",
                  path: "/admin/mfa",
                  icon: Lock,
              },
              {
                  label: "Active Sessions",
                  path: "/admin/sessions",
                  icon: Monitor,
              },
          ]
        : [];

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const handleLogout = () => {
        localStorage.removeItem("token");

        sessionStorage.removeItem(
            "mfa_challenge_token"
        );

        sessionStorage.removeItem(
            "mfa_challenge_expires_at"
        );

        sessionStorage.removeItem(
            "mfa_login_email"
        );

        onClose();

        navigate("/login", {
            replace: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Navigation Item
    |--------------------------------------------------------------------------
    */

    const renderNavItem = (item) => {
        const Icon = item.icon;

        return (
            <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => `
                    group flex w-full items-center gap-3
                    rounded-xl px-4 py-3
                    text-left text-[14px]
                    font-medium
                    transition-all duration-200
                    ${
                        isActive
                            ? "shadow-sm"
                            : isLightSidebar
                              ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                `}
                style={({ isActive }) => {
                    if (!isActive) {
                        return undefined;
                    }

                    if (isBrandSidebar) {
                        return {
                            color: "#ffffff",
                            backgroundColor:
                                "rgba(255,255,255,0.12)",
                        };
                    }

                    return {
                        color:
                            "var(--brand-primary)",
                        backgroundColor:
                            "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
                    };
                }}
            >
                {({ isActive }) => (
                    <>
                        <Icon
                            size={19}
                            strokeWidth={1.8}
                            className={`
                                shrink-0
                                transition-colors duration-200
                                ${
                                    isActive
                                        ? ""
                                        : isLightSidebar
                                          ? "text-slate-400 group-hover:text-slate-700"
                                          : "text-slate-500 group-hover:text-white"
                                }
                            `}
                            style={
                                isActive
                                    ? {
                                          color:
                                              isBrandSidebar
                                                  ? "#ffffff"
                                                  : "var(--brand-primary)",
                                      }
                                    : undefined
                            }
                        />

                        <span className="truncate">
                            {item.label}
                        </span>

                        {isActive && (
                            <span
                                className="ml-auto h-1.5 w-1.5 rounded-full"
                                style={{
                                    backgroundColor:
                                        isBrandSidebar
                                            ? "#ffffff"
                                            : "var(--brand-primary)",
                                }}
                            />
                        )}
                    </>
                )}
            </NavLink>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Navigation Section
    |--------------------------------------------------------------------------
    */

    const renderSection = (
        title,
        items
    ) => {
        if (!items.length) {
            return null;
        }

        return (
            <div className="mb-6">
                <div className="px-4 pb-2">
                    <p
                        className={`
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.18em]
                            ${mutedTextClass}
                        `}
                    >
                        {title}
                    </p>
                </div>

                <div className="space-y-1">
                    {items.map(
                        renderNavItem
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 z-50
                    flex h-screen w-[270px] flex-col
                    border-r
                    ${sidebarBorderClass}
                    shadow-2xl shadow-black/10
                    transition-all duration-300
                    lg:translate-x-0
                    ${
                        mobileOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
                style={{
                    backgroundColor:
                        sidebarBackground,
                }}
            >
                {/* Logo */}

                <div
                    className={`
                        flex h-[82px] shrink-0
                        items-center justify-between
                        border-b px-6
                        ${sidebarBorderClass}
                    `}
                >
                    <NavLink
                        to={
                            isPlatformOwner ||
                            isTenantAdmin
                                ? "/admin/dashboard"
                                : "/admin/sessions"
                        }
                        onClick={onClose}
                        className="group flex items-center gap-3"
                    >
                        <div
                            className="
                                flex h-10 w-10 shrink-0
                                items-center justify-center
                                rounded-xl text-white
                                shadow-lg
                                transition-transform duration-300
                                group-hover:scale-105
                            "
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--brand-primary), #7c3aed)",
                                boxShadow:
                                    "0 10px 25px color-mix(in srgb, var(--brand-primary) 25%, transparent)",
                            }}
                        >
                            <span className="text-xl font-bold">
                                D
                            </span>
                        </div>

                        <div>
                            <h1
                                className={`
                                    text-[21px]
                                    font-bold
                                    tracking-tight
                                    ${primaryTextClass}
                                `}
                            >
                                Docu
                                <span
                                    style={{
                                        color:
                                            isBrandSidebar
                                                ? "#ffffff"
                                                : "var(--brand-primary)",
                                    }}
                                >
                                    Engine
                                </span>
                            </h1>

                            <p
                                className={`
                                    text-[10px]
                                    tracking-wide
                                    ${secondaryTextClass}
                                `}
                            >
                                IT Documentation Platform
                            </p>
                        </div>
                    </NavLink>

                    <button
                        type="button"
                        onClick={onClose}
                        className={`
                            transition lg:hidden
                            ${
                                isLightSidebar
                                    ? "text-slate-500 hover:text-slate-900"
                                    : "text-slate-400 hover:text-white"
                            }
                        `}
                        aria-label="Close sidebar"
                    >
                        <X size={21} />
                    </button>
                </div>

                {/* Navigation */}

                <div className="flex-1 overflow-y-auto px-4 py-6">
                    {renderSection(
                        "Platform",
                        platformItems
                    )}

                    {renderSection(
                        "Organization",
                        organizationItems
                    )}

                    {renderSection(
                        "Documentation",
                        documentationItems
                    )}

                    {renderSection(
                        "Identity & Access",
                        identityAccessItems
                    )}

                    {renderSection(
                        "Security",
                        tenantSecurityItems
                    )}

                    {renderSection(
                        "Audit & Archive",
                        auditArchiveItems
                    )}

                    {renderSection(
                        "Account Security",
                        accountSecurityItems
                    )}
                </div>

                {/* Current Organization */}

                <div className="shrink-0 px-4 pb-4">
                    {authLoading ? (
                        <div
                            className={`
                                rounded-2xl border p-4
                                ${
                                    isLightSidebar
                                        ? "border-slate-200 bg-slate-50"
                                        : "border-white/10 bg-white/[0.03]"
                                }
                            `}
                        >
                            <div className="animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`
                                            h-10 w-10 rounded-xl
                                            ${
                                                isLightSidebar
                                                    ? "bg-slate-200"
                                                    : "bg-white/10"
                                            }
                                        `}
                                    />

                                    <div className="flex-1">
                                        <div
                                            className={`
                                                h-3 w-28 rounded
                                                ${
                                                    isLightSidebar
                                                        ? "bg-slate-200"
                                                        : "bg-white/10"
                                                }
                                            `}
                                        />

                                        <div
                                            className={`
                                                mt-2 h-2.5 w-20 rounded
                                                ${
                                                    isLightSidebar
                                                        ? "bg-slate-200"
                                                        : "bg-white/10"
                                                }
                                            `}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : currentTenant ? (
                        <div
                            className={`
                                rounded-2xl border p-4
                                ${
                                    isLightSidebar
                                        ? "border-slate-200 bg-slate-50"
                                        : "border-white/10 bg-white/[0.03]"
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`
                                        flex h-11 w-11 shrink-0
                                        items-center justify-center
                                        overflow-hidden rounded-xl
                                        border bg-white
                                        ${
                                            isLightSidebar
                                                ? "border-slate-200"
                                                : "border-white/10"
                                        }
                                    `}
                                >
                                    {organizationLogo ? (
                                        <img
                                            src={
                                                organizationLogo
                                            }
                                            alt={`${organizationName} logo`}
                                            className="h-full w-full object-contain p-1.5"
                                        />
                                    ) : (
                                        <Building2
                                            size={20}
                                            strokeWidth={1.8}
                                            style={{
                                                color:
                                                    "var(--brand-primary)",
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`
                                            truncate
                                            text-xs
                                            font-semibold
                                            ${primaryTextClass}
                                        `}
                                    >
                                        {organizationName}
                                    </p>

                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span
                                            className={`
                                                h-1.5 w-1.5 rounded-full
                                                ${
                                                    tenantStatus ===
                                                    "active"
                                                        ? "bg-emerald-400"
                                                        : "bg-amber-400"
                                                }
                                            `}
                                        />

                                        <span
                                            className={`
                                                capitalize
                                                text-[10px]
                                                ${secondaryTextClass}
                                            `}
                                        >
                                            {tenantStatus ||
                                                "Unknown"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`
                                    mt-4 border-t pt-3
                                    ${
                                        isLightSidebar
                                            ? "border-slate-200"
                                            : "border-white/10"
                                    }
                                `}
                            >
                                {tenantTimezone && (
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`
                                                text-[10px]
                                                ${mutedTextClass}
                                            `}
                                        >
                                            Timezone
                                        </span>

                                        <span
                                            className={`
                                                max-w-[130px]
                                                truncate
                                                text-[10px]
                                                font-medium
                                                ${
                                                    isLightSidebar
                                                        ? "text-slate-700"
                                                        : "text-slate-300"
                                                }
                                            `}
                                        >
                                            {tenantTimezone}
                                        </span>
                                    </div>
                                )}

                                {tenantRole && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <span
                                            className={`
                                                text-[10px]
                                                ${mutedTextClass}
                                            `}
                                        >
                                            Access
                                        </span>

                                        <span
                                            className={`
                                                max-w-[140px]
                                                truncate
                                                text-right
                                                text-[10px]
                                                font-medium
                                                ${
                                                    isLightSidebar
                                                        ? "text-slate-700"
                                                        : "text-slate-300"
                                                }
                                            `}
                                            title={tenantRole}
                                        >
                                            {tenantRole}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : isPlatformOwner ? (
                        <div
                            className={`
                                rounded-2xl border p-4
                                ${
                                    isLightSidebar
                                        ? "border-slate-200 bg-slate-50"
                                        : "border-white/10 bg-white/[0.03]"
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        flex h-10 w-10 shrink-0
                                        items-center justify-center
                                        rounded-xl
                                    "
                                    style={{
                                        backgroundColor:
                                            "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
                                    }}
                                >
                                    <Building2
                                        size={18}
                                        style={{
                                            color:
                                                "var(--brand-primary)",
                                        }}
                                    />
                                </div>

                                <div>
                                    <p
                                        className={`
                                            text-xs
                                            font-semibold
                                            ${primaryTextClass}
                                        `}
                                    >
                                        Platform Administration
                                    </p>

                                    <p
                                        className={`
                                            mt-1
                                            text-[10px]
                                            ${secondaryTextClass}
                                        `}
                                    >
                                        No MSP selected
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* User */}

                {!authLoading && user && (
                    <div
                        className={`
                            border-t
                            px-4 pt-4
                            ${sidebarBorderClass}
                        `}
                    >
                        <div className="px-4 pb-3">
                            <p
                                className={`
                                    truncate
                                    text-xs
                                    font-semibold
                                    ${
                                        isLightSidebar
                                            ? "text-slate-700"
                                            : "text-slate-300"
                                    }
                                `}
                            >
                                {user.name}
                            </p>

                            <p
                                className={`
                                    mt-0.5 truncate
                                    text-[10px]
                                    ${mutedTextClass}
                                `}
                            >
                                {user.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* Logout */}

                <div className="shrink-0 px-4 pb-4">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className={`
                            group flex w-full
                            items-center gap-3
                            rounded-xl px-4 py-3
                            text-sm font-medium
                            transition-all duration-200
                            hover:bg-red-500/10
                            hover:text-red-500
                            ${
                                isLightSidebar
                                    ? "text-slate-600"
                                    : "text-slate-400"
                            }
                        `}
                    >
                        <LogOut
                            size={18}
                            strokeWidth={1.8}
                            className="
                                transition-transform
                                duration-200
                                group-hover:-translate-x-0.5
                            "
                        />

                        <span>
                            Sign out
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default AdminSidebar;