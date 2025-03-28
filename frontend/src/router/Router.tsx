import {createHashRouter, Navigate} from "react-router-dom";
import {AppLayout} from "../layouts/AppLayout";
import {HomePage, LoginPage, NotFoundPage, RoomPage} from "../pages";
import {Routes} from "./routes";

const DEFAULT_TENANT_ID = import.meta.env.VITE_TENANT_ID || '1';
// Create a redirect component to handle the default tenant redirection
const DefaultTenantRedirect = () => {
    return <Navigate to={`/${DEFAULT_TENANT_ID}`} replace/>;
};

// Using createHashRouter instead of createBrowserRouter for better CloudFront compatibility
export const Router = createHashRouter([
    {
        // Root path redirects to default tenant
        path: Routes.ROOT,
        element: <DefaultTenantRedirect/>
    },
    {
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
        path: Routes.ROOMPAGE,
        element: <AppLayout/>,
        children: [
            {index: true, element: <RoomPage/>},
        ],
    },

    {
        path: Routes.NOT_FOUND,
        element: <NotFoundPage/>,
    },
]); 