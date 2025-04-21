import React, { useEffect } from 'react';
import './App.css';
import {RouterProvider} from 'react-router-dom';
import { browserTracingIntegration, init as SentryInit } from "@sentry/react";
// import { init as sentryInit } from "@sentry/react";
import { ErrorBoundary } from "@sentry/react";
import { Router } from './router';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './redux/store';

import ReactGA from "react-ga4";
import Smartlook from 'smartlook-client';
import { Client } from '@sentry/core';
import { ErrorBoundary } from '@sentry/react';




SentryInit({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [browserTracingIntegration()],
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE
});

const App: React.FC = () => {
    useEffect(() => {

        const trackingId = import.meta.env.VITE_GA_MEASUREMENT_ID;
        const smartlookKey = import.meta.env.VITE_SMARTLOOK_KEY; // Add this
    
        // Initialize Google Analytics
        if (trackingId) {
            ReactGA.initialize(trackingId);
            ReactGA.send({
                hitType: "pageview",
                page: window.location.pathname,
                title: document.title
            });
        }
    
        // Initialize Smartlook (only in production, optional)
        if (smartlookKey) {
            Smartlook.init(smartlookKey);              
        }
    }, []);    

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ErrorBoundary fallback={<p>An error has occurred</p>}>
            
                    <RouterProvider router={Router}/>
                </ErrorBoundary>
            </PersistGate>
        </Provider>
    );
};

export default App;

