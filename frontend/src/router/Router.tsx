import {createBrowserRouter, Navigate} from "react-router-dom";
import {AppLayout} from "../layouts/AppLayout";
import {HomePage, NotFoundPage, RoomsListPage} from "../pages";
import {Routes} from "./routes";
import {AuthCallback} from "../components/auth/AuthCallback";

const DEFAULT_TENANT_ID = import.meta.env.VITE_TENANT_ID;
export const Router = createBrowserRouter([
    {
        path: Routes.ROOT,
        element: <Navigate to={`/${DEFAULT_TENANT_ID}`} replace/>
    },
    {
        path: Routes.AUTH_CALLBACK,
        element: <AuthCallback/>,
    },
    {
        path: Routes.AUTH_LOGOUT,
        element: <Navigate to="/" replace/>,
    },
    {
        path: Routes.HOME,
        element: <AppLayout/>,
        children: [
            {index: true, element: <HomePage/>},
        ],
    },
    {
        path: Routes.ROOMS_LIST,
        element: <AppLayout/>,
        children: [
            {index: true, element: <RoomsListPage/>},
        ],
    },
    {
        path: Routes.NOT_FOUND,
        element: <NotFoundPage/>,
    },
]); 