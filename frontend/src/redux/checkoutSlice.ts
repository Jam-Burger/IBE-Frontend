import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {api} from '../lib/api-client';
import {
    BaseState,
    Booking,
    BookingDetails,
    ErrorResponse,
    PromoOffer,
    PropertyDetails,
    Room,
    SpecialDiscount,
    StandardPackage,
    StateStatus
} from '../types';
import {AxiosError} from 'axios';

interface CheckoutState {
    propertyStatus: BaseState;
    bookingStatus: BaseState;
    formData: Record<string, string | boolean>;
    room: Room | null;
    promotionApplied: SpecialDiscount | PromoOffer | StandardPackage | null;
    propertyDetails: PropertyDetails | null;
}

const initialState: CheckoutState = {
    propertyStatus: {
        status: StateStatus.IDLE,
        error: null
    },
    bookingStatus: {
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
    otp: string;
}

export const submitBooking = createAsyncThunk<BookingDetails, BookingSubmitParams, { rejectValue: ErrorResponse }>(
    'checkout/submitBooking',
    async (params: BookingSubmitParams, {rejectWithValue}) => {
        try {
            const response = await api.submitBooking(params.tenantId, params.bookingData, params.otp);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data)
            }
        }
    },
);

export const fetchPropertyDetails = createAsyncThunk<PropertyDetails, { tenantId: string, propertyId: number }, {
    rejectValue: ErrorResponse | undefined
}>(
    'checkout/fetchPropertyDetails',
    async ({tenantId, propertyId}, {rejectWithValue}) => {
        try {
            const response = await api.getPropertyDetails(tenantId, propertyId);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data);
            }
            return rejectWithValue(undefined)
        }
    }
);

export const checkoutSlice = createSlice({
    name: 'checkout',
    initialState,
    reducers: {
        updateFormData: (state, action: PayloadAction<{ name: string, value: string | boolean }>) => {
            if (!action.payload) return;
            const {name, value} = action.payload;
            const newFormData = state.formData;
            newFormData[name] = value;
            state.formData = newFormData;
        },
        setPromotionApplied: (state, action: PayloadAction<SpecialDiscount | PromoOffer | StandardPackage | null>) => {
            state.promotionApplied = action.payload;
        },
        setRoom: (state, action: PayloadAction<Room | null>) => {
            state.room = action.payload;
        },
        clearFormData: (state) => {
            state.formData = initialState.formData;
            state.bookingStatus = initialState.bookingStatus;
            state.propertyStatus = initialState.propertyStatus;
        },
        clearBookingStatus: (state) => {
            state.bookingStatus = initialState.bookingStatus;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitBooking.pending, (state) => {
                state.bookingStatus = {
                    status: StateStatus.LOADING,
                    error: null
                };
            })
            .addCase(submitBooking.fulfilled, (state) => {
                state.bookingStatus = {
                    status: StateStatus.IDLE,
                    error: null
                };
            })
            .addCase(submitBooking.rejected, (state, action) => {
                state.bookingStatus = {
                    status: StateStatus.ERROR,
                    error: action.payload?.message || 'Failed to submit booking'
                };
            })
            .addCase(fetchPropertyDetails.pending, (state) => {
                state.propertyStatus = {
                    status: StateStatus.LOADING,
                    error: null
                };
            })
            .addCase(fetchPropertyDetails.fulfilled, (state, action) => {
                state.propertyStatus = {
                    status: StateStatus.IDLE,
                    error: null
                };
                state.propertyDetails = action.payload;
            })
            .addCase(fetchPropertyDetails.rejected, (state, action) => {
                state.propertyStatus = {
                    status: StateStatus.ERROR,
                    error: action.payload?.message || 'Failed to fetch property details'
                };
                state.propertyDetails = null;
            })
    },
});

export const {updateFormData, setPromotionApplied, setRoom, clearFormData, clearBookingStatus} = checkoutSlice.actions;

export default checkoutSlice.reducer; 