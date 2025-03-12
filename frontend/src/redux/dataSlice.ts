import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Student{
    name: string;
    email: string;
    age: number
}

interface DataState {
  data: Student[]; 
  loading: boolean;
  error: string | null; 
}

const initialState: DataState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchData = createAsyncThunk("data/fetchData", async () => {
    const API_URL = import.meta.env.VITE_API_URL; // Read from .env
    const response = await axios.get(`${API_URL}/students`);
    return response.data;
});

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action: PayloadAction<Student[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export default dataSlice.reducer;
