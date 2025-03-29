import React from 'react';
import {Outlet} from 'react-router-dom';
import {ErrorComponent, Footer, Header} from '../components';
import * as Sentry from '@sentry/react';
import {Toaster} from 'react-hot-toast';

export const AppLayout: React.FC = () => {
    return (
        <Sentry.ErrorBoundary fallback={<ErrorComponent/>}>
            <div className="w-full flex flex-col min-h-screen">
                <Header/>
                <main className="pt-[84px]">
                    <Outlet/>
                </main>
                <Footer/>
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                    gutter={8}
                    containerClassName=""
                    containerStyle={{}}
                    toastOptions={{
                        // Default options for all toasts
                        className: '',
                        duration: 3000,
                        style: {
                            background: '#333',
                            color: '#fff',
                        },
                        // Custom styles for toast types
                        success: {
                            duration: 3000,
                            style: {
                                background: '#4CAF50',
                            },
                        },
                        error: {
                            duration: 3000,
                            style: {
                                background: '#F44336',
                            },
                        },
                    }}
                />
            </div>
        </Sentry.ErrorBoundary>
    );
}; 