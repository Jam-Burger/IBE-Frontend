import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BaseState, Filter, SortOption, StateStatus} from '../types';
import {formatDateToYYYYMMDD} from '../lib/utils';

export interface RoomFiltersState extends BaseState {
    filter: Filter;
}

// Default values
const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const todayFormatted: string = formatDateToYYYYMMDD(today);
const tomorrowFormatted: string = formatDateToYYYYMMDD(tomorrow);

const initialFilter: Filter = {
    propertyId: 0,
    dateRange: {
        from: todayFormatted,
        to: tomorrowFormatted
    },
    roomCount: 1,
    isAccessible: false,
    guests: {},
    bedTypes: {
        singleBed: false,
        doubleBed: false,
    },
    bedCount: 1,
    ratings: [],
    amenities: [],
    roomSize: [-1, -1],
    sortBy: SortOption.RATING_HIGH_TO_LOW,
};

const initialState: RoomFiltersState = {
    status: StateStatus.IDLE,
    error: null,
    filter: initialFilter
};

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        updateFilter(state, action: PayloadAction<Partial<Filter>>) {
            // Merge the new values with existing state, preserving valid values
            const updatedFilter = {...state.filter};

            // Handle each field with proper type checking
            if (action.payload.propertyId && action.payload.propertyId > 0) {
                updatedFilter.propertyId = action.payload.propertyId;
            }

            if (action.payload.roomCount && action.payload.roomCount > 0) {
                updatedFilter.roomCount = action.payload.roomCount;
            }

            if (action.payload.isAccessible) {
                updatedFilter.isAccessible = action.payload.isAccessible;
            }

            if (action.payload.guests !== undefined &&
                typeof action.payload.guests === 'object' &&
                action.payload.guests !== null) {
                const guests = action.payload.guests;
                if (Object.keys(guests).length > 0) {
                    updatedFilter.guests = guests;
                }
            }

            if (action.payload.bedTypes !== undefined &&
                typeof action.payload.bedTypes === 'object' &&
                action.payload.bedTypes !== null) {
                const bedTypes = action.payload.bedTypes as { singleBed?: boolean; doubleBed?: boolean };
                updatedFilter.bedTypes = {
                    ...state.filter.bedTypes,
                    ...bedTypes
                };
            }

            if (action.payload.ratings !== undefined &&
                Array.isArray(action.payload.ratings)) {
                const ratings = action.payload.ratings
                    .filter((rating): rating is number => rating >= 0 && rating <= 5);
                if (ratings.length > 0) {
                    updatedFilter.ratings = ratings;
                }
            }

            if (action.payload.amenities !== undefined &&
                Array.isArray(action.payload.amenities)) {
                const amenities = action.payload.amenities
                    .filter((amenity): amenity is string => amenity.length > 0
                    );
                if (amenities.length > 0) {
                    updatedFilter.amenities = amenities;
                }
            }

            if (action.payload.roomSize !== undefined &&
                Array.isArray(action.payload.roomSize) &&
                action.payload.roomSize.length === 2) {
                updatedFilter.roomSize = [
                    typeof action.payload.roomSize[0] === 'number' ? action.payload.roomSize[0] : -1,
                    typeof action.payload.roomSize[1] === 'number' ? action.payload.roomSize[1] : -1
                ];
            }

            if (action.payload.sortBy !== undefined &&
                Object.values(SortOption).includes(action.payload.sortBy)) {
                updatedFilter.sortBy = action.payload.sortBy;
            }

            if (action.payload.dateRange !== undefined &&
                typeof action.payload.dateRange === 'object' &&
                action.payload.dateRange !== null) {
                const dateRange = action.payload.dateRange as { from?: string; to?: string };
                updatedFilter.dateRange = {
                    ...state.filter.dateRange,
                    ...dateRange
                };
            }

            state.filter = updatedFilter;
        },

        syncWithUrl(state, action: PayloadAction<Partial<Filter>>) {
            state.filter = {
                ...state.filter,
                ...action.payload
            };
        },

        resetFilters(state, action: PayloadAction<[number, number]>) {
            const propertyId = state.filter.propertyId;
            state.filter = {...initialFilter, propertyId, roomSize: action.payload};
        }
    }
});

export const {
    updateFilter,
    resetFilters,
    syncWithUrl
} = filterSlice.actions;

export default filterSlice.reducer; 