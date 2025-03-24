import axios from 'axios';

// Create API client instance with base configuration
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    // Config APIs
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
        const { propertyId, startDate, endDate, tenantId = DEFAULT_TENANT_ID } = params;
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/room-rates/daily-minimum`,
            {params: {startDate, endDate}}
        );
        return response.data;
    },

    // Special Discounts API
    getSpecialDiscounts: async (params: SpecialDiscountParams & { tenantId?: string }) => {
        const { propertyId, startDate, endDate, tenantId = DEFAULT_TENANT_ID } = params;
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/special-discounts`,
            {params: {startDate, endDate}}
        );
        return response.data;
    },

    // Currency API (external service)
    getCurrencyRates: async (base: string) => {
        const response = await axios.get(`https://api.frankfurter.app/latest?from=${base}`);
        return response.data;
    }
};

export default apiClient; 