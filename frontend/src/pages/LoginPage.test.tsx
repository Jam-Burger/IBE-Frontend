import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
    it('renders login page correctly', () => {
        render(
            <BrowserRouter>
                <LoginPage/>
            </BrowserRouter>
        );

        // Only test the main heading to ensure basic rendering
        const heading = screen.getByText('Login to Your Account');
        expect(heading).toBeDefined();
    });
});