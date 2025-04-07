import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {api} from '../lib/api-client';
import {BaseState, PromoOffer, Room, SpecialDiscount, StandardPackage, StateStatus} from '../types';
import {Booking} from '../types/Booking';
import {PropertyDetails} from '../types/PropertyDetails';

interface CheckoutState {
    status: BaseState;
    formData: Record<string, string | boolean>;
    room: Room | null;
    promotionApplied: SpecialDiscount | PromoOffer | StandardPackage | null;
    propertyDetails: PropertyDetails | null;
}

const initialState: CheckoutState = {
    status: {
        status: StateStatus.IDLE,
        error: null
    },
    formData: {},
    room: null,
    promotionApplied: null,
    propertyDetails: null,
};

interface BookingSubmitParams {
    tenantId: string;
    bookingData: Booking;
}

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
        updateFormData: (state, action: PayloadAction<{name: string, value: string | boolean}>) => {
            if (!action.payload) return;
            const {name, value} = action.payload;
            const newFormData= state.formData;
            newFormData[name] = value;
            state.formData = newFormData;
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
                state.formData = {};
            })
            .addCase(submitBooking.rejected, (state) => {
                state.status = {
                    status: StateStatus.ERROR,
                    error: 'Failed to submit booking'
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
            .addCase(fetchPropertyDetails.rejected, (state) => {
                state.status = {
                    status: StateStatus.ERROR,
                    error: 'Failed to fetch property details'
                };
                state.propertyDetails = null;
            })
    },
});

export const {updateFormData, setPromotionApplied, setRoom} = checkoutSlice.actions;

export default checkoutSlice.reducer; 