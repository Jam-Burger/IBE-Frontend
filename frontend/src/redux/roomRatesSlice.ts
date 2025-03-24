import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { format, subMonths, addMonths } from 'date-fns';
import { RoomRate } from '../types' // Make sure to define or import your RoomRate type
const TENANT_ID = import.meta.env.VITE_TENANT_ID; 

export const fetchRoomRates = createAsyncThunk(
  'roomRates/fetchRoomRates',
  async (currentMonth: Date, { rejectWithValue }) => {
    try {
      const startDate = format(subMonths(currentMonth, 1), "yyyy-MM-dd");
      const endDate = format(addMonths(currentMonth, 3), "yyyy-MM-dd");

      const response = await fetch(
        `http://localhost:8080/api/v1/${TENANT_ID}/1/room-rates/daily-minimum?startDate=${startDate}&endDate=${endDate}`
      );
      
      const result: { statusCode: string; data: RoomRate[] } = await response.json();

      if (result.statusCode === "OK" && Array.isArray(result.data)) {
        return result.data.filter((rate: RoomRate) =>
          typeof rate.date === "string" &&
          typeof rate.minimumRate === "number"
        );
      }
      
      return rejectWithValue('Failed to fetch room rates');
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
  reducers: {},
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
        const newRates = action.payload.filter(rate => !existingDates.has(rate.date));
        state.data = [...state.data, ...newRates];
      })
      .addCase(fetchRoomRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
        console.error("Error fetching room rates:", action.payload);
      });
  },
});

export default roomRatesSlice.reducer;