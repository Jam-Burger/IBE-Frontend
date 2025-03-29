import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {BaseState, StateStatus} from "../types/common";
import {RootState} from "./store";
import {setSelectedCurrency} from "./currencySlice";
import {api} from "../lib/api-client";

export interface Language {
    code: string;
    name: string;
}

interface LanguageState extends BaseState {
    selectedLanguage: Language;
    hasInitialized: boolean;
}

const initialState: LanguageState = {
    selectedLanguage: {
        code: "en",
        name: "English"
    },
    status: StateStatus.IDLE,
    error: null,
    hasInitialized: false
};

declare global {
    interface Window {
        translatePage?: (langCode: string) => void;
    }
}

export const fetchLocationInfo = createAsyncThunk(
    "location/fetchInfo",
    async (_, {dispatch, getState}) => {
        try {
            const state = getState() as RootState;
            if (state.language.hasInitialized) {
                return null;
            }

            const response = await api.getLocationInfo();
            const globalConfig = state.config.globalConfig;
            const languageName = response.language;

            let language;
            if (globalConfig?.configData?.languages) {
                language = globalConfig.configData.languages.find((l: Language) => l.name === languageName);
                if (!language) {
                    language = globalConfig.configData.languages[0];
                }
            } else {
                language = {code: "en", name: "English"};
            }

            dispatch(setLanguage(language));

            const currencyCode = response.currency?.code;
            let currency;
            if (globalConfig?.configData.currencies) {
                currency = globalConfig.configData.currencies.find(c => c.code === currencyCode);
                if (!currency) {
                    currency = globalConfig.configData.currencies[0];
                }
            } else {
                currency = {code: "USD", symbol: "$"};
            }
            dispatch(setSelectedCurrency(currency));
            return response;
        } catch (error) {
            console.error("Error fetching location info:", error);
            return null;
        }
    }
);

const languageSlice = createSlice({
    name: "language",
    initialState,
    reducers: {
        setLanguage: (state, action) => {
            state.selectedLanguage = action.payload;
            window.translatePage?.(action.payload.code);
        },
        updateLanguage: (state, action) => {
            state.selectedLanguage = action.payload;
            window.translatePage?.(action.payload.code);
            window.location.reload();
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocationInfo.pending, (state) => {
                state.status = StateStatus.LOADING;
                state.error = null;
            })
            .addCase(fetchLocationInfo.fulfilled, (state) => {
                state.status = StateStatus.IDLE;
                state.hasInitialized = true;
            })
            .addCase(fetchLocationInfo.rejected, (state, action) => {
                state.status = StateStatus.ERROR;
                state.error = action.error.message ?? null;
                state.hasInitialized = true;
            });
    },
});

export const {updateLanguage, setLanguage} = languageSlice.actions;
export default languageSlice.reducer; 