import React, { useEffect } from 'react';
import './App.css';
import {RouterProvider} from 'react-router-dom';
import * as Sentry from '@sentry/react';
import {Router} from './router';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './redux/store';

import ReactGA from "react-ga4";




Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
});

const App: React.FC = () => {
   useEffect(() => {
        const trackingId = import.meta.env.VITE_GA_MEASUREMENT_ID as string;
        ReactGA.initialize(trackingId);
        ReactGA.send({hitType:"pageview", page: window.location.pathname, title: document.title});
    }
    , []);
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
                    <RouterProvider router={Router}/>
                </Sentry.ErrorBoundary>
            </PersistGate>
        </Provider>
    );
};

export default App;
