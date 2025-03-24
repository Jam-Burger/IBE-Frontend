import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const fetchExchangeRates = createAsyncThunk(
    "currency/fetchExchangeRates",
    async (_, { rejectWithValue }) => {
        try {
            const API_URL = import.meta.env.VITE_CURRENCY_API_URL;
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: RatesResponse = await response.json();
            return data.rates;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

interface RatesResponse {
    rates: Record<string, number>;
}

interface CurrencyState {
    rates: Record<string, number>;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    selectedCurrency: string;
}

const initialState: CurrencyState = {
    rates: {},
    status: "idle",
    error: null,
    selectedCurrency: "USD",
};

const currencySlice = createSlice({
    name: "currency",
    initialState,
    reducers: {
        setSelectedCurrency(state, action: PayloadAction<string>) {
            state.selectedCurrency = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExchangeRates.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchExchangeRates.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.rates = action.payload;
            })
            .addCase(fetchExchangeRates.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export const { setSelectedCurrency } = currencySlice.actions;
export default currencySlice.reducer;
