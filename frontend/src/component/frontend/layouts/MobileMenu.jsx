import { useState } from "react";
import {
    ChevronDown,
    Menu,
    Feather,
    X,
} from "lucide-react";

import { Link } from "react-router-dom";

function MobileMenu() {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(null);

    const toggleAccordion = (menu) => {
        setExpanded((current) =>
            current === menu ? null : menu
        );
    };

    const closeMenu = () => {
        setOpen(false);
        setExpanded(null);
    };

    return (
        <>
            {/* ================================
                MOBILE HEADER
            ================================= */}

            <div className="lg:hidden bg-[#0d0224] text-white">

                <div className="flex h-[72px] items-center justify-between px-5">

                    {/* Logo */}

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


                    {/* Menu Button */}
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        aria-label={
                            open
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 transition hover:bg-white/10"
                    >
                        {open ? (
                            <X size={22} />
                        ) : (
                            <Menu size={22} />
                        )}
                    </button>

                </div>

            </div>


            {/* ================================
                MOBILE NAVIGATION
            ================================= */}

            {open && (
                <div className="fixed inset-0 top-[72px] z-40 overflow-y-auto bg-[#0d0224] text-white lg:hidden">

                    <div className="px-5 py-6">

                        {/* =================================
                            PLATFORM
                        ================================== */}

                        <MobileAccordion
                            title="Platform"
                            open={expanded === "platform"}
                            onClick={() =>
                                toggleAccordion("platform")
                            }
                        >
                            <MobileLink
                                to="/platform"
                                title="Documentation"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/platform/assets"
                                title="Asset Management"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/platform/passwords"
                                title="Password Management"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/platform/knowledge-base"
                                title="Knowledge Base"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/platform/network"
                                title="Network Management"
                                onClick={closeMenu}
                            />

                        </MobileAccordion>


                        {/* =================================
                            SOLUTIONS
                        ================================== */}

                        <MobileAccordion
                            title="Solutions"
                            open={expanded === "solutions"}
                            onClick={() =>
                                toggleAccordion("solutions")
                            }
                        >
                            <MobileLink
                                to="/solutions/companies"
                                title="For Companies"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/solutions/it-teams"
                                title="For IT Teams"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/solutions/msps"
                                title="For MSPs"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/solutions/administrators"
                                title="For Administrators"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/solutions/technicians"
                                title="For Technicians"
                                onClick={closeMenu}
                            />

                        </MobileAccordion>


                        {/* =================================
                            RESOURCES
                        ================================== */}

                        <MobileAccordion
                            title="Resources"
                            open={expanded === "resources"}
                            onClick={() =>
                                toggleAccordion("resources")
                            }
                        >
                            <MobileLink
                                to="/resources"
                                title="Documentation"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/resources/blog"
                                title="Blog"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/resources/guides"
                                title="Guides"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/resources/support"
                                title="Support Center"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/resources/community"
                                title="Community"
                                onClick={closeMenu}
                            />

                            <MobileLink
                                to="/resources/api"
                                title="API Documentation"
                                onClick={closeMenu}
                            />

                        </MobileAccordion>


                        {/* =================================
                            PRICING
                        ================================== */}

                        <Link
                            to="/pricing"
                            onClick={closeMenu}
                            className="flex w-full border-b border-white/10 py-5 text-[16px] font-medium transition hover:text-white/70"
                        >
                            Pricing
                        </Link>


                        {/* =================================
                            ACTION BUTTONS
                        ================================== */}

                        <div className="mt-8 space-y-3">

                            {/* Login */}
                            <Link
                                to="/login"
                                onClick={closeMenu}
                                className="flex w-full items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-[15px] font-semibold transition hover:bg-white hover:text-[#0d0224]"
                            >
                                Login
                            </Link>


                            {/* Book Demo */}
                            <Link
                                to="/contact"
                                onClick={closeMenu}
                                className="flex w-full items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-[15px] font-semibold transition hover:bg-white hover:text-[#0d0224]"
                            >
                                Book a demo
                            </Link>


                            {/* Get Started */}
                            <Link
                                to="/get-started"
                                onClick={closeMenu}
                                className="flex w-full items-center justify-center rounded-full bg-[#7046f5] px-6 py-3.5 text-[15px] font-semibold transition hover:bg-[#825cf7]"
                            >
                                Get started
                            </Link>

                        </div>

                    </div>

                </div>
            )}
        </>
    );
}


/* =====================================================
   MOBILE ACCORDION
===================================================== */

function MobileAccordion({
    title,
    open,
    onClick,
    children,
}) {
    return (
        <div className="border-b border-white/10">

            <button
                type="button"
                onClick={onClick}
                className="flex w-full items-center justify-between py-5 text-left text-[16px] font-medium transition hover:text-white/70"
            >
                <span>
                    {title}
                </span>

                <ChevronDown
                    size={19}
                    strokeWidth={1.8}
                    className={`transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                />

            </button>


            {/* Accordion Content */}
            {open && (
                <div className="space-y-1 pb-5 pl-3">

                    {children}

                </div>
            )}

        </div>
    );
}


/* =====================================================
   MOBILE LINK
===================================================== */

function MobileLink({
    to,
    title,
    onClick,
}) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="block rounded-lg px-3 py-3 text-[14px] text-white/65 transition hover:bg-white/5 hover:text-white"
        >
            {title}
        </Link>
    );
}


export default MobileMenu;