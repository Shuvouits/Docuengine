import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    User,
    Settings,
    Bell,
    SlidersHorizontal,
    HelpCircle,
    LogOut,
    ChevronDown,
} from "lucide-react";

function ProfileDropdown() {

    const [open, setOpen] = useState(false);

    const dropdownRef = useRef(null);

    const navigate = useNavigate();


    /*
    |--------------------------------------------------------------------------
    | CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }

        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    const handleLogout = () => {

        localStorage.removeItem("token");

        setOpen(false);

        navigate("/login");
    };


    return (

        <div
            ref={dropdownRef}
            className="relative"
        >

            {/* =========================================================
                PROFILE BUTTON
            ========================================================== */}

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-2
                    py-2
                    transition
                    hover:bg-slate-50
                "
            >

                {/* Avatar */}

                <div
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-[#19b5fe]
                        to-[#7c3aed]
                        text-sm
                        font-bold
                        text-white
                        shadow-sm
                    "
                >
                    AD
                </div>


                {/* User information */}

                <div className="hidden text-left xl:block">

                    <p
                        className="
                            text-sm
                            font-semibold
                            text-[#0b1324]
                        "
                    >
                        Admin User
                    </p>

                    <p
                        className="
                            text-[11px]
                            text-slate-500
                        "
                    >
                        Platform Administrator
                    </p>

                </div>


                {/* Chevron */}

                <ChevronDown
                    size={16}
                    strokeWidth={1.8}
                    className={`
                        text-slate-400
                        transition-transform
                        duration-200
                        ${open ? "rotate-180" : ""}
                    `}
                />

            </button>


            {/* =========================================================
                DROPDOWN
            ========================================================== */}

            {open && (

                <div
                    className="
                        absolute
                        right-0
                        top-[calc(100%+10px)]
                        z-50
                        w-[280px]
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_20px_50px_rgba(15,23,42,0.15)]
                    "
                >

                    {/* -------------------------------------------------
                        PROFILE HEADER
                    -------------------------------------------------- */}

                    <div
                        className="
                            border-b
                            border-slate-100
                            bg-slate-50/70
                            px-4
                            py-4
                        "
                    >

                        <div className="flex items-center gap-3">

                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-gradient-to-br
                                    from-[#19b5fe]
                                    to-[#7c3aed]
                                    text-sm
                                    font-bold
                                    text-white
                                "
                            >
                                AD
                            </div>

                            <div className="min-w-0">

                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-semibold
                                        text-[#0b1324]
                                    "
                                >
                                    Admin User
                                </p>

                                <p
                                    className="
                                        truncate
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    admin@docuengine.com
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* -------------------------------------------------
                        MENU ITEMS
                    -------------------------------------------------- */}

                    <div className="p-2">


                        {/* My Profile */}

                        <Link
                            to="/admin/profile"
                            onClick={() => setOpen(false)}
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-2.5
                                text-sm
                                font-medium
                                text-slate-700
                                transition
                                hover:bg-slate-50
                                hover:text-[#7046f5]
                            "
                        >

                            <User
                                size={18}
                                strokeWidth={1.8}
                                className="text-slate-400"
                            />

                            <span>
                                My Profile
                            </span>

                        </Link>


                        {/* Account Settings */}

                        <Link
                            to="/admin/settings/account"
                            onClick={() => setOpen(false)}
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-2.5
                                text-sm
                                font-medium
                                text-slate-700
                                transition
                                hover:bg-slate-50
                                hover:text-[#7046f5]
                            "
                        >

                            <Settings
                                size={18}
                                strokeWidth={1.8}
                                className="text-slate-400"
                            />

                            <span>
                                Account Settings
                            </span>

                        </Link>


                        {/* Notifications */}

                        <Link
                            to="/admin/notifications"
                            onClick={() => setOpen(false)}
                            className="
                                flex
                                items-center
                                justify-between
                                rounded-xl
                                px-3
                                py-2.5
                                text-sm
                                font-medium
                                text-slate-700
                                transition
                                hover:bg-slate-50
                                hover:text-[#7046f5]
                            "
                        >

                            <div className="flex items-center gap-3">

                                <Bell
                                    size={18}
                                    strokeWidth={1.8}
                                    className="text-slate-400"
                                />

                                <span>
                                    Notifications
                                </span>

                            </div>


                            {/* Static notification count */}

                            <span
                                className="
                                    flex
                                    h-5
                                    min-w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#19b5fe]/10
                                    px-1.5
                                    text-[10px]
                                    font-bold
                                    text-[#0ea5e9]
                                "
                            >
                                3
                            </span>

                        </Link>


                        {/* Platform Settings */}

                        <Link
                            to="/admin/settings"
                            onClick={() => setOpen(false)}
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-2.5
                                text-sm
                                font-medium
                                text-slate-700
                                transition
                                hover:bg-slate-50
                                hover:text-[#7046f5]
                            "
                        >

                            <SlidersHorizontal
                                size={18}
                                strokeWidth={1.8}
                                className="text-slate-400"
                            />

                            <span>
                                Platform Settings
                            </span>

                        </Link>

                    </div>


                    {/* -------------------------------------------------
                        HELP
                    -------------------------------------------------- */}

                    <div
                        className="
                            border-t
                            border-slate-100
                            p-2
                        "
                    >

                        <Link
                            to="/admin/help"
                            onClick={() => setOpen(false)}
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-2.5
                                text-sm
                                font-medium
                                text-slate-600
                                transition
                                hover:bg-slate-50
                                hover:text-[#7046f5]
                            "
                        >

                            <HelpCircle
                                size={18}
                                strokeWidth={1.8}
                                className="text-slate-400"
                            />

                            <span>
                                Help & Support
                            </span>

                        </Link>

                    </div>


                    {/* -------------------------------------------------
                        LOGOUT
                    -------------------------------------------------- */}

                    <div
                        className="
                            border-t
                            border-slate-100
                            p-2
                        "
                    >

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-2.5
                                text-sm
                                font-medium
                                text-red-500
                                transition
                                hover:bg-red-50
                            "
                        >

                            <LogOut
                                size={18}
                                strokeWidth={1.8}
                            />

                            <span>
                                Sign out
                            </span>

                        </button>

                    </div>

                </div>

            )}

        </div>

    );
}

export default ProfileDropdown;