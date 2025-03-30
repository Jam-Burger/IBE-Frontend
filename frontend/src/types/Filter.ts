import {DateRange} from "react-day-picker";
import {SortOption} from "./SortOption";

export interface Filter {
    propertyId: number;
    dateRange: DateRange | null;
    roomCount: number;
    isAccessible: boolean;
    guests: Record<string, number>;
    bedTypes: {
        singleBed: boolean;
        doubleBed: boolean;
    };
    ratings: number[];
    amenities: string[];
    roomSize: [number, number];
    sortBy: SortOption;
}

