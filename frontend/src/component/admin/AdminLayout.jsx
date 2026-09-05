import { useState } from "react";

import AdminSidebar from "../../component/admin/AdminSidebar";
import AdminTopbar from "../../component/admin/AdminTopbar";

function AdminLayout({ children }) {

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc]">

            {/* =========================
                SIDEBAR
            ========================== */}

            <AdminSidebar
                mobileOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />


            {/* =========================
                MAIN AREA
            ========================== */}

            <div className="min-h-screen lg:pl-[270px]">

                {/* Topbar */}

                <AdminTopbar
                    onMenuClick={() => setMobileSidebarOpen(true)}
                />


                {/* Page Content */}

                <main className="p-5 lg:p-8">

                    <div className="mx-auto max-w-[1600px]">
                        {children}
                    </div>

                </main>

            </div>

        </div>
    );
}

export default AdminLayout;