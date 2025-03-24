import {configureStore} from '@reduxjs/toolkit';
import languageReducer from './languageSlice';
import currencySlice, {fetchExchangeRates} from './currencySlice';
import configSlice, {fetchGlobalConfig} from './configSlice';
import roomRatesSlice from './roomRatesSlice';

const store = configureStore({
    reducer: {
        language: languageReducer,
        currency: currencySlice,
        config: configSlice,
        roomRates: roomRatesSlice
    }
});

store.dispatch(fetchExchangeRates());
store.dispatch(fetchGlobalConfig());


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
