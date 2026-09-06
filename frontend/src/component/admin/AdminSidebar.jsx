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
} from "lucide-react";

function AdminSidebar({
    mobileOpen = false,
    onClose = () => {},
    authData = null,
    authLoading = false,
}) {
    const navigate = useNavigate();

    /*
    |--------------------------------------------------------------------------
    | Auth Data
    |--------------------------------------------------------------------------
    */

    const user = authData?.user || null;

    const currentTenant =
        authData?.current_tenant || null;

    const isPlatformOwner =
        Boolean(user?.is_platform_owner);

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
        currentTenant?.membership?.role || null;

    /*
    |--------------------------------------------------------------------------
    | Platform Navigation
    |--------------------------------------------------------------------------
    */

    const platformItems = [
        {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },

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
    | Organization Navigation
    |--------------------------------------------------------------------------
    |
    | These routes will be connected one by one with Module 1 APIs.
    |
    */

    const organizationItems = currentTenant
        ? [
              {
                  label: "Overview",
                  path: "/admin/organization",
                  icon: Building2,
              },
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
        : [];

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const handleLogout = () => {
        localStorage.removeItem("token");

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
                onClick={onClose}
                className={({ isActive }) => `
                    group flex w-full items-center gap-3
                    rounded-xl px-4 py-3
                    text-left text-[14px]
                    font-medium
                    transition-all duration-200

                    ${
                        isActive
                            ? "bg-[#19b5fe]/10 text-[#19b5fe] shadow-sm"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                `}
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
                                        ? "text-[#19b5fe]"
                                        : "text-slate-500 group-hover:text-white"
                                }
                            `}
                        />

                        <span className="truncate">
                            {item.label}
                        </span>

                        {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#19b5fe]" />
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

    const renderSection = (title, items) => {
        if (!items.length) {
            return null;
        }

        return (
            <div className="mb-6">

                <div className="px-4 pb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {title}
                    </p>
                </div>

                <div className="space-y-1">
                    {items.map(renderNavItem)}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* =========================================================
                MOBILE OVERLAY
            ========================================================== */}

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* =========================================================
                SIDEBAR
            ========================================================== */}

            <aside
                className={`
                    fixed left-0 top-0 z-50
                    flex h-screen w-[270px] flex-col
                    border-r border-white/10
                    bg-[#07111f]
                    shadow-2xl shadow-black/20
                    transition-transform duration-300

                    lg:translate-x-0

                    ${
                        mobileOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >

                {/* =====================================================
                    LOGO
                ====================================================== */}

                <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-white/10 px-6">

                    <NavLink
                        to="/admin/dashboard"
                        onClick={onClose}
                        className="group flex items-center gap-3"
                    >

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe] to-[#7c3aed] shadow-lg shadow-[#19b5fe]/20 transition-transform duration-300 group-hover:scale-105">

                            <span className="text-xl font-bold text-white">
                                D
                            </span>
                        </div>

                        <div>

                            <h1 className="text-[21px] font-bold tracking-tight text-white">
                                Docu
                                <span className="text-[#19b5fe]">
                                    Engine
                                </span>
                            </h1>

                            <p className="text-[10px] tracking-wide text-slate-400">
                                IT Documentation Platform
                            </p>
                        </div>
                    </NavLink>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 transition hover:text-white lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={21} />
                    </button>
                </div>

                {/* =====================================================
                    NAVIGATION
                ====================================================== */}

                <div className="flex-1 overflow-y-auto px-4 py-6">

                    {renderSection(
                        "Platform",
                        platformItems
                    )}

                    {renderSection(
                        "Organization",
                        organizationItems
                    )}

                </div>

                {/* =====================================================
                    CURRENT ORGANIZATION
                ====================================================== */}

                <div className="shrink-0 px-4 pb-4">

                    {authLoading ? (

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                            <div className="animate-pulse">

                                <div className="flex items-center gap-3">

                                    <div className="h-10 w-10 rounded-xl bg-white/10" />

                                    <div className="flex-1">

                                        <div className="h-3 w-28 rounded bg-white/10" />

                                        <div className="mt-2 h-2.5 w-20 rounded bg-white/10" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    ) : currentTenant ? (

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                            <div className="flex items-center gap-3">

                                {/* Organization Logo */}

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white">

                                    {organizationLogo ? (

                                        <img
                                            src={organizationLogo}
                                            alt={`${organizationName} logo`}
                                            className="h-full w-full object-contain p-1.5"
                                        />

                                    ) : (

                                        <Building2
                                            size={20}
                                            strokeWidth={1.8}
                                            className="text-[#19b5fe]"
                                        />

                                    )}
                                </div>

                                {/* Organization Information */}

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-xs font-semibold text-white">
                                        {organizationName}
                                    </p>

                                    <div className="mt-1 flex items-center gap-1.5">

                                        <span
                                            className={`
                                                h-1.5 w-1.5 rounded-full

                                                ${
                                                    tenantStatus === "active"
                                                        ? "bg-emerald-400"
                                                        : "bg-amber-400"
                                                }
                                            `}
                                        />

                                        <span className="capitalize text-[10px] text-slate-400">
                                            {tenantStatus || "Unknown"}
                                        </span>
                                    </div>

                                </div>
                            </div>

                            {/* Tenant Metadata */}

                            <div className="mt-4 border-t border-white/10 pt-3">

                                {tenantTimezone && (
                                    <div className="flex items-center justify-between">

                                        <span className="text-[10px] text-slate-500">
                                            Timezone
                                        </span>

                                        <span className="max-w-[130px] truncate text-[10px] font-medium text-slate-300">
                                            {tenantTimezone}
                                        </span>
                                    </div>
                                )}

                                {tenantRole && (
                                    <div className="mt-2 flex items-center justify-between">

                                        <span className="text-[10px] text-slate-500">
                                            Access
                                        </span>

                                        <span className="capitalize text-[10px] font-medium text-slate-300">
                                            {tenantRole}
                                        </span>
                                    </div>
                                )}

                            </div>
                        </div>

                    ) : isPlatformOwner ? (

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10">

                                    <Building2
                                        size={18}
                                        className="text-[#19b5fe]"
                                    />
                                </div>

                                <div>

                                    <p className="text-xs font-semibold text-white">
                                        Platform Administration
                                    </p>

                                    <p className="mt-1 text-[10px] text-slate-500">
                                        No MSP selected
                                    </p>

                                </div>
                            </div>
                        </div>

                    ) : null}

                </div>

                {/* =====================================================
                    USER
                ====================================================== */}

                {!authLoading && user && (
                    <div className="border-t border-white/10 px-4 pt-4">

                        <div className="px-4 pb-3">

                            <p className="truncate text-xs font-semibold text-slate-300">
                                {user.name}
                            </p>

                            <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                {user.email}
                            </p>

                        </div>

                    </div>
                )}

                {/* =====================================================
                    SIGN OUT
                ====================================================== */}

                <div className="shrink-0 px-4 pb-4">

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut
                            size={18}
                            strokeWidth={1.8}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
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