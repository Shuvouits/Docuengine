export const resolvePostLoginPath = (authData) => {
    const user = authData?.user || null;

    const currentTenant =
        authData?.current_tenant || null;

    if (user?.is_platform_owner) {
        return "/admin/dashboard";
    }

    if (!currentTenant) {
        return "/admin/sessions";
    }

    const roles =
        currentTenant?.access?.roles || [];

    const permissions =
        currentTenant?.access?.permissions || [];

    const hasRole = (role) =>
        roles.includes(role);

    const can = (permission) =>
        permissions.includes(permission);

    if (
        hasRole("MSP Admin") ||
        currentTenant?.membership?.role === "admin"
    ) {
        return "/admin/dashboard";
    }

    if (can("users.view")) {
        return "/admin/users";
    }

    if (can("roles.view")) {
        return "/admin/roles";
    }

    if (can("security_groups.view")) {
        return "/admin/security-groups";
    }

    if (can("access_reviews.view")) {
        return "/admin/access-reviews";
    }

    if (can("security.events.view")) {
        return "/admin/security-events";
    }

    if (can("security.ip_allowlist.view")) {
        return "/admin/ip-access";
    }

    return "/admin/sessions";
};