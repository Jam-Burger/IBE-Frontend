import axios from 'axios';

// Create API client instance with base configuration
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

const DEFAULT_TENANT_ID = import.meta.env.VITE_TENANT_ID || '1';
// Export functions for different API operations
export const api = {
    getGlobalConfig: async (tenantId: string = DEFAULT_TENANT_ID) => {
        const response = await apiClient.get(`${tenantId}/config/GLOBAL`);
        return response.data;
    },

    getLandingConfig: async (tenantId: string = DEFAULT_TENANT_ID) => {
        const response = await apiClient.get(`${tenantId}/config/LANDING`);
        return response.data;
    },

    // Property APIs
    getProperties: async (tenantId: string = DEFAULT_TENANT_ID) => {
        const response = await apiClient.get(`${tenantId}/properties`);
        return response.data;
    },

    // Room Rates API
    getRoomRates: async (params: RoomRateParams & { tenantId?: string }) => {
        const {propertyId, startDate, endDate, tenantId = DEFAULT_TENANT_ID} = params;
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/room-rates/daily-minimum`,
            {params: {startDate, endDate}}
        );
        return response.data;
    },

    // Special Discounts API
    getSpecialDiscounts: async (params: SpecialDiscountParams & { tenantId?: string }) => {
        const {propertyId, startDate, endDate, tenantId = DEFAULT_TENANT_ID} = params;
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/special-discounts`,
            {params: {startDate, endDate}}
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
    }
};

export default apiClient; 