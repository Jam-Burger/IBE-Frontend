import {combineReducers, configureStore} from '@reduxjs/toolkit';
import currencyReducer from "./currencySlice";
import configReducer from "./configSlice";
import roomRatesReducer from "./roomRatesSlice";
import languageReducer from "./languageSlice";
import filterReducer from "./filterSlice";
import checkoutReducer from "./checkoutSlice";
import storage from "redux-persist/lib/storage";
import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE} from 'redux-persist';

const rootReducer = combineReducers({
    config: configReducer,
    language: languageReducer,
    currency: currencyReducer,
    roomRates: roomRatesReducer,
    roomFilters: filterReducer,
    checkout: checkoutReducer,
});

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ["language", "currency", "config", "roomFilters", "checkout"]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export {store};
