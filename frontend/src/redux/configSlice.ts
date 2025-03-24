import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {ConfigState} from "../types";
import {api} from "../lib/api-client";

const initialState: ConfigState = {
    globalConfig: null,
    landingConfig: null,
    status: "idle",
};

// Fetch GLOBAL config
export const fetchGlobalConfig = createAsyncThunk(
    "config/fetchGlobalConfig", 
    async (tenantId?: string) => {
        return api.getGlobalConfig(tenantId);
    }
);

// Fetch LANDING config
export const fetchLandingConfig = createAsyncThunk(
    "config/fetchLandingConfig",
    async (tenantId?: string) => {
        return api.getLandingConfig(tenantId);
    }
);

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
                state.globalConfig = action.payload.data;
            })
            .addCase(fetchGlobalConfig.rejected, (state) => {
                state.status = "failed";
            })
            .addCase(fetchLandingConfig.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchLandingConfig.fulfilled, (state, action) => {
                state.status = "idle";
                state.landingConfig = action.payload.data;
            })
            .addCase(fetchLandingConfig.rejected, (state) => {
                state.status = "failed";
            });
    },
});

export default configSlice.reducer;
