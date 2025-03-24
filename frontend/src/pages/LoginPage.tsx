import {Link, useParams} from "react-router-dom";

const LoginPage = () => {
    // Get tenant ID from URL
    const {tenantId} = useParams<{ tenantId: string }>();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
                    Login to Your Account
                </h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="flex items-center text-sm text-gray-600">
                            <input type="checkbox" className="mr-2"/> Remember me
                        </label>
                        <Link to={`/${tenantId}/forgot-password`} className="text-blue-600 text-sm hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                    <button
                        className="w-full bg-[#26266D] text-white p-3 rounded-xl font-semibold hover:bg-[#1f1f5f] transition">
                        Login
                    </button>
                </form>
                <p className="text-center text-gray-600 text-sm mt-4">
                    Don't have an account?
                    <Link to={`/${tenantId}/signup`} className="text-blue-600 font-semibold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
