import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {api} from "../lib/api-client";
import {RootState} from "./store";

// Fetch rates with USD as base from Frankfurter API
export const fetchExchangeRates = createAsyncThunk(
    "currency/fetchExchangeRates",
    async (_, {rejectWithValue}) => {
        try {
            // Always use USD as the base currency for consistency
            const data = await api.getCurrencyRates("USD");
            // Frankfurter API returns rates in data.rates
            return data.rates;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

// This thunk will be called when currency is changed
export const updateCurrency = createAsyncThunk(
    "currency/updateCurrency",
    async (currencyCode: string, {dispatch, getState}) => {
        // Set the selected currency
        dispatch(setSelectedCurrency(currencyCode));

        // Make sure we have the latest rates
        const state = getState() as RootState;
        if (Object.keys(state.currency.rates).length === 0) {
            await dispatch(fetchExchangeRates());
        }

        return currencyCode;
    }
);

interface CurrencyState {
    rates: Record<string, number>;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    selectedCurrency: string;
    multiplier: number;  // Multiplier for selected currency relative to USD
}

const initialState: CurrencyState = {
    rates: {},
    status: "idle",
    error: null,
    selectedCurrency: "USD",
    multiplier: 1,  // Default to 1 (meaning 1:1 with USD)
};

const currencySlice = createSlice({
    name: "currency",
    initialState,
    reducers: {
        setSelectedCurrency(state, action: PayloadAction<string>) {
            state.selectedCurrency = action.payload;

            // Update multiplier when currency changes
            if (action.payload === "USD") {
                state.multiplier = 1;
            } else if (state.rates[action.payload]) {
                state.multiplier = state.rates[action.payload];
            }
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

                // Update multiplier for currently selected currency
                if (state.selectedCurrency === "USD") {
                    state.multiplier = 1;
                } else if (action.payload[state.selectedCurrency]) {
                    state.multiplier = action.payload[state.selectedCurrency];
                }
            })
            .addCase(fetchExchangeRates.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export const {setSelectedCurrency} = currencySlice.actions;
export default currencySlice.reducer;
