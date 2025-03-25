import {configureStore} from '@reduxjs/toolkit';
import currencySlice, {fetchExchangeRates} from './currencySlice';
import configSlice from './configSlice';
import roomRatesSlice from './roomRatesSlice';

const store = configureStore({
    reducer: {
        currency: currencySlice,
        config: configSlice,
        roomRates: roomRatesSlice
    }
});

store.dispatch(fetchExchangeRates());


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
