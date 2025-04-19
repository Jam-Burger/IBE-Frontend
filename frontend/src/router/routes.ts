export const Routes = {
    ROOT: "/",
    HOME: "/:tenantId",
    ROOMS_LIST: "/:tenantId/rooms-list",
    AUTH_CALLBACK: "/auth/callback",
    AUTH_LOGOUT: "/auth/logout",
    CHECKOUT: "/:tenantId/checkout",
    CONFIRMATION: "/:tenantId/confirmation/:bookingId",
    REVIEW: "/:tenantId/review/:bookingId",
    BOOKINGS: "/:tenantId/bookings",
    NOT_FOUND: "*",
} as const;
