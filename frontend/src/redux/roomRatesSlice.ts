import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {addMonths, format, subMonths} from 'date-fns';
import {RoomRate} from '../types';
import {api} from '../lib/api-client';

// Define a type for the parameters
interface FetchRoomRatesParams {
    currentMonth: Date;
    propertyId?: number;
    tenantId?: string;
}

export const fetchRoomRates = createAsyncThunk(
    'roomRates/fetchRoomRates',
    async ({currentMonth, propertyId, tenantId}: FetchRoomRatesParams, {rejectWithValue}) => {
        try {
            // Return early if no propertyId is provided
            if (!propertyId) {
                return [];
            }

            const startDate = format(subMonths(currentMonth, 1), "yyyy-MM-dd");
            const endDate = format(addMonths(currentMonth, 3), "yyyy-MM-dd");

            const result = await api.getRoomRates({
                propertyId,
                startDate,
                endDate,
                tenantId
            });

            return result.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// Create a slice for room rates
const roomRatesSlice = createSlice({
    name: 'roomRates',
    initialState: {
        data: [] as RoomRate[],
        loading: false,
        error: null as string | null,
    },
    reducers: {
        // Add a reducer to clear room rates when property changes
        clearRoomRates(state) {
            state.data = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoomRates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoomRates.fulfilled, (state, action) => {
                state.loading = false;
                // Filter out duplicates
                const existingDates = new Set(state.data.map(rate => rate.date));
                const newRates = action.payload.filter((rate: RoomRate) => !existingDates.has(rate.date));
                state.data = [...state.data, ...newRates];
            })
            .addCase(fetchRoomRates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'An error occurred';
                console.error("Error fetching room rates:", action.payload);
            });
    },
});

export const {clearRoomRates} = roomRatesSlice.actions;
export default roomRatesSlice.reducer;