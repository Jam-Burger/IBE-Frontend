import {createBrowserRouter, Navigate} from "react-router-dom";
import {AppLayout} from "../layouts/AppLayout";
import {CheckoutPage, HomePage, NotFoundPage, RoomsListPage,MyBookings} from "../pages";
import {Routes} from "./routes";
import {AuthCallback} from "../components/auth/AuthCallback";
import {LogoutRedirect} from "../components/auth/LogoutRedirect";
import ConfirmationPage from "../pages/ConfirmationPage";
import ReviewPage from "../pages/ReviewPage";

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
        element: <LogoutRedirect/>,
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
        path: Routes.CONFIRMATION,
        element: <AppLayout/>,
        children: [
            {index: true, element: <ConfirmationPage/>},
        ],
    },
    {
        path: Routes.BOOKINGS,
        element: <AppLayout/>,
        children: [
            {index: true, element: <MyBookings/>},
        ],
    },
    {
        path: Routes.REVIEW,
        element: <AppLayout/>,
        children: [
            {index: true, element: <ReviewPage/>},
        ],
    },
    {
        path: Routes.NOT_FOUND,
        element: <NotFoundPage/>,
    },
]); 