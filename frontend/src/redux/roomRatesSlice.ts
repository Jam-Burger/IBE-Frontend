import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {format} from 'date-fns';
import {RoomRate} from '../types';
import {api} from '../lib/api-client';
import {BaseState, StateStatus} from "../types/common";

// Define a type for the parameters
interface FetchRoomRatesParams {
    currentMonth: Date;
    propertyId: number;
    endMonth: Date;
}

export interface RoomRatesState extends BaseState {
    data: RoomRate[];
}

const initialState: RoomRatesState = {
    data: [],
    status: StateStatus.IDLE,
    error: null
};

export const fetchRoomRates = createAsyncThunk(
    'roomRates/fetchRoomRates',
    async ({currentMonth, propertyId, endMonth}: FetchRoomRatesParams) => {
        const startDate = format(currentMonth, "yyyy-MM-dd");
        const endDate = format(endMonth, "yyyy-MM-dd");
        const response = await api.getRoomRates({
            propertyId,
            startDate,
            endDate
        });
        return response.data;
    }
);

// Create a slice for room rates
const roomRatesSlice = createSlice({
    name: 'roomRates',
    initialState,
    reducers: {
        // Add a reducer to clear room rates when property changes
        clearRoomRates(state) {
            state.data = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoomRates.pending, (state) => {
                state.status = StateStatus.LOADING;
                state.error = null;
            })
            .addCase(fetchRoomRates.fulfilled, (state, action) => {
                state.status = StateStatus.IDLE;
                state.data = action.payload;
            })
            .addCase(fetchRoomRates.rejected, (state, action) => {
                state.status = StateStatus.ERROR;
                state.error = action.error.message ?? null;
            });
    },
});

export const {clearRoomRates} = roomRatesSlice.actions;
export default roomRatesSlice.reducer;