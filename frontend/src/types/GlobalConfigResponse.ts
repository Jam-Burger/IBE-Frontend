export interface GlobalConfigResponse {
    statusCode: string;
    message: string;
    timestamp: string;
    data: {
        tenantId: string;
        configType: string;
        updatedAt: number;
        configData: {
            brand: {
                logoUrl: string;
                companyName: string;
            };
            languages: { code: string; name: string }[];
            currencies: { code: string; symbol: string }[];
            properties: string[];
        };
    };
}
