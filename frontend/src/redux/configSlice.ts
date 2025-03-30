import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../lib/api-client";
import {BaseState, StateStatus} from "../types/common";
import {GlobalConfig} from "../types/GlobalConfig";
import {LandingConfig} from "../types/LandingConfig";
import {RoomsListConfig} from "../types/RoomsListConfig";
import {ConfigType} from "../types";

export interface ConfigState extends BaseState {
    globalConfig: GlobalConfig | null;
    landingConfig: LandingConfig | null;
    roomsListConfig: RoomsListConfig | null;
}

const initialState: ConfigState = {
    globalConfig: null,
    landingConfig: null,
    roomsListConfig: null,
    status: StateStatus.IDLE,
    error: null
};

export const fetchConfig = createAsyncThunk(
    "config/fetchConfig",
    async ({tenantId, configType}: { tenantId: string, configType: ConfigType }) => {
        const response = await api.getConfig(tenantId, configType);
        return response.data;
    }
);

const configSlice = createSlice({
    name: "config",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchConfig.pending, (state) => {
                state.status = StateStatus.LOADING;
                state.error = null;
            })
            .addCase(fetchConfig.fulfilled, (state, action) => {
                state.status = StateStatus.IDLE;
                const {configType} = action.payload;

                switch (configType) {
                    case ConfigType.GLOBAL:
                        state.globalConfig = action.payload;
                        break;
                    case ConfigType.LANDING:
                        state.landingConfig = action.payload;
                        break;
                    case ConfigType.ROOMS_LIST:
                        state.roomsListConfig = action.payload;
                        break;
                }
            })
            .addCase(fetchConfig.rejected, (state, action) => {
                state.status = StateStatus.ERROR;
                state.error = action.error.message ?? null;
            })
    }
});

export default configSlice.reducer;
