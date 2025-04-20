import {SortOption} from "./SortOption";

// Serializable date range type to replace react-day-picker's DateRange
export interface SerializableDateRange {
    from?: string; // ISO date string
    to?: string;   // ISO date string
}

export interface Filter {
    propertyId: number;
    dateRange: SerializableDateRange | undefined;
    roomCount: number;
    isAccessible: boolean;
    guests: Record<string, number>;
    bedTypes: {
        singleBed: boolean;
        doubleBed: boolean;
    };
    bedCount: number;
    ratings: number[];
    amenities: string[];
    roomSize: [number, number];
    sortBy: SortOption;
}

