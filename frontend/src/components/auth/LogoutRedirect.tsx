import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";

export const LogoutRedirect: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const redirectPath = localStorage.getItem("redirectPath") || "/";

        const timer = setTimeout(() => {
            navigate(redirectPath, { replace: true });
            localStorage.removeItem("redirectPath");
        }, 100);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center">
            <PulseLoader color="var(--primary)" size={10} />
            <p className="mt-4 text-gray-600">Logging out...</p>
        </div>
    );
};
