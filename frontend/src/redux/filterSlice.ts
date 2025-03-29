import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BaseState, StateStatus} from "../types/common";

export enum SortOption {
    PRICE_LOW_TO_HIGH = 'PRICE_LOW_TO_HIGH',
    PRICE_HIGH_TO_LOW = 'PRICE_HIGH_TO_LOW',
    RATING_HIGH_TO_LOW = 'RATING_HIGH_TO_LOW',
    CAPACITY_HIGH_TO_LOW = 'CAPACITY_HIGH_TO_LOW',
    ROOM_SIZE_LARGE_TO_SMALL = 'ROOM_SIZE_LARGE_TO_SMALL'
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
    roomSize: [number, number]; // in square feet
    sortBy: SortOption;
    roomTypeName: string | null;
    searchQuery: string;
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
    searchQuery: ''
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
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
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
    setSearchQuery,
    resetFilters
} = filterSlice.actions;

export default filterSlice.reducer; 