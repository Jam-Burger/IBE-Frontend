// @vitest-environment jsdom
import {describe, expect, it, Mock, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import LoginPage from './LoginPage';

// Create a mock for the react-oidc-context module
vi.mock('react-oidc-context', () => ({
    useAuth: vi.fn()
}));

// Import the actual useAuth function for typing
import {useAuth} from 'react-oidc-context';

describe('LoginPage', () => {
    it('renders login page correctly when not authenticated', () => {
        // Setup the mock to return not authenticated state
        const mockUseAuth = useAuth as Mock;
        mockUseAuth.mockReturnValue({
            isLoading: false,
            isAuthenticated: false,
            error: null,
            signinRedirect: vi.fn(),
            removeUser: vi.fn()
        });

        render(
            <BrowserRouter>
                <LoginPage/>
            </BrowserRouter>
        );

        // Check for login button when not authenticated
        const heading = screen.getByText('Login to Your Account');
        expect(heading).toBeDefined();
        const loginButton = screen.getByText('Sign in with Cognito');
        expect(loginButton).toBeDefined();
    });

    it('renders logout button when authenticated', () => {
        // Setup the mock to return authenticated state
        const mockUseAuth = useAuth as Mock;
        mockUseAuth.mockReturnValue({
            isLoading: false,
            isAuthenticated: true,
            user: {profile: {email: 'test@example.com'}},
            error: null,
            signinRedirect: vi.fn(),
            removeUser: vi.fn()
        });

        render(
            <BrowserRouter>
                <LoginPage/>
            </BrowserRouter>
        );

        // Check for welcome message and logout button when authenticated
        const welcomeText = screen.getByText(/Welcome/);
        expect(welcomeText).toBeDefined();
        const logoutButton = screen.getByText('Sign Out');
        expect(logoutButton).toBeDefined();
    });

    it('shows loading state when auth is loading', () => {
        // Setup the mock to return loading state
        const mockUseAuth = useAuth as Mock;
        mockUseAuth.mockReturnValue({
            isLoading: true,
            isAuthenticated: false,
            user: null,
            error: null,
            signinRedirect: vi.fn(),
            removeUser: vi.fn()
        });

        render(
            <BrowserRouter>
                <LoginPage/>
            </BrowserRouter>
        );

        // Check for loading message
        const loadingText = screen.getByText('Loading...');
        expect(loadingText).toBeDefined();
    });

    it('shows error message when auth has error', () => {
        // Setup the mock to return error state
        const mockUseAuth = useAuth as Mock;
        mockUseAuth.mockReturnValue({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            error: {message: 'Auth error'},
            signinRedirect: vi.fn(),
            removeUser: vi.fn()
        });

        render(
            <BrowserRouter>
                <LoginPage/>
            </BrowserRouter>
        );

        // Check for error message
        const errorText = screen.getByText(/Encountering error/);
        expect(errorText).toBeDefined();
    });
});