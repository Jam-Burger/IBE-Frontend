import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BaseState, StateStatus} from "../types/common";
import {DateRange} from "react-day-picker";

export enum SortOption {
    PRICE_LOW_TO_HIGH = 'PRICE_LOW_TO_HIGH',
    PRICE_HIGH_TO_LOW = 'PRICE_HIGH_TO_LOW',
    RATING_HIGH_TO_LOW = 'RATING_HIGH_TO_LOW',
    CAPACITY_HIGH_TO_LOW = 'CAPACITY_HIGH_TO_LOW',
    ROOM_SIZE_LARGE_TO_SMALL = 'ROOM_SIZE_LARGE_TO_SMALL'
}

export interface GuestCounts {
    [categoryName: string]: number;
}

export interface RoomFiltersState extends BaseState {
    propertyId: number;
    bedTypes: {
        singleBed: boolean;
        doubleBed: boolean;
    };
    ratings: string[];
    amenities: string[];
    priceRange: [number, number];
    capacity: number | null;
    roomSize: [number, number];
    sortBy: SortOption;
    roomTypeName: string | null;
    dateRange: DateRange | null;
    guests: GuestCounts;
    roomCount: number;
    isAccessible: boolean;
}

const initialState: RoomFiltersState = {
    status: StateStatus.IDLE,
    error: null,
    propertyId: 9,
    bedTypes: {
        singleBed: false,
        doubleBed: false,
    },
    ratings: [],
    amenities: [],
    priceRange: [0, 1000],
    capacity: null,
    roomSize: [0, 2000],
    sortBy: SortOption.RATING_HIGH_TO_LOW,
    roomTypeName: null,
    dateRange: null,
    guests: {},
    roomCount: 1,
    isAccessible: false
};

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        setPropertyId(state, action: PayloadAction<number>) {
            state.propertyId = action.payload;
        },
        toggleSingleBed(state) {
            state.bedTypes.singleBed = !state.bedTypes.singleBed;
        },
        toggleDoubleBed(state) {
            state.bedTypes.doubleBed = !state.bedTypes.doubleBed;
        },
        setRatings(state, action: PayloadAction<string[]>) {
            state.ratings = action.payload;
        },
        setAmenities(state, action: PayloadAction<string[]>) {
            state.amenities = action.payload;
        },
        setPriceRange(state, action: PayloadAction<[number, number]>) {
            state.priceRange = action.payload;
        },
        setCapacity(state, action: PayloadAction<number | null>) {
            state.capacity = action.payload;
        },
        setRoomSize(state, action: PayloadAction<[number, number]>) {
            state.roomSize = action.payload;
        },
        setSortOption(state, action: PayloadAction<SortOption>) {
            state.sortBy = action.payload;
        },
        setRoomTypeName(state, action: PayloadAction<string | null>) {
            state.roomTypeName = action.payload;
        },
        setDateRange(state, action: PayloadAction<DateRange | null>) {
            state.dateRange = action.payload;
        },
        setGuests(state, action: PayloadAction<GuestCounts>) {
            state.guests = action.payload;
        },
        updateGuestCount(state, action: PayloadAction<{ category: string, count: number }>) {
            const {category, count} = action.payload;
            state.guests = {
                ...state.guests,
                [category]: count
            };
        },
        setRoomCount(state, action: PayloadAction<number>) {
            state.roomCount = action.payload;
        },
        setIsAccessible(state, action: PayloadAction<boolean>) {
            state.isAccessible = action.payload;
        },
        resetFilters(state) {
            return {
                ...initialState,
                propertyId: state.propertyId // Keep the property ID when resetting
            };
        }
    }
});

export const {
    setPropertyId,
    toggleSingleBed,
    toggleDoubleBed,
    setRatings,
    setAmenities,
    setPriceRange,
    setCapacity,
    setRoomSize,
    setSortOption,
    setRoomTypeName,
    setDateRange,
    setGuests,
    updateGuestCount,
    setRoomCount,
    setIsAccessible,
    resetFilters
} = filterSlice.actions;

export default filterSlice.reducer; 