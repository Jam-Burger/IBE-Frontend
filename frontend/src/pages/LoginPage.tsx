import {Link, useParams, useNavigate} from "react-router-dom";
import {useAuth} from "react-oidc-context";

const LoginPage = () => {
    const {tenantId} = useParams<{ tenantId: string }>();
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogin = () => {
        auth.signinRedirect();
    };

    const handleLogout = () => {
        // Navigate to logout handler which will clear the user session
        navigate('/auth/logout');
    };

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Encountering error... {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
                        Welcome, {auth.user?.profile.email}
                    </h2>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 text-white p-3 rounded-xl font-semibold hover:bg-red-700 transition">
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
                    Login to Your Account
                </h2>
                <button
                    onClick={handleLogin}
                    className="w-full bg-primary text-white p-3 rounded-xl font-semibold hover:bg-[#1f1f5f] transition">
                    Sign in with Cognito
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
