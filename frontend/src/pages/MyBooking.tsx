import { useEffect, useState } from "react";
import BookingHeader from "../components/BookingHeader";
import BookingTabs from "../components/BookingTabs";
import OTPModal from "./../components/ui/OTPModal";
import { BookingType } from "../types";
import { api } from "../lib/api-client";
import toast from "react-hot-toast";
import { useAuth } from "react-oidc-context";

const tenantId = import.meta.env.VITE_TENANT_ID as string;

const MyBookings = () => {

    const auth = useAuth();
    const [isVerified, setIsVerified] = useState(false);
    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [bookedHotels, setBookedHotels] = useState<BookingType[]>([]);
    const [cancelledHotels, setCancelledHotels] = useState<BookingType[]>([]);

    useEffect(() => {
        const guestToken = localStorage.getItem("guestToken");

        if (auth.user?.profile.email) {

            setEmail(auth.user.profile.email);
            setIsVerified(true);
        } else if (guestToken) {

            setIsVerified(true);

        }
    }, [auth.user]);

    useEffect(() => {
        if (isVerified) {
            const idToken = auth.user?.id_token || null;

            const guestToken = localStorage.getItem("guestToken");

            if (!idToken && !guestToken) {
                return;
            }

            api
                .getBookingHistoryWithDetails(tenantId, email, idToken) 
                .then((response) => {
                    const booked = response.filter((booking: BookingType) => booking.status === "BOOKED");
                    const cancelled = response.filter((booking: BookingType) => booking.status === "CANCELLED");
                    setBookedHotels(booked);
                    setCancelledHotels(cancelled);
                })
                .catch((error) => {
                    console.error("Failed to fetch booking details", error);
                    toast.error("Failed to fetch booking details. Please try again.");
                });
        }
    }, [isVerified, email]);

    const handleSendOtp = async () => {
        if (!email.trim()) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            setIsSendingOtp(true);
            await api.sendOtp(tenantId, email);
            setIsOTPModalOpen(true);
            toast.success(`OTP sent to ${email}`);
        } catch (error) {
            console.error("Failed to send OTP", error);
            toast.error("Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleOtpSuccess = () => {
        setIsVerified(true);
        setIsOTPModalOpen(false);

        api
            .getBookingHistoryWithDetails(tenantId, email, null)
            .then((response) => {
                const booked = response.filter((booking: BookingType) => booking.status === "BOOKED");
                const cancelled = response.filter((booking: BookingType) => booking.status === "CANCELLED");

                setBookedHotels(booked);
                setCancelledHotels(cancelled);
            })
            .catch((error) => {
                console.error("Failed to fetch booking details", error);
                toast.error("Failed to fetch booking details. Please try again.");
            });
    };

    if (!isVerified) {
        return (
            <div className="min-h-screen bg-[#F1F0FB] flex items-center justify-center p-4">
                <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center">
                    <h1 className="text-2xl font-semibold mb-4">Access Your Bookings</h1>
                    <p className="text-gray-600 mb-6">
                        Enter your email to view your bookings. We'll send you a one-time code for secure access.
                    </p>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full border border-gray-300 rounded p-2 mb-4"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="w-full bg-primary text-white py-2 rounded disabled:opacity-50"
                    >
                        {isSendingOtp ? "Sending OTP..." : "Get My Bookings"}
                    </button>
                </div>
                <OTPModal
                    isOpen={isOTPModalOpen}
                    onClose={() => setIsOTPModalOpen(false)}
                    email={email}
                    purpose="bookingList"
                    onSuccess={handleOtpSuccess}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F1F0FB] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <BookingHeader />
                <main className="mt-8">
                    <BookingTabs bookedHotels={bookedHotels} cancelledHotels={cancelledHotels} />
                </main>
            </div>
        </div>
    );
};

export default MyBookings;
