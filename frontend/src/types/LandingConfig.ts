import {ConfigType} from "./ConfigType";

export interface LandingConfig {
    tenantId: string;
    configType: ConfigType;
    configData: {
        banner: {
            enabled: boolean;
            imageUrl: string;
        };
        searchForm: {
            lengthOfStay: {
                min: number;
                max: number;
            };
            guestOptions: {
                enabled: boolean;
                min: number;
                max: number;
                categories: {
                    name: string;
                    enabled: boolean;
                    min: number;
                    max: number;
                    label: string;
                    default: number;
                }[];
            };
            roomOptions: {
                enabled: boolean;
                min: number;
                max: number;
                default: number;
            };
            accessibility: {
                enabled: boolean;
                label: string;
            };
        };
    };
}