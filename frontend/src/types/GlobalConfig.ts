import {ConfigType} from "./ConfigType";

export interface GlobalConfig {
    tenantId: string;
    configType: ConfigType;
    configData: {
        brand: {
            logoUrl: string;
            companyName: string;
            pageTitle: string;
            footerLogoUrl: string;
        };
        languages: { code: string; name: string }[];
        currencies: { code: string; symbol: string }[];
        properties: number[];
    };
}
