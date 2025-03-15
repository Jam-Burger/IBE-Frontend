import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './languageSlice';
;
import currencySlice,{fetchExchangeRates} from './currencySlice';

const store = configureStore({
  reducer: {
    language: languageReducer,
  
    currency: currencySlice
  }
});


store.dispatch(fetchExchangeRates());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
