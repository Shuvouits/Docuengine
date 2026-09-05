import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {

    const location = useLocation();

    const token = localStorage.getItem("token");


    /*
    |--------------------------------------------------------------------------
    | NOT AUTHENTICATED
    |--------------------------------------------------------------------------
    */

    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );

    }


    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATED
    |--------------------------------------------------------------------------
    */

    return <Outlet />;
}

export default ProtectedRoute;