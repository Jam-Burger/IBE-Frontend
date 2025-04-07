import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CheckoutState, CheckoutConfig } from '../types/Checkout';
import axios from 'axios';

// Load persisted form values from localStorage
const loadPersistedFormValues = () => {
  try {
    const persistedValues = localStorage.getItem('checkoutFormValues');
    return persistedValues ? JSON.parse(persistedValues) : {};
  } catch (error) {
    console.error('Error loading persisted form values:', error);
    return {};
  }
};

const initialState: CheckoutState = {
  config: null,
  loading: false,
  error: null,
  formValues: loadPersistedFormValues(),
};

export const fetchCheckoutConfig = createAsyncThunk(
  'checkout/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching checkout config...');
      const response = await axios.get<{ 
        statusCode: string;
        message: string;
        data: {
          tenantId: string;
          configType: string;
          configData: CheckoutConfig;
          updatedAt: number;
        };
        timestamp: string;
      }>('http://localhost:8080/api/v1/1/config/CHECKOUT');
      console.log('API Response:', response.data);
      return response.data.data.configData;
    } catch (error) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Action to update form values
export const updateFormValue = createAsyncThunk(
  'checkout/updateFormValue',
  async ({ name, value }: { name: string; value: string | boolean }, { getState }) => {
    // Get current state
    const state = getState() as { checkout: CheckoutState };
    const currentValues = state.checkout.formValues;
    
    // Update the value
    const updatedValues = {
      ...currentValues,
      [name]: value
    };
    
    // Persist to localStorage
    localStorage.setItem('checkoutFormValues', JSON.stringify(updatedValues));
    
    return { name, value };
  }
);

// Action to clear form values
export const clearFormValues = createAsyncThunk(
  'checkout/clearFormValues',
  async () => {
    localStorage.removeItem('checkoutFormValues');
    return null;
  }
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckoutConfig.pending, (state) => {
        console.log('Checkout config fetch pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCheckoutConfig.fulfilled, (state, action) => {
        console.log('Checkout config fetch fulfilled:', action.payload);
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchCheckoutConfig.rejected, (state, action) => {
        console.log('Checkout config fetch rejected:', action.payload);
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch checkout config';
      })
      .addCase(updateFormValue.fulfilled, (state, action) => {
        const { name, value } = action.payload;
        state.formValues[name] = value;
      })
      .addCase(clearFormValues.fulfilled, (state) => {
        state.formValues = {};
      });
  },
});

export default checkoutSlice.reducer; 