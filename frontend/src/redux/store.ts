import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './languageSlice';
import dataReducer ,{ fetchData } from './dataSlice';

const store = configureStore({
  reducer: {
    language: languageReducer,
    data: dataReducer
  }
});
store.dispatch(fetchData());
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
