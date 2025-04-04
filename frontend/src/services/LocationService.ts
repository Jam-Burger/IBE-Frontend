import { api } from '../lib/api-client';

// Define types for location data
export interface Country {
  id: string;
  name: string;
  iso2: string;
}

export interface State {
  id: string;
  name: string;
  iso2: string;
}

export interface City {
  id: string;
  name: string;
}

/**
 * Service for handling location-related API calls
 */
export const LocationService = {
  /**
   * Fetch all countries
   */
  getCountries: async (): Promise<Country[]> => {
    try {
      const response = await api.getCountries();
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  },
  
  /**
   * Fetch states for a specific country
   * @param countryCode ISO2 country code
   */
  getStates: async (countryCode: string): Promise<State[]> => {
    try {
      const response = await api.getStates(countryCode);
      return response.data;
    } catch (error) {
      console.error(`Error fetching states for country ${countryCode}:`, error);
      return [];
    }
  },
  
  /**
   * Fetch cities for a specific state in a country
   * @param countryCode ISO2 country code
   * @param stateCode ISO2 state code
   */
  getCities: async (countryCode: string, stateCode: string): Promise<City[]> => {
    try {
      const response = await api.getCities(countryCode, stateCode);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cities for country ${countryCode} and state ${stateCode}:`, error);
      return [];
    }
  }
}; 