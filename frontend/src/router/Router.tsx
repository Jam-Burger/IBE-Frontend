import {createBrowserRouter, Navigate} from "react-router-dom";
import {AppLayout} from "../layouts/AppLayout";
import {HomePage, RoomsListPage} from "../pages";
import {Routes} from "./routes";
import {AuthCallback} from "../components/auth/AuthCallback";
import {LogoutRedirect} from "../components/auth/LogoutRedirect";
import {Suspense} from "react";
import {CheckoutPage, ConfirmationPage, MyBookings, ReviewPage, NotFoundPage} from "../pages/lazy";
import LoadingOverlay from "../components/ui/LoadingOverlay";

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
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingOverlay message="Loading Checkout..." />}>
                        <CheckoutPage/>
                    </Suspense>
                ),
            },
        ],
    },
    {
        path: Routes.CONFIRMATION,
        element: <AppLayout/>,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingOverlay message="Loading Confirmation..." />}>
                        <ConfirmationPage/>
                    </Suspense>
                ),
            },
        ],
    },
    {
        path: Routes.BOOKINGS,
        element: <AppLayout/>,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingOverlay message="Loading Bookings..." />}>
                        <MyBookings/>
                    </Suspense>
                ),
            },
        ],
    },
    {
        path: Routes.REVIEW,
        element: <AppLayout/>,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingOverlay message="Loading Review..." />}>
                        <ReviewPage/>
                    </Suspense>
                ),
            },
        ],
    },
    {
        path: Routes.NOT_FOUND,
        element: (
            <Suspense fallback={<LoadingOverlay message="Loading..." />}>
                <NotFoundPage/>
            </Suspense>
        ),
    },
]); 