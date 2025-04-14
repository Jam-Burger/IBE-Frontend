import React, {useEffect} from 'react';
import {useAuth} from 'react-oidc-context';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PulseLoader} from "react-spinners";
import {updateFormData} from "../../redux/checkoutSlice.ts";
import {useDispatch} from "react-redux";

export const AuthCallback: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const params = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                if (!auth.isLoading && !auth.error) {
                    if (auth.user?.profile.email) {
                        dispatch(updateFormData({name: 'billingEmail', value: auth.user.profile.email}));
                    }
                    navigate('/');
                }
            } catch (error) {
                console.error('Error during sign-in callback:', error);
                navigate('/');
            }
        };

        handleCallback();
    }, [auth, navigate, params]);

    if (auth.isLoading) {
        return <PulseLoader
            loading={auth.isLoading}
            className="text-primary w-full h-full flex justify-center items-center"/>
    }

    if (auth.error) {
        return <div>Authentication error: {auth.error.message}</div>;
    }
    return <div>Redirecting...</div>;
}; 