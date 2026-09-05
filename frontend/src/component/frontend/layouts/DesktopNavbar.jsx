import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";


import MegaMenu from "./MegaMenu";
import { Link } from "react-router-dom";

function DesktopNavbar() {
    const [activeMenu, setActiveMenu] = useState(null);

    const closeTimer = useRef(null);

    const openMenu = (menu) => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }

        setActiveMenu(menu);
    };

    const closeMenu = () => {
        closeTimer.current = setTimeout(() => {
            setActiveMenu(null);
        }, 120);
    };

    const cancelClose = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }
    };

    return (
        <div
            className="hidden lg:block bg-[#07111f] text-white"
            onMouseLeave={closeMenu}
            onMouseEnter={cancelClose}
        >

            <div className="mx-auto max-w-[1550px] px-6 xl:px-10">

                <div className="flex h-[82px] items-center justify-between">

                    {/* =========================
                        LOGO
                    ========================== */}



                    <a
                        href="/"
                        className="group flex items-center gap-3 shrink-0"
                    >
                        {/* Brand Icon */}
                        <div
                            className="
            flex h-10 w-10 items-center justify-center
            rounded-[11px]
            bg-gradient-to-br from-[#4da3ff] via-[#6674f4] to-[#7046f5]
            shadow-[0_8px_24px_rgba(112,70,245,0.25)]
            transition-all duration-300
            group-hover:scale-105
            group-hover:shadow-[0_10px_30px_rgba(112,70,245,0.4)]
        "
                        >
                            <span className="text-[21px] font-bold text-white leading-none">
                                D
                            </span>
                        </div>

                        {/* Brand Text */}
                        <div className="flex flex-col leading-none">
                            <span
                                className="
                text-[23px]
                font-bold
                tracking-[-0.045em]
                text-white
            "
                            >
                                Docu<span className="text-[#22b7f4]">Engine</span>
                            </span>

                            <span
                                className="
                mt-1
                text-[10px]
                font-medium
                tracking-[0.02em]
                text-[#7f9abc]
            "
                            >
                                IT Documentation Platform
                            </span>
                        </div>
                    </a>


                    {/* =========================
                        MAIN NAVIGATION
                    ========================== */}

                    <nav className="flex items-center gap-8">

                        {/* PLATFORM */}
                        <div
                            onMouseEnter={() => openMenu("platform")}
                            className="flex h-[82px] items-center"
                        >
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-[15px] font-medium transition hover:text-white/70"
                            >
                                Platform

                                <ChevronDown
                                    size={16}
                                    strokeWidth={1.8}
                                    className={`transition-transform duration-200 ${activeMenu === "platform"
                                        ? "rotate-180"
                                        : ""
                                        }`}
                                />
                            </button>
                        </div>


                        {/* SOLUTIONS */}
                        <div
                            onMouseEnter={() => openMenu("solutions")}
                            className="flex h-[82px] items-center"
                        >
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-[15px] font-medium transition hover:text-white/70"
                            >
                                Solutions

                                <ChevronDown
                                    size={16}
                                    strokeWidth={1.8}
                                    className={`transition-transform duration-200 ${activeMenu === "solutions"
                                        ? "rotate-180"
                                        : ""
                                        }`}
                                />
                            </button>
                        </div>


                        {/* RESOURCES */}
                        <div
                            onMouseEnter={() => openMenu("resources")}
                            className="flex h-[82px] items-center"
                        >
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-[15px] font-medium transition hover:text-white/70"
                            >
                                Resources

                                <ChevronDown
                                    size={16}
                                    strokeWidth={1.8}
                                    className={`transition-transform duration-200 ${activeMenu === "resources"
                                        ? "rotate-180"
                                        : ""
                                        }`}
                                />
                            </button>
                        </div>


                        {/* PRICING */}
                        <a
                            href="/pricing"
                            className="text-[15px] font-medium transition hover:text-white/70"
                        >
                            Pricing
                        </a>

                    </nav>


                    {/* =========================
                        RIGHT ACTIONS
                    ========================== */}

                    <div className="flex items-center gap-3">

                        {/* Login */}
                        <Link
                            to="/login"
                            className="px-4 py-3 text-[15px] font-medium transition hover:text-white/70"
                        >
                            Login
                        </Link>


                        {/* Book Demo */}
                        <a
                            href="/contact"
                            className="rounded-full border border-white/40 px-6 py-3 text-[14px] font-semibold transition hover:border-white hover:bg-white hover:text-[#0d0224]"
                        >
                            Book a demo
                        </a>


                        {/* Get Started */}
                        <a
                            href="/get-started"
                            className="rounded-full bg-[#7046f5] px-7 py-3 text-[14px] font-semibold transition hover:bg-[#825cf7]"
                        >
                            Get started
                        </a>

                    </div>

                </div>

            </div>


            {/* =========================
                MEGA MENU
            ========================== */}

            {activeMenu && (
                <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={closeMenu}
                >
                    <MegaMenu
                        type={activeMenu}
                        onClose={() => setActiveMenu(null)}
                    />
                </div>
            )}

        </div>
    );
}

export default DesktopNavbar;