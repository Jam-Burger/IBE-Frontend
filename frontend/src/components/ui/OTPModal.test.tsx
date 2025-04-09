import {describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import OTPModal from './OTPModal';
import {BrowserRouter} from 'react-router-dom';

// Mock the API and toast functions
vi.mock('../../lib/api-client', () => ({
    api: {
        verifyOtp: vi.fn(),
        cancelBooking: vi.fn()
    }
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('OTPModal', () => {
    // Test that the component renders when isOpen is true
    it('renders when isOpen is true', () => {
        render(
            <BrowserRouter>
                <OTPModal
                    isOpen={true}
                    onClose={vi.fn()}
                    email="test@example.com"
                    tenantId="test-tenant"
                    bookingId="123"
                />
            </BrowserRouter>
        );

        expect(screen.getByText(/enter otp for cancelling/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });

    // Test that the component doesn't render when isOpen is false
    it('does not render when isOpen is false', () => {
        const {container} = render(
            <BrowserRouter>
                <OTPModal
                    isOpen={false}
                    onClose={vi.fn()}
                    email="test@example.com"
                    tenantId="test-tenant"
                    bookingId="123"
                />
            </BrowserRouter>
        );

        expect(container.firstChild).toBeNull();
    });

    // Test that the close button calls onClose
    it('calls onClose when the close button is clicked', () => {
        const onCloseMock = vi.fn();
        render(
            <BrowserRouter>
                <OTPModal
                    isOpen={true}
                    onClose={onCloseMock}
                    email="test@example.com"
                    tenantId="test-tenant"
                    bookingId="123"
                />
            </BrowserRouter>
        );

        const closeButton = screen.getByRole('button', {name: /cancel/i});
        fireEvent.click(closeButton);

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    // Test error message when OTP is not entered
    it('shows error when trying to confirm without entering OTP', () => {
        render(
            <BrowserRouter>
                <OTPModal
                    isOpen={true}
                    onClose={vi.fn()}
                    email="test@example.com"
                    tenantId="test-tenant"
                    bookingId="123"
                />
            </BrowserRouter>
        );

        const confirmButton = screen.getByRole('button', {name: /confirm otp/i});
        fireEvent.click(confirmButton);

        expect(screen.getByText(/please enter the otp/i)).toBeInTheDocument();
    });
}); 