import axios from 'axios';
import {ConfigType} from '../types';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const CURRENCY_API_URL = import.meta.env.VITE_CURRENCY_API_URL;
const LOCATION_API_URL = import.meta.env.VITE_LOCATION_API_URL;

interface RoomRateParams {
    propertyId: number;
    startDate: string;
    endDate: string;
}

interface SpecialDiscountParams {
    propertyId: number;
    startDate: string;
    endDate: string;
}

export const api = {
    getConfig: async (tenantId: string, configType: ConfigType) => {
        const response = await apiClient.get(`${tenantId}/config/${configType}`);
        return response.data;
    },

    getProperties: async (tenantId: string) => {
        const response = await apiClient.get(`${tenantId}/properties`);
        return response.data;
    },

    getRoomRates: async (params: RoomRateParams & { tenantId: string }) => {
        const {propertyId, startDate, endDate, tenantId} = params;
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/room-rates/daily-minimum`,
            {params: {start_date: startDate, end_date: endDate}}
        );
        return response.data;
    },

    getSpecialDiscounts: async (params: SpecialDiscountParams & { tenantId: string }) => {
        const {propertyId, startDate, endDate, tenantId} = params;
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/special-discounts`,
            {params: {start_date: startDate, end_date: endDate}}
        );
        return response.data;
    },

    getRooms: async (tenantId: string, params: [string, string][]) => {
        const propertyId = 9;
        console.log(params);
        const response = await apiClient.get(`${tenantId}/${propertyId}/room-types`);
        return response.data;
    },

    getAmenities: async (tenantId: string, propertyId: number) => {
        const response = await apiClient.get(`${tenantId}/${propertyId}/amenities`);
        return response.data;
    },

    getCurrencyRates: async () => {
        const response = await axios.get(`${CURRENCY_API_URL}?from=USD`);
        return response.data;
    },

    getLocationInfo: async () => {
        const response = await axios.get(`${LOCATION_API_URL}`);
        return response.data;
    }
};