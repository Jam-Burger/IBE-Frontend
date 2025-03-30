import {SortOption} from './SortOption';
import {ConfigType} from './ConfigType';

export interface RoomsListConfig {
    tenantId: string;
    configType: ConfigType;
    configData: {
        banner: {
            enabled: boolean;
            imageUrl: string;
        };
        steps: {
            enabled: boolean;
            labels: string[];
        };
        filters: {
            sortOptions: {
                enabled: boolean;
                default: SortOption;
                options: {
                    value: SortOption;
                    label: string;
                    enabled: boolean;
                }[];
            };
            filterGroups: {
                ratings: {
                    enabled: boolean;
                    label: string;
                    options: {
                        value: number;
                        label: string;
                        enabled: boolean;
                    }[];
                };
                bedTypes: {
                    enabled: boolean;
                    label: string;
                };
                bedCount: {
                    enabled: boolean;
                    label: string;
                    min: number;
                    max: number;
                    default: number;
                };
                roomSize: {
                    enabled: boolean;
                    label: string;
                    min: number;
                    max: number;
                };
                amenities: {
                    enabled: boolean;
                    label: string;
                };
            };
        };
    };
}