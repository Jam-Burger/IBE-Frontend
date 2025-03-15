import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import i18n from "../../public/i18n/i18n";


interface LanguageState {
    language: string;
}

// Detect browser language
const browserLanguage = navigator.language.split('-')[0];

// Get stored language or fallback to browser language
const initialState: LanguageState = {
    language: browserLanguage || 'en',
};

// Set i18n to the initial language
i18n.changeLanguage(initialState.language);

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<string>) => {

            state.language = action.payload;

            i18n.changeLanguage(action.payload);
            localStorage.setItem('i18nextLng', action.payload);
        },
    },
});

export const {setLanguage} = languageSlice.actions;
export default languageSlice.reducer;
