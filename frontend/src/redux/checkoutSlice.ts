import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {api} from '../lib/api-client';
import {BaseState, CheckoutConfig, ConfigType, PromoOffer, SpecialDiscount, StateStatus} from '../types';
import {Booking} from '../types/Booking';

interface CheckoutState {
    config: CheckoutConfig | null;
    status: BaseState;
    formData: Record<string, string>;
    roomTypeId: number;
    promotionApplied: SpecialDiscount | PromoOffer | null;
}

const initialState: CheckoutState = {
    config: null,
    status: {
        status: StateStatus.IDLE,
        error: null
    },
    formData: {},
    roomTypeId: -1,
    promotionApplied: null
};

// Define the response type
interface CheckoutConfigResponse {
    configData: CheckoutConfig;
}

interface BookingSubmitParams {
    tenantId: string;
    bookingData: Booking;
}

export const fetchCheckoutConfig = createAsyncThunk(
    'checkout/fetchConfig',
    async (tenantId: string) => {
        const response = await api.getConfig(tenantId, ConfigType.CHECKOUT);
        return response.data;
    }
);

// Utility function to convert form data to key-value record
export const convertFormDataToKeyValue = (formData: Record<string, string>, config: CheckoutConfig): Record<string, string> => {
    const keyValueRecord: Record<string, string> = {};

    config.sections.forEach(section => {
        section.fields.forEach(field => {
            const fieldKey = field.label.toLowerCase().replace(/\s+/g, '_');
            if (formData[fieldKey]) {
                keyValueRecord[field.label] = formData[fieldKey];
            }
        });
    });

    return keyValueRecord;
};

export const submitBooking = createAsyncThunk(
    'checkout/submitBooking',
    async (params: BookingSubmitParams) => {
        const response = await api.submitBooking(params.tenantId, params.bookingData);
        return response.data;
    }
);

export const checkoutSlice = createSlice({
    name: 'checkout',
    initialState,
    reducers: {
        updateFormData: (state, action: PayloadAction<Record<string, string>>) => {
            state.formData = {
                ...state.formData,
                ...action.payload
            };
        },
        clearFormData: (state) => {
            state.formData = {};
        },
        setPromotionApplied: (state, action: PayloadAction<SpecialDiscount | PromoOffer | null>) => {
            state.promotionApplied = action.payload;
        },
        setRoomTypeId: (state, action: PayloadAction<number>) => {
            state.roomTypeId = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCheckoutConfig.pending, (state) => {
                state.status = {
                    status: StateStatus.LOADING,
                    error: null
                };
            })
            .addCase(fetchCheckoutConfig.fulfilled, (state, action: PayloadAction<CheckoutConfigResponse>) => {
                state.status = {
                    status: StateStatus.IDLE,
                    error: null
                };
                state.config = action.payload.configData;
            })
            .addCase(fetchCheckoutConfig.rejected, (state, action) => {
                state.status = {
                    status: StateStatus.ERROR,
                    error: action.error.message ?? 'Failed to fetch checkout configuration'
                };
            })
            .addCase(submitBooking.pending, (state) => {
                state.status = {
                    status: StateStatus.LOADING,
                    error: null
                };
            })
            .addCase(submitBooking.fulfilled, (state) => {
                state.status = {
                    status: StateStatus.IDLE,
                    error: null
                };
                state.formData = {}; // Clear form data after successful submission
            })
            .addCase(submitBooking.rejected, (state, action) => {
                state.status = {
                    status: StateStatus.ERROR,
                    error: action.error.message ?? 'Failed to submit booking'
                };
            });
    },
});

export const {updateFormData, clearFormData, setPromotionApplied, setRoomTypeId} = checkoutSlice.actions;

export default checkoutSlice.reducer; 