export const Routes = {
    ROOT: "/",
    HOME: "/:tenantId",
    ROOMS_LIST: "/:tenantId/rooms-list",
    AUTH_CALLBACK: "/auth/callback",
    AUTH_LOGOUT: "/auth/logout",
    NOT_FOUND: "*",
} as const;
