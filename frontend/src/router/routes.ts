export const Routes = {
    ROOT: "/",
    HOME: "/:tenantId",
    LOGIN: "/:tenantId/login",
    DEMO: "/:tenantId/demo",
    ROOMS_LIST: "/:tenantId/rooms-list",
    CHECKOUT: "/:tenantId/checkout",
    NOT_FOUND: "*",
} as const;
