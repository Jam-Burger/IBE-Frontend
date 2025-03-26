import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {api} from "../lib/api-client";
import {BaseState, StateStatus} from "../types/common";

export interface Currency {
    code: string;
    symbol: string;
}

interface CurrencyState extends BaseState {
    selectedCurrency: Currency;
    rates: Record<string, number>;
    multiplier: number;
}

const initialState: CurrencyState = {
    selectedCurrency: {
        code: "USD",
        symbol: "$"
    },
    rates: {},
    multiplier: 1,
    status: StateStatus.IDLE,
    error: null
};

export const fetchExchangeRates = createAsyncThunk(
    "currency/fetchExchangeRates",
    async () => {
        const response = await api.getCurrencyRates();
        return response.rates;
    }
);

const currencySlice = createSlice({
    name: "currency",
    initialState,
    reducers: {
        setSelectedCurrency(state, action: PayloadAction<Currency>) {
            state.selectedCurrency = action.payload;
            state.error = null;

            if (action.payload.code === "USD") {
                state.multiplier = 1;
            } else if (state.rates[action.payload.code]) {
                state.multiplier = state.rates[action.payload.code];
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExchangeRates.pending, (state) => {
                state.status = StateStatus.LOADING;
                state.error = null;
            })
            .addCase(fetchExchangeRates.fulfilled, (state, action) => {
                state.status = StateStatus.IDLE;
                state.rates = action.payload;
                if (state.selectedCurrency && action.payload[state.selectedCurrency.code]) {
                    state.multiplier = action.payload[state.selectedCurrency.code];
                }
            })
            .addCase(fetchExchangeRates.rejected, (state, action) => {
                state.status = StateStatus.ERROR;
                state.error = action.error.message ?? null;
            });
    },
});

export const {setSelectedCurrency} = currencySlice.actions;
export default currencySlice.reducer;
