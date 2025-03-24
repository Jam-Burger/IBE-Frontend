import axios from 'axios';

// Default tenant ID from environment variable or use 1 as fallback
export const DEFAULT_TENANT_ID = import.meta.env.VITE_TENANT_ID || '1';

// Create API client instance with base configuration
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get current tenant ID from URL path
export const getCurrentTenantId = (): string => {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(Boolean);

    // If path starts with a tenant ID, use it
    if (pathParts.length > 0) {
        return pathParts[0];
    }

    // Otherwise return default
    return DEFAULT_TENANT_ID;
};

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

// Export functions for different API operations
export const api = {
    // Config APIs
    getGlobalConfig: async () => {
        const tenantId = getCurrentTenantId();
        const response = await apiClient.get(`${tenantId}/config/GLOBAL`);
        return response.data;
    },

    getLandingConfig: async () => {
        const tenantId = getCurrentTenantId();
        const response = await apiClient.get(`${tenantId}/config/LANDING`);
        return response.data;
    },

    // Property APIs
    getProperties: async () => {
        const tenantId = getCurrentTenantId();
        const response = await apiClient.get(`${tenantId}/properties`);
        return response.data;
    },

    // Room Rates API
    getRoomRates: async (params: RoomRateParams) => {
        const tenantId = getCurrentTenantId();
        const {propertyId, startDate, endDate} = params;
        const response = await apiClient.get(
            `${tenantId}/${propertyId}/room-rates/daily-minimum`,
            {params: {startDate, endDate}}
        );
        return response.data;
    },

    // Special Discounts API
    getSpecialDiscounts: async (params: SpecialDiscountParams) => {
        const tenantId = getCurrentTenantId();
        const {propertyId, startDate, endDate} = params;
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