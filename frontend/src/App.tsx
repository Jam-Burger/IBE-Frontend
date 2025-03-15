import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage';
import * as Sentry from '@sentry/react';

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
});

const App: React.FC = () => {
    return (
        <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                </Routes>
            </Router>
        </Sentry.ErrorBoundary>

    );
};

export default App;
