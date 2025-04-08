import {FC, useCallback, useEffect, useState} from "react";
import {HiChevronDown, HiChevronUp} from "react-icons/hi";
import {LuUserRound} from "react-icons/lu";
import {Separator} from "../components/ui";
import OTPModal from "./../components/ui/OTPModal";
import {useParams} from "react-router-dom";
import {BookingDetails, PropertyDetails, Room} from "../types";
import {api} from "../lib/api-client";
import {computeDiscountedPrice, convertToLocaleCurrency, maskCardNumber, toTitleCase,} from "../lib/utils.ts";
import {useAppSelector} from "../redux/hooks.ts";
import toast from "react-hot-toast";

const ConfirmationPage: FC = () => {
    const {tenantId, bookingId} = useParams<{
        tenantId: string;
        bookingId: string;
    }>();
    const [bookingData, setBookingData] = useState<BookingDetails | null>(null);
    const [roomTypeData, setRoomTypeData] = useState<Room | null>(null);
    const [propertyDetails, setPropertyDetails] =
        useState<PropertyDetails | null>(null);
    const {selectedCurrency, multiplier} = useAppSelector(
        (state) => state.currency
    );

    const [isRoomSummaryOpen, setIsRoomSummaryOpen] = useState(true);
    const [isGuestInfoOpen, setIsGuestInfoOpen] = useState(false);
    const [isBillingAddressOpen, setIsBillingAddressOpen] = useState(false);
    const [isPaymentInfoOpen, setIsPaymentInfoOpen] = useState(false);
    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);

    const fetchBookingData = useCallback(async () => {
        if (tenantId && bookingId) {
            try {
                const response = await api.getBookingDetails(tenantId, bookingId);
                setBookingData(response.data);
            } catch (err) {
                console.error("Failed to fetch booking details", err);
            }
        }
    }, [tenantId, bookingId]);

    const fetchPropertyData = useCallback(async () => {
        if (tenantId && bookingData?.property_id) {
            try {
                const response = await api.getPropertyDetails(
                    tenantId,
                    bookingData.property_id
                );
                setPropertyDetails(response.data);
            } catch (err) {
                console.error("Failed to fetch property details", err);
            }
        }
    }, [tenantId, bookingData?.property_id]);

    const fetchRoomTypeData = useCallback(async () => {
        if (tenantId && bookingData) {
            try {
                const response = await api.getRoomTypeDetails(
                    tenantId,
                    bookingData.property_id,
                    bookingData.room_type_id,
                    bookingData.check_in_date,
                    bookingData.check_out_date
                );
                setRoomTypeData(response.data);
            } catch (err) {
                console.error("Failed to fetch room type details", err);
            }
        }
    }, [tenantId, bookingData]);

    useEffect(() => {
        fetchBookingData();
    }, [fetchBookingData]);

    useEffect(() => {
        fetchPropertyData();
    }, [fetchPropertyData]);

    useEffect(() => {
        fetchRoomTypeData();
    }, [fetchRoomTypeData]);

    const handleCancelClick = async () => {
        if (!tenantId || !bookingData?.guest_details?.travelerEmail) {
            setOtpError("Cannot send OTP: Missing required information.");
            toast.error("Missing email information");
            return;
        }

        setIsSendingOtp(true);
        setOtpError(null);

        try {
            await api.sendOtp(tenantId, bookingData.guest_details.travelerEmail);
            setIsOTPModalOpen(true); // Open modal only on success
            toast.success(`OTP sent to ${bookingData.guest_details.travelerEmail}`);
        } catch (error) {
            console.error("Failed to send OTP", error);
            setOtpError("Failed to send OTP. Please try again.");
            toast.error("Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    if (!bookingData) return <div>Loading...</div>;
    if (!propertyDetails || !roomTypeData) return <div>loading...</div>;

    const {
        check_in_date,
        check_out_date,
        adult_count,
        child_count,
        amount_due_at_resort,
        transaction,
        room_numbers,
        special_offer,
        guest_details,
        booking_status,
    } = bookingData;

    const {roomRates} = roomTypeData;

    const checkInDate = new Date(check_in_date);
    const checkOutDate = new Date(check_out_date);
    const durationInDays =
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24);

    const roomRateAverage =
        roomRates.reduce((acc, rate) => acc + rate.price, 0) / roomRates.length;

    const discountedAverageRate = bookingData.special_offer
        ? computeDiscountedPrice(bookingData.special_offer, roomRates)
        : roomRateAverage;

    // Calculate taxes and fees
    const occupancyTaxRate = 0; // TODO: here
    const resortFeeRate = propertyDetails.surcharge;
    const additionalFeesRate = propertyDetails.fees;
    const totalTaxRate = occupancyTaxRate + resortFeeRate + additionalFeesRate;

    const baseAmount = discountedAverageRate * durationInDays;
    const totalTaxes = (baseAmount * totalTaxRate) / 100;
    const totalAmount = baseAmount + totalTaxes;
    const dueNow = bookingData.total_cost - amount_due_at_resort;

    console.log(totalAmount, bookingData.total_cost, dueNow);

    const roomName = `Room ${room_numbers.join(", ")}: ${toTitleCase(
        roomTypeData.roomTypeName
    )}`;
    const guests = `${adult_count} Adults, ${child_count} Children`;
    const cancellationPolicy =
        "Copy explaining the cancellation policy, if applicable";
    const roomImage =
        "https://plus.unsplash.com/premium_photo-1661962493427-910e3333cf5a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmVhdXRpZnVsJTIwcm9vbXxlbnwwfHwwfHx8MA%3D%3D";

    const isCancelled = booking_status === "CANCELLED";

    const handleEmailClick = async () => {
        if (!tenantId || !bookingData) {
            return;
        }

        try {
            await api.sendBookingEmail(tenantId, bookingData.booking_id);
            toast.success(`Email sent to ${bookingData.guest_details.travelerEmail}`);
        } catch (error) {
            toast.error("Failed to send email. Please try again. " + error);
        }
    }
    return (
        <div className="mt-4 md:mt-6 lg:mt-8 mb-4 px-4 md:px-6 lg:px-0">
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 w-full max-w-[69.625rem] mx-auto">
                <h1 className="text-[#2F2F2F] font-lato font-bold text-lg md:text-xl mb-2 sm:mb-0">
                    {isCancelled ? "Cancelled" : "Upcoming"} reservation #{bookingId}
                </h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => print()}
                        className="text-[#006EFF] font-lato text-sm md:text-base"
                    >
                        Print
                    </button>
                    <button className="text-[#006EFF] font-lato text-sm md:text-base"
                            onClick={handleEmailClick}>
                        Email
                    </button>
                </div>
            </div>

            <div
                className="w-full max-w-[69.625rem] mx-auto shadow-md border border-[#C1C2C2] rounded-lg bg-white relative">
                {/* Cancelled Overlay */}
                {isCancelled && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="relative">
                            {/* Red circle */}
                            <div className="w-64 h-64 rounded-full bg-red-500/20 border-4 border-red-500"></div>

                            {/* Diagonal CANCELLED text */}
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                <div className="transform rotate-[-30deg]">
                                    <span className="text-red-600 text-5xl font-bold tracking-wider">CANCELLED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-4 md:p-6 relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="flex flex-col sm:flex-row items-start mb-2 sm:mb-0">
                            <h1 className="font-lato font-bold text-xl md:text-2xl leading-[140%]">
                                {roomName}
                            </h1>
                            <div className="flex items-center text-[#5D5D5D] mt-1 sm:ml-3 sm:mt-2">
                                <LuUserRound className="w-4 h-4 mr-1"/>
                                <span className="font-lato text-sm leading-[140%]">
                                    {guests}
                                </span>
                            </div>
                        </div>
                        {!isCancelled && (
                            <button
                                onClick={handleCancelClick}
                                disabled={isSendingOtp}
                                className="cursor-pointer text-[#006EFF] font-lato font-normal text-sm md:text-base leading-[100%] mt-2 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSendingOtp ? "Sending OTP..." : "Cancel Room"}
                            </button>
                        )}
                    </div>
                    {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}

                    <OTPModal
                        isOpen={isOTPModalOpen}
                        onClose={() => setIsOTPModalOpen(false)}
                        email={bookingData?.guest_details.travelerEmail || ""}
                        tenantId={tenantId}
                        bookingId={bookingId}
                        onSuccess={() => {
                            // Optionally refresh the booking data after cancellation
                            fetchBookingData();
                        }}
                    />

                    <div className="mt-4 md:mt-6 flex flex-col md:flex-row">
                        <div
                            className="w-full md:w-[20.5rem] h-[12rem] md:h-[14rem] overflow-hidden rounded-sm md:mr-6 border border-gray-200 mb-4 md:mb-0">
                            <img
                                src={roomImage}
                                alt={roomName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                }}
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap gap-3 md:gap-6 mb-4">
                                <div
                                    className="rounded-[5px] border-[1px] border-[#858685] p-3 md:p-4 w-[calc(50%-0.375rem)] sm:w-auto sm:min-w-[6.5625rem] text-center">
                                    <div
                                        className="text-[#858685] font-lato font-normal text-xs md:text-sm leading-[140%]">
                                        Check in
                                    </div>
                                    <div
                                        className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                                        {checkInDate.getDate()}
                                    </div>
                                    <div
                                        className="text-[#2F2F2F] font-lato font-normal text-sm md:text-base leading-[140%]">
                                        {checkInDate.toLocaleString("default", {
                                            month: "long",
                                        })}{" "}
                                        {checkInDate.getFullYear()}
                                    </div>
                                </div>
                                <div
                                    className="rounded-[5px] border-[1px] border-[#858685] p-3 md:p-4 w-[calc(50%-0.375rem)] sm:w-auto sm:min-w-[6.5625rem] text-center">
                                    <div
                                        className="text-[#858685] font-lato font-normal text-xs md:text-sm leading-[140%]">
                                        Check Out
                                    </div>
                                    <div
                                        className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                                        {checkOutDate.getDate()}
                                    </div>
                                    <div
                                        className="text-[#2F2F2F] font-lato font-normal text-sm md:text-base leading-[140%]">
                                        {checkOutDate.toLocaleString(
                                            "default",
                                            {month: "long"}
                                        )}{" "}
                                        {checkOutDate.getFullYear()}
                                    </div>
                                </div>
                            </div>

                            {special_offer && (
                                <div
                                    className="mt-2 md:mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div className="w-full sm:w-auto mb-3 sm:mb-0">
                                        <h3 className="text-[#2F2F2F] font-lato font-bold text-lg md:text-xl leading-[130%]">
                                            {convertToLocaleCurrency(
                                                selectedCurrency.symbol,
                                                discountedAverageRate,
                                                multiplier,
                                                false
                                            )}{" "}
                                            {special_offer.title}
                                        </h3>
                                        <p className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%] mt-1">
                                            {special_offer.description}
                                        </p>

                                        <p className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%] mt-3 md:mt-5">
                                            {cancellationPolicy}
                                        </p>
                                    </div>
                                    <p className="text-[#000000] font-lato font-normal text-lg md:text-xl leading-[140%]">
                                        {convertToLocaleCurrency(
                                            selectedCurrency.symbol,
                                            discountedAverageRate,
                                            multiplier,
                                            false
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Separator className="w-[95%] h-[0.0625rem] bg-[#C1C2C2]"/>
                </div>

                <div className="px-4 md:px-6">
                    <button
                        className="w-full py-3 md:py-4 flex items-center"
                        onClick={() => setIsRoomSummaryOpen(!isRoomSummaryOpen)}
                    >
                        {isRoomSummaryOpen ? (
                            <HiChevronUp size={20} className="w-5 h-5 mr-2"/>
                        ) : (
                            <HiChevronDown size={20} className="w-5 h-5 mr-2"/>
                        )}
                        <span className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                            Room total summary
                        </span>
                    </button>

                    {isRoomSummaryOpen && (
                        <div className="ml-7 md:ml-8">
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Nightly rate
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {convertToLocaleCurrency(
                                        selectedCurrency.symbol,
                                        discountedAverageRate,
                                        multiplier,
                                        false
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Subtotal
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {convertToLocaleCurrency(
                                        selectedCurrency.symbol,
                                        baseAmount,
                                        multiplier,
                                        false
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Taxes, Surcharges, Fees
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {convertToLocaleCurrency(
                                        selectedCurrency.symbol,
                                        totalTaxes,
                                        multiplier,
                                        false
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between py-2 md:py-3">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Total for stay
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {convertToLocaleCurrency(
                                        selectedCurrency.symbol,
                                        totalAmount,
                                        multiplier,
                                        false
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Separator className="w-[95%] h-[0.0625rem] bg-[#C1C2C2]"/>
                </div>

                <div className="px-4 md:px-6">
                    <button
                        className="w-full py-3 md:py-4 flex items-center"
                        onClick={() => setIsGuestInfoOpen(!isGuestInfoOpen)}
                    >
                        {isGuestInfoOpen ? (
                            <HiChevronUp size={20} className="w-5 h-5 mr-2"/>
                        ) : (
                            <HiChevronDown size={20} className="w-5 h-5 mr-2"/>
                        )}
                        <span className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                            Guest Information
                        </span>
                    </button>
                    {isGuestInfoOpen && (
                        <div className="ml-7 md:ml-8">
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    First Name
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.travelerFirstName}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Last Name
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.travelerLastName}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Phone
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.travelerPhone}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Email
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%] break-all">
                                    {guest_details.travelerEmail}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Separator className="w-[95%] h-[0.0625rem] bg-[#C1C2C2]"/>
                </div>

                <div className="px-4 md:px-6">
                    <button
                        className="w-full py-3 md:py-4 flex items-center"
                        onClick={() =>
                            setIsBillingAddressOpen(!isBillingAddressOpen)
                        }
                    >
                        {isBillingAddressOpen ? (
                            <HiChevronUp size={20} className="w-5 h-5 mr-2"/>
                        ) : (
                            <HiChevronDown size={20} className="w-5 h-5 mr-2"/>
                        )}
                        <span className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                            Billing Address
                        </span>
                    </button>
                    {isBillingAddressOpen && (
                        <div className="ml-7 md:ml-8">
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    First Name
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.billingFirstName}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Last Name
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.billingLastName}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Mailing Address 1
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.billingAddress1}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Mailing Address 2
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.billingAddress2}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Country
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.billingCountry}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    City
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.billingCity}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    State
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.billingState}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    ZIP
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.billingZip}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Phone
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {guest_details.billingPhone}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Email
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%] break-all">
                                    {guest_details.billingEmail}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Separator className="w-[95%] h-[0.0625rem] bg-[#C1C2C2]"/>
                </div>

                <div className="px-4 md:px-6">
                    <button
                        className="w-full py-3 md:py-4 flex items-center"
                        onClick={() => setIsPaymentInfoOpen(!isPaymentInfoOpen)}
                    >
                        {isPaymentInfoOpen ? (
                            <HiChevronUp size={20} className="w-5 h-5 mr-2"/>
                        ) : (
                            <HiChevronDown size={20} className="w-5 h-5 mr-2"/>
                        )}
                        <span className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                            Payment Information
                        </span>
                    </button>
                    {isPaymentInfoOpen && (
                        <div className="ml-7 md:ml-8 mb-2">
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Card Number
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {maskCardNumber(transaction.cardNumber)}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span
                                    className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Expiration
                                </span>
                                <span
                                    className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    04/26
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;
