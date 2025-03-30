import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BaseState, Filter, SortOption, StateStatus} from '../types';

export interface RoomFiltersState extends BaseState {
    filter: Filter;
}

const initialFilter: Filter = {
    propertyId: 9,
    dateRange: undefined,
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
            state.filter = {
                ...state.filter,
                ...action.payload
            };
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