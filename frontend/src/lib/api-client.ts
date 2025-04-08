import axios from "axios";
import {
    ApiResponse,
    ConfigType,
    PaginationParams,
    PaginationResponse,
    Room,
} from "../types";
import { Booking } from "../types/Booking";
import { formatDateToYYYYMMDD } from "./utils";
import { PropertyDetails } from "../types/PropertyDetails";
import { BookingDetails } from "../types/BookingDetails";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const CURRENCY_API_URL = import.meta.env.VITE_CURRENCY_API_URL;
const LOCATION_API_URL = import.meta.env.VITE_LOCATION_API_URL;
const COUNTRY_API_KEY = import.meta.env.VITE_COUNTRY_API_KEY;

interface RoomRateParams {
    propertyId: number;
    startDate: Date;
    endDate: Date;
}

interface SpecialDiscountParams {
    propertyId: number;
    startDate: string;
    endDate: string;
}

export const api = {
    getConfig: async (tenantId: string, configType: ConfigType) => {
        const response = await apiClient.get(
            `${tenantId}/config/${configType}`
        );
        return response.data;
    },

    getProperties: async (tenantId: string) => {
        const response = await apiClient.get(`${tenantId}/properties`);
        return response.data;
    },

    getRoomRates: async (params: RoomRateParams & { tenantId: string }) => {
        const { propertyId, startDate, endDate, tenantId } = params;
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/room-rates/daily-minimum`,
            {
                params: {
                    start_date: formatDateToYYYYMMDD(startDate),
                    end_date: formatDateToYYYYMMDD(endDate),
                },
            }
        );
        return response.data;
    },

    getSpecialDiscounts: async (
        params: SpecialDiscountParams & { tenantId: string }
    ) => {
        const { propertyId, startDate, endDate, tenantId } = params;
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/special-discounts`,
            { params: { start_date: startDate, end_date: endDate } }
        );
        return response.data;
    },

    getRooms: async (
        tenantId: string,
        params: Record<string, string>,
        paginationParams?: PaginationParams
    ): Promise<ApiResponse<PaginationResponse<Room>>> => {
        const propertyId = params.propertyId;
        params = {
            ...params,
            page: paginationParams?.page.toString() ?? "1",
            pageSize: paginationParams?.pageSize.toString() ?? "3",
        };
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/room-types/filter`,
            { params }
        );
        return response.data;
    },

    getAmenities: async (tenantId: string, propertyId: number) => {
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/amenities`
        );
        return response.data;
    },

    getCurrencyRates: async () => {
        const response = await axios.get(`${CURRENCY_API_URL}?from=USD`);
        return response.data;
    },

    getLocationInfo: async () => {
        const response = await axios.get(`${LOCATION_API_URL}`);
        return response.data;
    },

    getPromoOffer: async (params: {
        tenantId: string;
        propertyId: number;
        startDate: string;
        endDate: string;
        promoCode: string;
    }) => {
        const { tenantId, propertyId, startDate, endDate, promoCode } = params;
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/special-discounts/promo-offer`,
            {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    promo_code: promoCode,
                },
            }
        );
        return response.data;
    },

    getCountries: async () => {
        return apiClient.get("https://api.countrystatecity.in/v1/countries", {
            headers: {
                "X-CSCAPI-KEY": COUNTRY_API_KEY,
            },
        });
    },

    getStates: async (countryCode: string) => {
        return apiClient.get(
            `https://api.countrystatecity.in/v1/countries/${countryCode}/states`,
            {
                headers: {
                    "X-CSCAPI-KEY": COUNTRY_API_KEY,
                },
            }
        );
    },

    getCities: async (countryCode: string, stateCode: string) => {
        return apiClient.get(
            `https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`,
            {
                headers: {
                    "X-CSCAPI-KEY": COUNTRY_API_KEY,
                },
            }
        );
    },

    getPropertyDetails: async (
        tenantId: string,
        propertyId: number
    ): Promise<ApiResponse<PropertyDetails>> => {
        const response = await apiClient.get(
            `${tenantId}/properties/${propertyId}`
        );
        return response.data;
    },

    getRoomTypeDetails: async (
        tenantId: string,
        propertyId: number,
        room_type_id: number,
        dateFrom: string,
        dateTo: string
    ) => {
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/room-types/${room_type_id}`,
            {
                params: {
                    dateFrom,
                    dateTo,
                },
            }
        );
        return response.data;
    },

    submitBooking: async (tenantId: string, bookingData: Booking) => {
        const response = await apiClient.post(
            `${tenantId}/bookings`,
            bookingData
        );
        return response.data;
    },

    getBookingDetails: async (tenantId: string, bookingId: string) => {
        const response = await apiClient.get(
            `${tenantId}/bookings/${bookingId}`
        );
        return response.data;
    },

    cancelBooking: async (tenantId: string, bookingId: string) => {
        return await apiClient.put(`${tenantId}/bookings/${bookingId}/cancel`)
    },

    sendOtp: async (tenantId: string, email: string) => {
        return await apiClient.post(`${tenantId}/otp/send`, null, {
            params: { email },
        });
    },

    verifyOtp: async (tenantId: string, email: string, otp: string) => {
        return await apiClient.post(`${tenantId}/otp/verify`, null, {
            params: { email, otp },
        });
    },
};
