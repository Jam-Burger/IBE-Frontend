import React, {useEffect} from 'react';
import {useAuth} from 'react-oidc-context';
import {useNavigate} from 'react-router-dom';

export const AuthCallback: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // The react-oidc-context library handles the callback automatically
                // We just need to navigate once authentication is complete
                if (!auth.isLoading && !auth.error) {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error during sign-in callback:', error);
                navigate('/');
            }
        };

        handleCallback();
    }, [auth, navigate]);

    if (auth.isLoading) {
        return <div>Processing authentication...</div>;
    }

    if (auth.error) {
        return <div>Authentication error: {auth.error.message}</div>;
    }

    return <div>Redirecting...</div>;
}; 