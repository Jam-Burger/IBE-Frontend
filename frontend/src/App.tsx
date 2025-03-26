import React from 'react';
import './App.css';
import {RouterProvider} from 'react-router-dom';
import * as Sentry from '@sentry/react';
import {Router} from './router';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './redux/store';

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
});

const App: React.FC = () => {
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
