import { Navigate, Outlet } from "react-router-dom";

function PublicRoute() {

    const token = localStorage.getItem("token");


    /*
    |--------------------------------------------------------------------------
    | ALREADY LOGGED IN
    |--------------------------------------------------------------------------
    */

    if (token) {

        return (
            <Navigate
                to="/admin/dashboard"
                replace
            />
        );

    }


    /*
    |--------------------------------------------------------------------------
    | GUEST
    |--------------------------------------------------------------------------
    */

    return <Outlet />;
}

export default PublicRoute;