import {
    Menu,
    Bell,
    Search,
    ChevronDown,
    User,
    Settings,
    LogOut,
} from "lucide-react";
import ProfileDropdown from "./layouts/ProfileDropdown";

function AdminTopbar({ onMenuClick = () => {} }) {

    return (
        <header className="sticky top-0 z-30 h-[82px] border-b border-slate-200 bg-white/95 backdrop-blur">

            <div className="flex h-full items-center justify-between px-5 lg:px-8">

                {/* =========================
                    LEFT SIDE
                ========================== */}

                <div className="flex items-center gap-4">

                    {/* Mobile Menu */}
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                    >
                        <Menu size={22} />
                    </button>


                    {/* Search */}
                    <div className="hidden w-[320px] md:block">

                        <div className="relative">

                            <Search
                                size={18}
                                strokeWidth={1.8}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                placeholder="Search your workspace..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#19b5fe] focus:bg-white focus:ring-2 focus:ring-[#19b5fe]/10"
                            />

                        </div>

                    </div>

                </div>


                {/* =========================
                    RIGHT SIDE
                ========================== */}

                <div className="flex items-center gap-3">

                    {/* Notifications */}

                    <button
                        type="button"
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <Bell
                            size={19}
                            strokeWidth={1.8}
                        />

                        <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-[#19b5fe] ring-2 ring-white" />
                    </button>


                    {/* Divider */}

                    <div className="hidden h-8 w-px bg-slate-200 sm:block" />


                    

                   {/* User Info */}

                       <ProfileDropdown />

                </div>

            </div>

        </header>
    );
}

export default AdminTopbar;