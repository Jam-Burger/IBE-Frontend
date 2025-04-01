import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {BaseState, RoomRate, StateStatus} from '../types';
import {api} from '../lib/api-client';

interface FetchRoomRatesParams {
    tenantId: string;
    propertyId: number;
    startDate: Date;
    endDate: Date;
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
    async ({tenantId, startDate, propertyId, endDate}: FetchRoomRatesParams) => {
        const response = await api.getRoomRates({
            tenantId,
            propertyId,
            startDate,
            endDate
        });
        return response.data;
    }
);

const roomRatesSlice = createSlice({
    name: 'roomRates',
    initialState,
    reducers: {
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