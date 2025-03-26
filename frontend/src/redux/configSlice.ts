import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../lib/api-client";
import {BaseState, StateStatus} from "../types/common";
import {GlobalConfig} from "../types/GlobalConfig";
import {LandingConfig} from "../types/LandingConfig";

export interface ConfigState extends BaseState {
    globalConfig: GlobalConfig | null;
    landingConfig: LandingConfig | null;
}

const initialState: ConfigState = {
    globalConfig: null,
    landingConfig: null,
    status: StateStatus.IDLE,
    error: null
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
                state.status = StateStatus.LOADING;
                state.error = null;
            })
            .addCase(fetchGlobalConfig.fulfilled, (state, action) => {
                state.status = StateStatus.IDLE;
                state.globalConfig = action.payload.data;
            })
            .addCase(fetchGlobalConfig.rejected, (state, action) => {
                state.status = StateStatus.ERROR;
                state.error = action.error.message ?? null;
            })
            .addCase(fetchLandingConfig.pending, (state) => {
                state.status = StateStatus.LOADING;
                state.error = null;
            })
            .addCase(fetchLandingConfig.fulfilled, (state, action) => {
                state.status = StateStatus.IDLE;
                state.landingConfig = action.payload.data;
            })
            .addCase(fetchLandingConfig.rejected, (state, action) => {
                state.status = StateStatus.ERROR;
                state.error = action.error.message ?? null;
            });
    },
});

export default configSlice.reducer;
