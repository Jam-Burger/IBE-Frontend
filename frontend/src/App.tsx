import React from 'react';
import './App.css';
import {RouterProvider} from 'react-router-dom';
import * as Sentry from '@sentry/react';
import {Router} from './router';
import {ApolloProvider} from '@apollo/client';
import {client} from './lib/apollo-client';
import {Provider} from 'react-redux';
import store from './redux/store';
// Import i18n configuration to ensure it's loaded at startup
import '../public/i18n/i18n';

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
});

const App: React.FC = () => {
    return (
        <ApolloProvider client={client}>
            <Provider store={store}>
                <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
                    <RouterProvider router={Router}/>
                </Sentry.ErrorBoundary>
            </Provider>
        </ApolloProvider>
    );
};

export default App;
