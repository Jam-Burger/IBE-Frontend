import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { ConfigState } from "../types";

const initialState: ConfigState = {
  globalConfig: null,
  landingConfig: null,
  status: "idle",
};


const API_BASE_URL = import.meta.env.VITE_CONFIG_API_URL;

// Fetch GLOBAL config
export const fetchGlobalConfig = createAsyncThunk("config/fetchGlobalConfig", async () => {
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
