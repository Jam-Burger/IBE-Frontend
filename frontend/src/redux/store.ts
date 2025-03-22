import {configureStore} from '@reduxjs/toolkit';
import languageReducer from './languageSlice';
import currencySlice, {fetchExchangeRates} from './currencySlice';
import configSlice,{fetchGlobalConfig,fetchLandingConfig} from './configSlice';

const store = configureStore({
    reducer: {
        language: languageReducer,
        currency: currencySlice,
        config:configSlice
    }
});


store.dispatch(fetchExchangeRates());
store.dispatch(fetchGlobalConfig());
store.dispatch(fetchLandingConfig());
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
