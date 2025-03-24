import React from 'react';
import {Outlet} from 'react-router-dom';
import {ErrorComponent, Footer, Header} from '../components';
import * as Sentry from '@sentry/react';

export const AppLayout: React.FC = () => {
    return (
        <Sentry.ErrorBoundary fallback={<ErrorComponent/>}>
            <div className="flex flex-col min-h-screen">
                <Header/>
                <main className="flex-grow">
                    <Outlet/>
                </main>
                <Footer/>
            </div>
        </Sentry.ErrorBoundary>
    );
}; 