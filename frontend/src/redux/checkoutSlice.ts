import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {api} from '../lib/api-client';
import {
    BaseState,
    CheckoutConfig,
    ConfigType,
    PromoOffer,
    Room,
    SpecialDiscount,
    StandardPackage,
    StateStatus
} from '../types';
import {Booking} from '../types/Booking';
import {PropertyDetails} from '../types/PropertyDetails';

interface CheckoutState {
    config: CheckoutConfig | null;
    status: BaseState;
    formData: Record<string, string>;
    room: Room | null;
    promotionApplied: SpecialDiscount | PromoOffer | StandardPackage | null;
    propertyDetails: PropertyDetails | null;
}

const initialState: CheckoutState = {
    config: null,
    status: {
        status: StateStatus.IDLE,
        error: null
    },
    formData: {},
    room: null,
    promotionApplied: null,
    propertyDetails: null,
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

export const fetchPropertyDetails = createAsyncThunk(
    'checkout/fetchPropertyDetails',
    async ({tenantId, propertyId}: { tenantId: string, propertyId: number }) => {
        const response = await api.getPropertyDetails(tenantId, propertyId);
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
        setPromotionApplied: (state, action: PayloadAction<SpecialDiscount | PromoOffer | StandardPackage>) => {
            state.promotionApplied = action.payload;
        },
        setRoom: (state, action: PayloadAction<Room | null>) => {
            state.room = action.payload;
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
            })
            .addCase(fetchPropertyDetails.pending, (state) => {
                state.status = {
                    status: StateStatus.LOADING,
                    error: null
                };
            })
            .addCase(fetchPropertyDetails.fulfilled, (state, action: PayloadAction<PropertyDetails>) => {
                state.status = {
                    status: StateStatus.IDLE,
                    error: null
                };
                state.propertyDetails = action.payload;
            })
            .addCase(fetchPropertyDetails.rejected, (state, action) => {
                state.status = {
                    status: StateStatus.ERROR,
                    error: action.error.message ?? 'Failed to fetch property details'
                };
            })
    },
});

export const {updateFormData, clearFormData, setPromotionApplied, setRoom} = checkoutSlice.actions;

export default checkoutSlice.reducer; 