import { BrowserRouter, Routes, Route } from "react-router-dom";

import FrontendLayout from "./component/frontend/layouts/FrontendLayout";
import HomePage from "./pages/frontend/HomePage";

import LoginPage from "./pages/auth/LoginPage";

import AdminLayout from "./component/admin/AdminLayout";
import DashboardPage from "./pages/backend/DashboardPage";
import ProtectedRoute from "./component/auth/ProtectedRoute";
import PublicRoute from "./component/auth/PublicRoute";

import CreateTenantPage from "./pages/backend/tenants/CreateTenantPage";
import TenantsPage from "./pages/backend/tenants/TenantsPage";
import EditTenantPage from "./pages/backend/tenants/EditTenantPage";

import NotFoundPage from "./pages/errors/NotFoundPage";
import OrganizationOverviewPage from "./pages/backend/organization/OrganizationOverviewPage";
import GeneralSettingsPage from "./pages/backend/organization/GeneralSettingsPage";
import BrandingPage from "./pages/backend/organization/BrandingPage";
import RegionalSettingsPage from "./pages/backend/organization/RegionalSettingsPage";
import TerminologyPage from "./pages/backend/organization/TerminologyPage";
import FeatureFlagsPage from "./pages/backend/organization/FeatureFlagsPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =====================================================
                    FRONTEND
                ====================================================== */}

                <Route path="/" element={<FrontendLayout />}>
                    <Route index element={<HomePage />} />
                </Route>

                {/* =====================================================
                    PUBLIC / AUTHENTICATION
                ====================================================== */}

                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                </Route>

                {/* =====================================================
                    PROTECTED ADMIN ROUTES
                ====================================================== */}

                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/admin/dashboard"
                        element={
                            <AdminLayout>
                                <DashboardPage />
                            </AdminLayout>
                        }
                    />

                    <Route
                        path="/admin/tenants"
                        element={
                            <AdminLayout>
                                <TenantsPage />
                            </AdminLayout>
                        }
                    />

                    <Route
                        path="/admin/tenants/create"
                        element={
                            <AdminLayout>
                                <CreateTenantPage />
                            </AdminLayout>
                        }
                    />

                    <Route
                        path="/admin/tenants/:id/edit"
                        element={
                            <AdminLayout>
                                <EditTenantPage />
                            </AdminLayout>
                        }
                    />

                </Route>

                <Route
    path="/admin/organization"
    element={
        <AdminLayout>
            <OrganizationOverviewPage />
        </AdminLayout>
    }
/>

<Route
    path="/admin/organization/settings"
    element={
        <AdminLayout>
            <GeneralSettingsPage />
        </AdminLayout>
    }
/>


<Route
    path="/admin/organization/branding"
    element={
        <AdminLayout>
            <BrandingPage />
        </AdminLayout>
    }
/>


<Route
    path="/admin/organization/regional"
    element={
        <AdminLayout>
            <RegionalSettingsPage />
        </AdminLayout>
    }
/>

<Route
    path="/admin/organization/terminology"
    element={
        <AdminLayout>
            <TerminologyPage />
        </AdminLayout>
    }
/>


<Route
    path="/admin/organization/feature-flags"
    element={
        <AdminLayout>
            <FeatureFlagsPage />
        </AdminLayout>
    }
/>
                {/* =====================================================
                    FALLBACK
                ====================================================== */}

                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;