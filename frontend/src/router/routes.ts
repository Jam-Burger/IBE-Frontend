

export const Routes = {
    ROOT: "/",
    HOME: "/:tenantId",
    LOGIN: "/:tenantId/login",
    DEMO: "/:tenantId/demo",
    ROOMPAGE:"/:tenantId/roompage",
    NOT_FOUND: "*",
} as const;
