// redux/currencySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


export const fetchExchangeRates = createAsyncThunk(
  "currency/fetchExchangeRates",
  async () => {
    const API_URL=import.meta.env.VITE_CURRENCY_API_URL;
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

export const { setSelectedCurrency } = currencySlice.actions;
export default currencySlice.reducer;
