import {createHashRouter, Navigate} from "react-router-dom";
import {AppLayout} from "../layouts/AppLayout";
import {CheckoutPage, HomePage, LoginPage, NotFoundPage, RoomsListPage} from "../pages";
import {Routes} from "./routes";

const DEFAULT_TENANT_ID = import.meta.env.VITE_TENANT_ID;
export const Router = createHashRouter([
    {
        path: Routes.ROOT,
        element: <Navigate to={`/${DEFAULT_TENANT_ID}`} replace/>
    },
    {
        path: Routes.LOGIN,
        element: <LoginPage/>,
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
        path: Routes.CHECKOUT,
        element: <AppLayout/>,
        children: [
            {index: true, element: <CheckoutPage/>},
        ],
    },
    {
        path: Routes.NOT_FOUND,
        element: <NotFoundPage/>,
    },
]); 