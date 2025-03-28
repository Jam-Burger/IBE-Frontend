import React from 'react';
import {Link} from 'react-router-dom';
import {Routes} from '../router/routes';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
                <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-6">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    to={Routes.HOME}
                    className="inline-block bg-primary text-white px-6 py-2 rounded text-lg font-medium hover:bg-blue-800 transition-colors"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage; 