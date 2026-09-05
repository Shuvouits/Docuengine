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


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =====================================================
                    FRONTEND
                ====================================================== */}

        <Route element={<FrontendLayout />}>

          <Route
            path="/"
            element={<HomePage />}
          />

        </Route>


        {/* =====================================================
                    PUBLIC / AUTHENTICATION
                ====================================================== */}

        <Route element={<PublicRoute />}>

          <Route
            path="/login"
            element={<LoginPage />}
          />

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


        {/* =====================================================
                    FALLBACK
                ====================================================== */}

        <Route
          path="*"
          element={<HomePage />}
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;