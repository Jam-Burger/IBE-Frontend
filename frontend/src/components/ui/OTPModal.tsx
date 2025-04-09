import React, {useState} from 'react';
import {MdOutlineClose} from "react-icons/md";
import {api} from "../../lib/api-client";
import toast from "react-hot-toast";
import {useParams} from "react-router-dom";
import {AxiosError} from "axios";

interface OTPModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    purpose: 'cancellation' | 'booking';
    onSuccess: (otp: string) => void;
}

const OTPModal: React.FC<OTPModalProps> = ({
                                               isOpen,
                                               onClose,
                                               email,
                                               purpose,
                                               onSuccess
                                           }) => {
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {tenantId} = useParams<{
        tenantId: string;
    }>();

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value);
        if (error) setError(null);
    };

    const handleVerifyAndDoStuff = async () => {
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }

        if (!tenantId) {
            setError('Missing booking information');
            toast.error('Cannot proceed: Missing booking information');
            return;
        }

        setIsVerifying(true);
        setError(null);

        try {
            // Step 1: Verify OTP
            await api.verifyOtp(tenantId, email, otp);
            toast.success('OTP verified successfully');

            // Success
            if (onSuccess) onSuccess(otp);
            onClose();
        } catch (e: unknown) {
            const error = e as AxiosError<{ message: string }>;
            console.error('Error during verification:', error.response?.data?.message);
            if (purpose === 'cancellation') {
                setError("Failed to cancel booking. Please try again later.");
                toast.error(error.response?.data?.message ?? 'Cancellation failed');
            } else {
                setError("Failed to book property. Please try again later.");
                toast.error(error.response?.data?.message ?? 'Booking failed');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-[29.875rem] max-w-[90vw] h-auto bg-white relative rounded-md p-[2rem]">
                <button
                    onClick={onClose}
                    disabled={isVerifying}
                    className="w-[1.5rem] h-[1.5rem] absolute right-4 top-4 text-gray-500 hover:text-gray-700 disabled:opacity-50 cursor-pointer"
                >
                    <MdOutlineClose/>
                </button>

                <div>
                    <h2 className="w-full text-[#000000] font-bold text-[24px] leading-[140%] tracking-normal">
                        Enter OTP for cancelling the room booking
                    </h2>

                    <p className="text-gray-600 mt-2 text-sm">
                        An OTP has been sent to <strong>{email}</strong>. Please enter it below to confirm cancellation.
                    </p>

                    <input
                        type="text"
                        className="w-full h-[3rem] rounded-[0.25rem] border-[0.0625rem] border-gray-[#C1C2C2] mt-4 px-4 py-3"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={handleOtpChange}
                        disabled={isVerifying}
                        maxLength={6}
                    />

                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}

                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={onClose}
                            disabled={isVerifying}
                            className="text-primary text-sm disabled:opacity-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleVerifyAndDoStuff}
                            disabled={isVerifying}
                            className="w-auto px-4 h-[2.5rem] bg-primary text-white rounded-[0.25rem] text-sm disabled:opacity-50 flex items-center justify-center min-w-[7.3125rem] cursor-pointer"
                        >
                            {isVerifying ? 'Verifying...' : 'CONFIRM OTP'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPModal;