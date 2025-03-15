// redux/currencySlice.ts
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

const API_URL = "https://api.frankfurter.app/latest?from=USD&to=EUR";

export const fetchExchangeRates = createAsyncThunk(
    "currency/fetchExchangeRates",
    async () => {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.rates;
    }
);

interface CurrencyState {
    rates: Record<string, number>;
    status: "idle" | "loading" | "succeeded" | "failed";
    selectedCurrency: string;
}

const initialState: CurrencyState = {
    rates: {},
    status: "idle",
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
            })
            .addCase(fetchExchangeRates.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.rates = action.payload;
            })
            .addCase(fetchExchangeRates.rejected, (state) => {
                state.status = "failed";
            });
    },
});

export const {setSelectedCurrency} = currencySlice.actions;
export default currencySlice.reducer;
