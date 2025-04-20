import React, { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";

export const AuthCallback: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                if (!auth.isLoading && !auth.error) {
                    const redirectPath = localStorage.getItem("redirectPath") || "/";
                    localStorage.removeItem("redirectPath");
                    
                    navigate(redirectPath);
                }
            } catch (error) {
                console.error("Error during sign-in callback:", error);
                navigate("/");
            }
        };

        handleCallback();
    }, [auth, navigate]);

    if (auth.isLoading) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center">
                <PulseLoader color="var(--primary)" size={10} />
                <p className="mt-4 text-gray-600">Logging in...</p>
            </div>
        );
    }

    if (auth.error) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center">
                <p className="text-gray-600">Authentication error: {auth.error.message}</p>
                <button onClick={() => auth.signinRedirect()}>Try again</button>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center">
            <p className="text-gray-600">Redirecting...</p>
        </div>
    );
};
