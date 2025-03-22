import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


interface GlobalConfigResponse {
    statusCode: string;
    message: string;
    timestamp: string;
    data: {
        tenantId: string;
        configType: string;
        updatedAt: number;
        configData: {
            brand: {
                logoUrl: string;
                companyName: string;
            };
            languages: { code: string; name: string }[];
            currencies: { code: string; symbol: string }[];
            properties: string[];
        };
    };
}

interface LandingConfigResponse {
    statusCode: string;
    message: string;
    timestamp: string;
    data: {
        tenantId: string;
        configType: string;
        updatedAt: number;
        configData: {
            pageTitle: string;
            banner: {
                enabled: boolean;
                imageUrl: string;
            };
            searchForm: {
                lengthOfStay: {
                    min: number;
                    max: number;
                };
                guestOptions: {
                    enabled: boolean;
                    min: number;
                    max: number;
                    categories: {
                        name: string;
                        enabled: boolean;
                        min: number;
                        max: number;
                        label: string;
                        default: number;
                    }[];
                };
                roomOptions: {
                    enabled: boolean;
                    min: number;
                    max: number;
                    default: number;
                };
                accessibility: {
                    enabled: boolean;
                    label: string;
                };
            };
        };
    };
}


export interface ConfigState {
  globalConfig: GlobalConfigResponse|null;
  landingConfig: LandingConfigResponse|null;
  status: "idle" | "loading" | "failed";
}

const initialState: ConfigState = {
  globalConfig: null,
  landingConfig: null,
  status: "idle",
};

// Base API URL
const API_BASE_URL = "http://localhost:8080/api/v1/config/1";

// Fetch GLOBAL config
export const fetchGlobalConfig = createAsyncThunk("config/fetchGlobalConfig", async () => {
console.log("fetchGlobalConfig is called");
  const response = await axios.get(`${API_BASE_URL}/GLOBAL`);
    
  return response.data;
});

// Fetch LANDING config
export const fetchLandingConfig = createAsyncThunk("config/fetchLandingConfig", async () => {
    
  const response = await axios.get(`${API_BASE_URL}/LANDING`);
  
return response.data;
    
});

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalConfig.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGlobalConfig.fulfilled, (state, action) => {
        state.status = "idle";
        state.globalConfig = action.payload;
      })
      .addCase(fetchGlobalConfig.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchLandingConfig.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLandingConfig.fulfilled, (state, action) => {
        state.status = "idle";
        state.landingConfig = action.payload;
      })
      .addCase(fetchLandingConfig.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default configSlice.reducer;
