export interface GlobalConfig {
    tenantId: string;
    configType: string;
    updatedAt: number;
    configData: {
        brand: {
            logoUrl: string;
            companyName: string;
            pageTitle: string;
        };
        languages: { code: string; name: string }[];
        currencies: { code: string; symbol: string }[];
        properties: number[];
    };
}
