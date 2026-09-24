import { BrowserRouter, Routes, Route } from "react-router-dom";

import FrontendLayout from "./component/frontend/layouts/FrontendLayout";
import HomePage from "./pages/frontend/HomePage";

import LoginPage from "./pages/auth/LoginPage";
import TwoFactorChallengePage from "./pages/auth/TwoFactorChallengePage";
import AcceptInvitationPage from "./pages/auth/AcceptInvitationPage";

import AdminLayout from "./component/admin/AdminLayout";

import ProtectedRoute from "./component/auth/ProtectedRoute";
import PublicRoute from "./component/auth/PublicRoute";
import PermissionRoute from "./component/auth/PermissionRoute";

import DashboardPage from "./pages/backend/DashboardPage";

import TenantsPage from "./pages/backend/tenants/TenantsPage";
import CreateTenantPage from "./pages/backend/tenants/CreateTenantPage";
import EditTenantPage from "./pages/backend/tenants/EditTenantPage";

import OrganizationOverviewPage from "./pages/backend/organization/OrganizationOverviewPage";
import GeneralSettingsPage from "./pages/backend/organization/GeneralSettingsPage";
import BrandingPage from "./pages/backend/organization/BrandingPage";
import RegionalSettingsPage from "./pages/backend/organization/RegionalSettingsPage";
import TerminologyPage from "./pages/backend/organization/TerminologyPage";
import FeatureFlagsPage from "./pages/backend/organization/FeatureFlagsPage";

import MfaRecoveryPage from "./pages/backend/security/MfaRecoveryPage";
import ActiveSessionsPage from "./pages/backend/security/ActiveSessionsPage";

import UsersPage from "./pages/backend/users/UsersPage";
import InvitationsPage from "./pages/backend/invitations/InvitationsPage";

import NotFoundPage from "./pages/errors/NotFoundPage";
import RolesPage from "./pages/backend/roles/RolesPage";
import SecurityGroupsPage from "./pages/backend/security-groups/SecurityGroupsPage";
import AccessReviewsPage from "./pages/backend/access-reviews/AccessReviewsPage";
import SecurityEventsPage from "./pages/backend/security-events/SecurityEventsPage";
import IpAccessPage from "./pages/backend/ip-access/IpAccessPage";
import TenantDetailsPage from "./pages/backend/tenants/TenantDetailsPage";
import AuditLogsPage from "./pages/backend/audit-logs/AuditLogsPage";
import MuseumPage from "./pages/backend/museum/MuseumPage";
import AssetLayoutsPage from "./pages/backend/asset-layouts/AssetLayoutsPage";
import CreateAssetLayoutPage from "./pages/backend/asset-layouts/CreateAssetLayoutPage";
import AssetLayoutDetailsPage from "./pages/backend/asset-layouts/AssetLayoutDetailsPage";
import OptionListsPage from "./pages/backend/option-lists/OptionListsPage";
import CompanyLayoutsPage from "./pages/backend/company-layouts/CompanyLayoutsPage";


function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* FRONTEND */}

                <Route path="/" element={<FrontendLayout />}>
                    <Route index element={<HomePage />} />
                </Route>

                {/* PUBLIC AUTH */}

                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/two-factor-challenge" element={<TwoFactorChallengePage />} />
                </Route>

                {/* PUBLIC INVITATION */}

                <Route path="/accept-invitation" element={<AcceptInvitationPage />} />

                {/* AUTHENTICATED ADMIN AREA */}

                <Route element={<ProtectedRoute />}>

                    {/* DASHBOARD - Platform Owner / MSP Admin only */}

                    <Route element={<PermissionRoute tenantAdminOnly />}>
                        <Route path="/admin/dashboard" element={<AdminLayout><DashboardPage /></AdminLayout>} />
                    </Route>

                    {/* PLATFORM OWNER */}

                    <Route element={<PermissionRoute platformOwnerOnly />}>
                        <Route path="/admin/tenants" element={<AdminLayout><TenantsPage /></AdminLayout>} />
                        <Route path="/admin/tenants/create" element={<AdminLayout><CreateTenantPage /></AdminLayout>} />
                        <Route path="/admin/tenants/:id/edit" element={<AdminLayout><EditTenantPage /></AdminLayout>} />
                        <Route path="/admin/tenants/:id" element={<AdminLayout><TenantDetailsPage /></AdminLayout>} />
                    </Route>

                    {/* ORGANIZATION OVERVIEW */}

                    <Route element={<PermissionRoute permission="organization.view" />}>
                        <Route path="/admin/organization" element={<AdminLayout><OrganizationOverviewPage /></AdminLayout>} />
                    </Route>

                    {/* ORGANIZATION SETTINGS */}

                    <Route element={<PermissionRoute permission="organization.update" />}>
                        <Route path="/admin/organization/settings" element={<AdminLayout><GeneralSettingsPage /></AdminLayout>} />
                        <Route path="/admin/organization/branding" element={<AdminLayout><BrandingPage /></AdminLayout>} />
                        <Route path="/admin/organization/regional" element={<AdminLayout><RegionalSettingsPage /></AdminLayout>} />
                        <Route path="/admin/organization/terminology" element={<AdminLayout><TerminologyPage /></AdminLayout>} />
                        <Route path="/admin/organization/feature-flags" element={<AdminLayout><FeatureFlagsPage /></AdminLayout>} />
                    </Route>

                    {/* USERS */}

                    <Route element={<PermissionRoute permission="users.view" />}>
                        <Route path="/admin/users" element={<AdminLayout><UsersPage /></AdminLayout>} />
                    </Route>

                    {/* INVITATIONS */}

                    <Route element={<PermissionRoute permission="users.invite" />}>
                        <Route path="/admin/invitations" element={<AdminLayout><InvitationsPage /></AdminLayout>} />
                    </Route>

                    {/* ROLES */}

                    <Route element={<PermissionRoute permission="roles.view" />}>
                        <Route path="/admin/roles" element={<AdminLayout><RolesPage /></AdminLayout>} />
                    </Route>

                    {/* SECURITY EVENTS */}

                    <Route element={<PermissionRoute permission="security.events.view" />}>
                        <Route path="/admin/security-events" element={<AdminLayout><SecurityEventsPage /></AdminLayout>} />
                    </Route>

                    {/* IP ACCESS */}

                    <Route element={<PermissionRoute permission="security.ip_allowlist.view" />}>
                        <Route path="/admin/ip-access" element={<AdminLayout><IpAccessPage /></AdminLayout>} />
                    </Route>

                    {/* SECURITY GROUPS */}

                    <Route element={<PermissionRoute permission="security_groups.view" />}>
                        <Route path="/admin/security-groups" element={<AdminLayout><SecurityGroupsPage /></AdminLayout>} />
                    </Route>

                    {/* ACCESS REVIEWS */}

                    <Route element={<PermissionRoute permission="access_reviews.view" />}>
                        <Route path="/admin/access-reviews" element={<AdminLayout><AccessReviewsPage /></AdminLayout>} />
                    </Route>

                    {/* PERSONAL ACCOUNT SECURITY - Every authenticated user */}

                    <Route path="/admin/mfa" element={<AdminLayout><MfaRecoveryPage /></AdminLayout>} />
                    <Route path="/admin/sessions" element={<AdminLayout><ActiveSessionsPage /></AdminLayout>} />


                    {/* AUDIT LOGS */}

                    <Route element={<PermissionRoute permission="audit.view" />}>
                        <Route path="/admin/audit-logs" element={<AdminLayout><AuditLogsPage /></AdminLayout>} />
                    </Route>

                    {/* MUSEUM / ARCHIVE */}

                    <Route element={<PermissionRoute permission="archive.view" />}>
                        <Route path="/admin/museum" element={<AdminLayout><MuseumPage /></AdminLayout>} />
                    </Route>

                    {/* ASSET LAYOUTS */}

                    <Route element={<PermissionRoute permission="asset_layouts.view" />}>
                        <Route path="/admin/asset-layouts" element={<AdminLayout><AssetLayoutsPage /></AdminLayout>} />
                        <Route path="/admin/asset-layouts/:id" element={<AdminLayout><AssetLayoutDetailsPage /></AdminLayout>} />
                    </Route>

                    {/* ASSET LAYOUTS - MANAGE */}

                    <Route element={<PermissionRoute permission="asset_layouts.manage" />}>
                        <Route path="/admin/asset-layouts/create" element={<AdminLayout><CreateAssetLayoutPage /></AdminLayout>} />
                    </Route>


                    <Route element={<PermissionRoute permission="option_lists.view" />}>
                        <Route path="/admin/option-lists" element={<AdminLayout><OptionListsPage /></AdminLayout>} />
                    </Route>


                    {/* COMPANY LAYOUTS */}

                    <Route element={<PermissionRoute permission="asset_layouts.activate" />}>
                        <Route path="/admin/company-layouts" element={<AdminLayout><CompanyLayoutsPage /></AdminLayout>} />
                    </Route>

                </Route>

                {/* FALLBACK */}

                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;