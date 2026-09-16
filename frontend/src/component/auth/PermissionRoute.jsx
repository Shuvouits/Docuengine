import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import api from "../../api/axios";

const PermissionRoute = ({
    permission = null,
    permissions = [],
    requireAll = false,
    tenantAdminOnly = false,
    platformOwnerOnly = false,
    allowPlatformOwner = false,
    fallback = "/admin/sessions",
}) => {
    const [authData, setAuthData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [authFailed, setAuthFailed] =
        useState(false);

    useEffect(() => {
        let mounted = true;

        const loadAccess = async () => {
            try {
                const response = await api.get(
                    "/auth/me"
                );

                if (!mounted) {
                    return;
                }

                setAuthData(
                    response.data?.data || null
                );
            } catch (error) {
                if (!mounted) {
                    return;
                }

                if (
                    error.response?.status === 401
                ) {
                    localStorage.removeItem(
                        "token"
                    );
                }

                setAuthFailed(true);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadAccess();

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#19b5fe]" />

                    <p className="mt-3 text-sm text-slate-500">
                        Checking access...
                    </p>
                </div>
            </div>
        );
    }

    if (
        authFailed ||
        !authData?.user
    ) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    const user =
        authData.user;

    const currentTenant =
        authData.current_tenant || null;

    const isPlatformOwner =
        Boolean(
            user.is_platform_owner
        );

    /*
    |--------------------------------------------------------------------------
    | Platform Owner Only
    |--------------------------------------------------------------------------
    */

    if (platformOwnerOnly) {
        if (!isPlatformOwner) {
            return (
                <Navigate
                    to={fallback}
                    replace
                />
            );
        }

        return <Outlet />;
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Admin Only
    |--------------------------------------------------------------------------
    */

    if (tenantAdminOnly) {
        if (isPlatformOwner) {
            return <Outlet />;
        }

        if (!currentTenant) {
            return (
                <Navigate
                    to={fallback}
                    replace
                />
            );
        }

        const roles =
            currentTenant?.access?.roles || [];

        const isTenantAdmin =
            roles.includes("MSP Admin") ||
            currentTenant?.membership?.role ===
                "admin";

        if (!isTenantAdmin) {
            return (
                <Navigate
                    to={fallback}
                    replace
                />
            );
        }

        return <Outlet />;
    }

    /*
    |--------------------------------------------------------------------------
    | Optional Platform Owner Bypass
    |--------------------------------------------------------------------------
    */

    if (
        allowPlatformOwner &&
        isPlatformOwner
    ) {
        return <Outlet />;
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Required
    |--------------------------------------------------------------------------
    */

    if (!currentTenant) {
        return (
            <Navigate
                to={fallback}
                replace
            />
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Permissions
    |--------------------------------------------------------------------------
    */

    const tenantPermissions =
        currentTenant?.access?.permissions || [];

    const requiredPermissions = [
        ...(permission
            ? [permission]
            : []),

        ...permissions,
    ];

    if (
        requiredPermissions.length === 0
    ) {
        return <Outlet />;
    }

    const hasAccess = requireAll
        ? requiredPermissions.every(
              (item) =>
                  tenantPermissions.includes(
                      item
                  )
          )
        : requiredPermissions.some(
              (item) =>
                  tenantPermissions.includes(
                      item
                  )
          );

    if (!hasAccess) {
        return (
            <Navigate
                to={fallback}
                replace
            />
        );
    }

    return <Outlet />;
};

export default PermissionRoute;