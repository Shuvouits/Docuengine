import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    ShieldCheck,
    LogOut,
    X,
    Palette,
    SlidersHorizontal,
    Flag,
    UserCircle,
    ChevronDown,
    ChevronsUpDown,
} from "lucide-react";

function AdminSidebar({
    mobileOpen = false,
    onClose = () => {},
}) {
    const navigate = useNavigate();

    const [workspaceOpen, setWorkspaceOpen] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Navigation
    |--------------------------------------------------------------------------
    */

    const platformItems = [
        {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Tenants",
            path: "/admin/tenants",
            icon: Building2,
        },
        {
            label: "Users",
            path: "/admin/users",
            icon: Users,
        },
    ];

    const organizationItems = [
        {
            label: "Overview",
            path: "/admin/organization",
            icon: Building2,
        },
        {
            label: "Settings",
            path: "/admin/organization/settings",
            icon: Settings,
        },
        {
            label: "Branding",
            path: "/admin/organization/branding",
            icon: Palette,
        },
    ];

    const systemItems = [
        {
            label: "Configuration",
            path: "/admin/configuration",
            icon: SlidersHorizontal,
        },
        {
            label: "Feature Flags",
            path: "/admin/feature-flags",
            icon: Flag,
        },
    ];

    const accountItems = [
        {
            label: "My Profile",
            path: "/admin/profile",
            icon: UserCircle,
        },
        {
            label: "Security",
            path: "/admin/security",
            icon: ShieldCheck,
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

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
                                shrink-0 transition-colors duration-200

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
                        to="/"
                        onClick={onClose}
                        className="group flex items-center gap-3"
                    >
                        {/* Logo Icon */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe] to-[#7c3aed] shadow-lg shadow-[#19b5fe]/20 transition-transform duration-300 group-hover:scale-105">
                            <span className="text-xl font-bold text-white">
                                D
                            </span>
                        </div>

                        {/* Brand */}

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

                    {/* Mobile Close */}

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

                <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

                    {renderSection(
                        "Platform",
                        platformItems
                    )}

                    {renderSection(
                        "Organization",
                        organizationItems
                    )}

                    {renderSection(
                        "System",
                        systemItems
                    )}

                    {renderSection(
                        "Account",
                        accountItems
                    )}
                </div>

                {/* =====================================================
                    CURRENT WORKSPACE
                ====================================================== */}

                <div className="shrink-0 px-4 pb-4">

                    <button
                        type="button"
                        onClick={() =>
                            setWorkspaceOpen(!workspaceOpen)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
                    >
                        <div className="flex items-center gap-3">

                            {/* Workspace Icon */}

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#19b5fe] to-[#7c3aed]">
                                <Building2
                                    size={17}
                                    strokeWidth={1.8}
                                    className="text-white"
                                />
                            </div>

                            {/* Workspace Info */}

                            <div className="min-w-0 flex-1">

                                <p className="truncate text-xs font-semibold text-white">
                                    Acme Corporation
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-500">
                                    Active workspace
                                </p>
                            </div>

                            <ChevronDown
                                size={15}
                                className={`
                                    shrink-0 text-slate-500
                                    transition-transform duration-200

                                    ${
                                        workspaceOpen
                                            ? "rotate-180"
                                            : ""
                                    }
                                `}
                            />
                        </div>

                        {/* Setup Progress */}

                        <div className="mt-4">

                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500">
                                    Workspace setup
                                </span>

                                <span className="text-[10px] font-medium text-slate-400">
                                    72%
                                </span>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#19b5fe] to-[#7c3aed]" />
                            </div>
                        </div>
                    </button>

                    {/* Workspace Dropdown */}

                    {workspaceOpen && (
                        <div className="mt-2 rounded-xl border border-white/10 bg-[#0b1728] p-2 shadow-xl">

                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
                            >
                                <Building2
                                    size={15}
                                    className="text-[#19b5fe]"
                                />

                                <span className="flex-1">
                                    Acme Corporation
                                </span>

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            </button>

                            <button
                                type="button"
                                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
                            >
                                <ChevronsUpDown
                                    size={15}
                                />

                                Switch workspace
                            </button>
                        </div>
                    )}
                </div>

                {/* =====================================================
                    SIGN OUT
                ====================================================== */}

                <div className="shrink-0 border-t border-white/10 p-4">

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