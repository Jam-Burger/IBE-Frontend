

export const Routes = {
    ROOT: "/",
    HOME: "/:tenantId",
    LOGIN: "/:tenantId/login",
    DEMO: "/:tenantId/demo",
    ROOMPAGE:"/:tenantId/roompage",
    ROOMDETAILMODAL:"/:tenantId/roomdetail",
    NOT_FOUND: "*",
} as const;
