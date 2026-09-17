import {
    cloneElement,
    isValidElement,
    useCallback,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../component/admin/AdminSidebar";
import AdminTopbar from "../../component/admin/AdminTopbar";

import api from "../../api/axios";

function AdminLayout({ children }) {
    const navigate = useNavigate();

    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    const [authData, setAuthData] =
        useState(null);

    const [authLoading, setAuthLoading] =
        useState(true);

    /*
    |--------------------------------------------------------------------------
    | Load Authenticated User
    |--------------------------------------------------------------------------
    */

    const loadAuthUser = useCallback(
        async (showLoader = true) => {
            if (showLoader) {
                setAuthLoading(true);
            }

            try {
                const response =
                    await api.get("/auth/me");

                setAuthData(
                    response.data?.data || null
                );
            } catch (error) {
                console.error(
                    "Failed to load authenticated user:",
                    error
                );

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {
                    localStorage.removeItem("token");

                    navigate("/login", {
                        replace: true,
                    });
                }
            } finally {
                if (showLoader) {
                    setAuthLoading(false);
                }
            }
        },
        [navigate]
    );

    /*
    |--------------------------------------------------------------------------
    | Initial Auth Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadAuthUser();
    }, [loadAuthUser]);

    /*
    |--------------------------------------------------------------------------
    | Tenant Branding Variables
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            authLoading ||
            !authData?.current_tenant
        ) {
            return;
        }

        const branding =
            authData.current_tenant.branding ||
            null;

        const primaryColor =
            branding?.primary_color ||
            "#19b5fe";

        const secondaryColor =
            branding?.secondary_color ||
            "#F4F7F5";

        document.documentElement.style.setProperty(
            "--brand-primary",
            primaryColor
        );

        document.documentElement.style.setProperty(
            "--brand-secondary",
            secondaryColor
        );
    }, [
        authLoading,
        authData?.current_tenant?.id,
        authData?.current_tenant?.branding?.primary_color,
        authData?.current_tenant?.branding?.secondary_color,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Layout
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundColor:
                    "var(--brand-secondary)",
            }}
        >
            {/* Sidebar */}

            <AdminSidebar
                mobileOpen={mobileSidebarOpen}
                onClose={() =>
                    setMobileSidebarOpen(false)
                }
                authData={authData}
                authLoading={authLoading}
            />

            {/* Main Area */}

            <div className="min-h-screen lg:pl-[270px]">
                {/* Topbar */}

                <AdminTopbar
                    onMenuClick={() =>
                        setMobileSidebarOpen(true)
                    }
                    authData={authData}
                    authLoading={authLoading}
                />

                {/* Page Content */}

                <main
                    className="min-h-[calc(100vh-80px)] p-5 lg:p-8"
                    style={{
                        backgroundColor:
                            "var(--brand-secondary)",
                    }}
                >
                    <div className="mx-auto max-w-[1600px]">
                        {isValidElement(children)
                            ? cloneElement(children, {
                                authData,
                                authLoading,
                                refreshAuth: () =>
                                    loadAuthUser(false),
                            })
                            : children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;