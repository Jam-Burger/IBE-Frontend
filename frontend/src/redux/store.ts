import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './languageSlice';
import dataReducer ,{ fetchData } from './dataSlice';
import currencySlice,{fetchExchangeRates} from './currencySlice';

const store = configureStore({
  reducer: {
    language: languageReducer,
    data: dataReducer,
    currency: currencySlice
  }
});

store.dispatch(fetchData());
store.dispatch(fetchExchangeRates());
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
