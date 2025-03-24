import {createBrowserRouter, Navigate} from "react-router-dom";
import {AppLayout} from "../layouts/AppLayout";
import {HomePage, LoginPage, NotFoundPage} from "../pages";
import {Routes} from "./routes";
import {DEFAULT_TENANT_ID} from "../lib/api-client";

// Create a redirect component to handle the default tenant redirection
const DefaultTenantRedirect = () => {
    return <Navigate to={`/${DEFAULT_TENANT_ID}`} replace/>;
};

export const Router = createBrowserRouter([
    {
        // Root path redirects to default tenant
        path: Routes.ROOT,
        element: <DefaultTenantRedirect/>
    },
    {
        // AppLayout will now capture the tenantId from the URL
        path: Routes.HOME,
        element: <AppLayout/>,
        children: [
            {index: true, element: <HomePage/>},
        ],
    },
    {
        path: Routes.LOGIN,
        element: <LoginPage/>,
    },
    {
        path: Routes.NOT_FOUND,
        element: <NotFoundPage/>,
    },
]); 