import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Bell,
    ChevronDown,
    CircleHelp,
    LogOut,
    Menu,
    Search,
    Settings,
    SlidersHorizontal,
    UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const AdminTopBar = ({
    onMenuClick = () => {},
    authData = null,
    authLoading = false,
}) => {
    const navigate = useNavigate();

    const dropdownRef = useRef(null);

    const [profileOpen, setProfileOpen] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Auth Data
    |--------------------------------------------------------------------------
    */

    const user =
        authData?.user ||
        authData?.data?.user ||
        authData?.authenticated_user ||
        null;

    const currentTenant =
        authData?.current_tenant ||
        authData?.data?.current_tenant ||
        null;

    const tenantAccess =
        currentTenant?.access || {};

    /*
    |--------------------------------------------------------------------------
    | User Information
    |--------------------------------------------------------------------------
    */

    const userName =
        user?.name ||
        [user?.first_name, user?.last_name]
            .filter(Boolean)
            .join(" ") ||
        "User";

    const userEmail =
        user?.email || "";

    /*
    |--------------------------------------------------------------------------
    | Current Role
    |--------------------------------------------------------------------------
    */

    const getRoleName = () => {
        if (
            Array.isArray(
                tenantAccess?.roles
            ) &&
            tenantAccess.roles.length
        ) {
            return tenantAccess.roles[0];
        }

        if (
            tenantAccess?.role?.name
        ) {
            return tenantAccess.role.name;
        }

        if (
            typeof tenantAccess?.role ===
            "string"
        ) {
            return tenantAccess.role;
        }

        if (
            tenantAccess?.role_name
        ) {
            return tenantAccess.role_name;
        }

        if (
            currentTenant?.role?.name
        ) {
            return currentTenant.role.name;
        }

        if (
            typeof currentTenant?.role ===
            "string"
        ) {
            return currentTenant.role;
        }

        if (
            user?.role?.name
        ) {
            return user.role.name;
        }

        if (
            typeof user?.role ===
            "string"
        ) {
            return user.role;
        }

        if (user?.user_type) {
            return user.user_type;
        }

        return "User";
    };

    const roleName =
        getRoleName();

    /*
    |--------------------------------------------------------------------------
    | Initials
    |--------------------------------------------------------------------------
    */

    const getInitials = (name) => {
        if (!name) {
            return "U";
        }

        const words = name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (words.length === 1) {
            return words[0]
                .slice(0, 2)
                .toUpperCase();
        }

        return (
            words[0][0] +
            words[
                words.length - 1
            ][0]
        ).toUpperCase();
    };

    const initials =
        getInitials(userName);

    /*
    |--------------------------------------------------------------------------
    | Close Dropdown On Outside Click
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const handleOutsideClick =
            (event) => {
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(
                        event.target
                    )
                ) {
                    setProfileOpen(false);
                }
            };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Sign Out
    |--------------------------------------------------------------------------
    */

    const handleSignOut = () => {
        localStorage.removeItem(
            "token"
        );

        sessionStorage.clear();

        navigate("/login", {
            replace: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Display Values
    |--------------------------------------------------------------------------
    */

    const displayName =
        authLoading
            ? "Loading..."
            : userName;

    const displayRole =
        authLoading
            ? "Loading..."
            : roleName;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <header
            className="sticky top-0 z-40 flex h-[80px] items-center justify-between border-b px-5 lg:px-7"
            style={{
                backgroundColor:
                    "var(--brand-secondary)",
                borderColor:
                    "color-mix(in srgb, var(--brand-primary) 12%, #e2e8f0)",
            }}
        >
            {/* Left */}

            <div className="flex min-w-0 items-center gap-3">
                {/* Mobile Menu */}

                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden"
                    aria-label="Open navigation"
                >
                    <Menu size={19} />
                </button>

                {/* Search */}

                <div className="relative hidden w-[315px] sm:block">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        placeholder="Search your workspace..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white"
                        style={{
                            boxShadow:
                                "0 0 0 0 transparent",
                        }}
                        onFocus={(event) => {
                            event.currentTarget.style.borderColor =
                                "var(--brand-primary)";

                            event.currentTarget.style.boxShadow =
                                "0 0 0 4px color-mix(in srgb, var(--brand-primary) 12%, transparent)";
                        }}
                        onBlur={(event) => {
                            event.currentTarget.style.borderColor =
                                "#e2e8f0";

                            event.currentTarget.style.boxShadow =
                                "none";
                        }}
                    />
                </div>
            </div>

            {/* Right Side */}

            <div className="flex items-center gap-3 lg:gap-4">
                {/* Notifications */}

                <button
                    type="button"
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/70 hover:text-slate-800"
                >
                    <Bell size={20} />

                    <span
                        className="absolute right-[8px] top-[7px] h-2 w-2 rounded-full border-2"
                        style={{
                            backgroundColor:
                                "var(--brand-primary)",
                            borderColor:
                                "var(--brand-secondary)",
                        }}
                    />
                </button>

                <div
                    className="h-8 w-px"
                    style={{
                        backgroundColor:
                            "color-mix(in srgb, var(--brand-primary) 12%, #cbd5e1)",
                    }}
                />

                {/* Profile */}

                <div
                    ref={dropdownRef}
                    className="relative"
                >
                    <button
                        type="button"
                        onClick={() =>
                            setProfileOpen(
                                (current) =>
                                    !current
                            )
                        }
                        className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/70"
                    >
                        {/* Avatar */}

                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--brand-primary), color-mix(in srgb, var(--brand-primary) 65%, #7c3aed))",
                            }}
                        >
                            {initials}
                        </div>

                        {/* User */}

                        <div className="hidden min-w-[130px] text-left lg:block">
                            <p className="max-w-[190px] truncate text-sm font-semibold text-slate-900">
                                {displayName}
                            </p>

                            <p className="mt-0.5 max-w-[190px] truncate text-xs text-slate-500">
                                {displayRole}
                            </p>
                        </div>

                        <ChevronDown
                            size={16}
                            className={`text-slate-400 transition ${
                                profileOpen
                                    ? "rotate-180"
                                    : ""
                            }`}
                        />
                    </button>

                    {/* Dropdown */}

                    {profileOpen && (
                        <div className="absolute right-0 top-[58px] w-[285px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                            {/* User Header */}

                            <div
                                className="flex items-center gap-3 border-b px-5 py-4"
                                style={{
                                    backgroundColor:
                                        "color-mix(in srgb, var(--brand-secondary) 40%, white)",
                                    borderColor:
                                        "color-mix(in srgb, var(--brand-primary) 10%, #e2e8f0)",
                                }}
                            >
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, var(--brand-primary), color-mix(in srgb, var(--brand-primary) 65%, #7c3aed))",
                                    }}
                                >
                                    {initials}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                        {displayName}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                        {userEmail ||
                                            "No email"}
                                    </p>

                                    {!authLoading && (
                                        <span
                                            className="mt-2 inline-flex rounded-md px-2 py-1 text-[10px] font-semibold"
                                            style={{
                                                color:
                                                    "var(--brand-primary)",
                                                backgroundColor:
                                                    "color-mix(in srgb, var(--brand-primary) 10%, white)",
                                            }}
                                        >
                                            {roleName}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Menu */}

                            <div className="p-2">
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <UserRound
                                        size={17}
                                    />

                                    My Profile
                                </button>

                                <button
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Settings
                                        size={17}
                                    />

                                    Account Settings
                                </button>

                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <span className="flex items-center gap-3">
                                        <Bell
                                            size={17}
                                        />

                                        Notifications
                                    </span>

                                    <span
                                        className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                                        style={{
                                            color:
                                                "var(--brand-primary)",
                                            backgroundColor:
                                                "color-mix(in srgb, var(--brand-primary) 12%, white)",
                                        }}
                                    >
                                        3
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <SlidersHorizontal
                                        size={17}
                                    />

                                    Platform Settings
                                </button>
                            </div>

                            <div className="mx-4 border-t border-slate-100" />

                            <div className="p-2">
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <CircleHelp
                                        size={17}
                                    />

                                    Help & Support
                                </button>
                            </div>

                            {/* Sign Out */}

                            <div className="border-t border-slate-100 p-2">
                                <button
                                    type="button"
                                    onClick={
                                        handleSignOut
                                    }
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
                                >
                                    <LogOut
                                        size={17}
                                    />

                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminTopBar;