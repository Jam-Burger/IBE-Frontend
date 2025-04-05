import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../lib/api-client';
import { StateStatus } from '../types';
import { ConfigType } from '../types/ConfigType';

export interface CheckoutField {
  label: string;
  type: string;
  name: string;
  required: boolean;
  enabled: boolean;
  pattern: string | null | undefined;
  options: string[] | null | undefined;
}

export interface CheckoutSection {
  title: string;
  id: string;
  enabled: boolean;
  fields: CheckoutField[];
}

export interface CheckoutConfig {
  sections: CheckoutSection[];
}

interface CheckoutState {
  config: CheckoutConfig | null;
  status: StateStatus;
  error: string | null;
  formData: Record<string, string>;
}

const initialState: CheckoutState = {
  config: null,
  status: StateStatus.IDLE,
  error: null,
  formData: {}
};

// Define the response type
interface CheckoutConfigResponse {
  configData: CheckoutConfig;
}

export const fetchCheckoutConfig = createAsyncThunk(
  'checkout/fetchConfig',
  async (tenantId: string) => {
    const response = await api.getConfig(tenantId, ConfigType.CHECKOUT);
    return response.data;
  }
);

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    updateFormData: (state, action: PayloadAction<Record<string, string>>) => {
      console.log('Updating form data with:', action.payload);
      state.formData = {
        ...state.formData,
        ...action.payload
      };
    },
    clearFormData: (state) => {
      state.formData = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckoutConfig.pending, (state) => {
        state.status = StateStatus.LOADING;
      })
      .addCase(fetchCheckoutConfig.fulfilled, (state, action: PayloadAction<CheckoutConfigResponse>) => {
        state.status = StateStatus.IDLE;
        state.config = action.payload.configData;
        state.error = null;
      })
      .addCase(fetchCheckoutConfig.rejected, (state, action) => {
        state.status = StateStatus.ERROR;
        state.error = action.error.message || 'Failed to fetch checkout configuration';
      });
  },
});

export const { updateFormData, clearFormData } = checkoutSlice.actions;

export default checkoutSlice.reducer; 