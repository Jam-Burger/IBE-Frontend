import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import i18n from "../../public/i18n/i18n";

interface LanguageState {
    language: string;
}

const browserLanguage = navigator.language.split('-')[0];

const initialState: LanguageState = {
    language: browserLanguage || 'en',
};

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
