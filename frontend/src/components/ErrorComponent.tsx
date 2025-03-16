import React from "react";

const ErrorComponent: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-red-200 text-white">
            <div className="bg-white p-8 rounded-lg shadow-lg text-red-700 max-w-md w-full">
                <h2 className="text-2xl font-semibold">Oops! Something went wrong.</h2>
                <p className="mt-2 text-lg">An unexpected error occurred. Please try again.</p>
            </div>
        </div>
    );
};

export default ErrorComponent;