import React from "react";
import { PulseLoader } from "react-spinners";

const LoadingOverlay: React.FC<{ message?: string }> = ({
    message = "Loading...",
}) => {
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
                <PulseLoader color="var(--primary)" size={10} />
                <p className="text-gray-700">{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
