import React, {useState} from "react";
import {Button} from "./ui";
import {CiCircleInfo} from "react-icons/ci";
import PromoModal from "./ui/PromoModal";
import RateBreakdownModal from "./ui/RateBreakdownModal";
import {useAppSelector} from "../redux/hooks";
import {cn, computeDiscountedPrice, convertToLocaleCurrency, generateSummeryText, toTitleCase,} from "../lib/utils";
import {setCurrentStep} from "../redux/stepperSlice.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useAppDispatch} from "../redux/hooks.ts";
import {setPromotionApplied, setRoom} from "../redux/checkoutSlice.ts";

interface RoomDetails {
    name: string;
    rate: number;
    count: number;
    promoName?: string;
    promoRate?: number;
}

interface BookingDetails {
    resortName: string;
    checkInDate: Date;
    checkOutDate: Date;
    guests: Record<string, number>;
    subtotal: number;
    taxes: number;
    dueNow: number;
    dueAtResort: number;
}

const TripItinerary: React.FC = () => {
    // Get data from Redux slices
    const {room, promotionApplied, propertyDetails} = useAppSelector(
        (state) => state.checkout
    );
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {tenantId} = useParams<{ tenantId: string }>();
    const {filter} = useAppSelector((state) => state.roomFilters);
    const {currentStep} = useAppSelector((state) => state.stepper);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [isRateBreakdownOpen, setIsRateBreakdownOpen] = useState(false);
    const {selectedCurrency, multiplier} = useAppSelector(
        (state) => state.currency
    );

    // Format date to "May 9" format
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    if (!room) {
        return <div>No room selected</div>;
    }

    if (!propertyDetails) {
        return <div>No property details</div>;
    }

    if (!promotionApplied) {
        return <div>No promotion applied</div>;
    }

    const roomAverageRate =
        room.roomRates.reduce((acc, rate) => acc + rate.price, 0) /
        room.roomRates.length;
    const promoAverageRate =
        "discount_percentage" in promotionApplied
            ? computeDiscountedPrice(promotionApplied, room.roomRates)
            : roomAverageRate;

    // Calculate taxes and fees
    const occupancyTaxRate = 0; // TODO: here
    const resortFeeRate = propertyDetails.surcharge;
    const additionalFeesRate = propertyDetails.fees;

    // Calculate total tax and fee percentages
    const totalTaxRate = occupancyTaxRate + resortFeeRate + additionalFeesRate;

    // Calculate base amount (before taxes)
    const baseAmount = promoAverageRate * room.roomRates.length;

    // Calculate total taxes and fees
    const totalTaxes = (baseAmount * totalTaxRate) / 100;

    // Calculate total amount (including taxes)
    const totalAmount = baseAmount + totalTaxes;

    // Calculate due now and due at resort
    const dueNow = (totalAmount * 5) / 100;
    const dueAtResort = totalAmount - dueNow;

    // Prepare room details
    const roomDetails: RoomDetails = {
        name: toTitleCase(room.roomTypeName),
        rate: roomAverageRate,
        count: filter.roomCount,
        promoName: promotionApplied.title,
        promoRate: promoAverageRate,
    };

    // Prepare booking details
    const bookingDetails: BookingDetails = {
        resortName: propertyDetails.propertyName,
        checkInDate: filter.dateRange?.from
            ? new Date(filter.dateRange.from)
            : new Date(),
        checkOutDate: filter.dateRange?.to
            ? new Date(filter.dateRange.to)
            : new Date(),
        guests: filter.guests,
        subtotal: baseAmount,
        taxes: totalTaxes,
        dueNow: dueNow,
        dueAtResort: dueAtResort,
    };

    const handleRemove = () => {
        if (!tenantId) return;
        dispatch(setCurrentStep(0));
        dispatch(setRoom(null));
        dispatch(setPromotionApplied(null));
        navigate(`/${tenantId}/rooms-list`);
    };

    const handleContinue = () => {
        if (!tenantId) return;
        if (currentStep === 1) {
            dispatch(setCurrentStep(2));
            navigate(`/${tenantId}/checkout`);
        } else if (currentStep === 2) {
            dispatch(setCurrentStep(1));
            navigate(`/${tenantId}/rooms-list`);
        }
    };

    return (
        <div
            className={cn("bg-[#F5F5F5] p-6 mx-auto mb-3", currentStep === 2 ? "w-[400px] h-[500px]" : "w-[330px] h-[494px]")}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#333]">
                    Your Trip Itinerary
                </h2>
                <Button
                    variant="link"
                    className="text-blue-500 p-0 h-auto"
                    onClick={handleRemove}
                >
                    Remove
                </Button>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-bold mb-1">
                    {bookingDetails.resortName}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                    {formatDate(bookingDetails.checkInDate)} -{" "}
                    {formatDate(bookingDetails.checkOutDate)},{" "}
                    {bookingDetails.checkOutDate.getFullYear()} |{" "}
                    {generateSummeryText(bookingDetails.guests)}
                </p>
                <p className="text-sm text-gray-600 mb-1">{roomDetails.name}</p>
                <p className="text-sm text-gray-600 mb-1">
                    {convertToLocaleCurrency(
                        selectedCurrency.symbol,
                        roomDetails.rate,
                        multiplier,
                        false
                    )}
                    /night
                </p>
                <p className="text-sm text-gray-600 mb-1">
                    {roomDetails.count} room{roomDetails.count !== 1 ? "s" : ""}
                </p>

                {roomDetails.promoName && roomDetails.promoRate && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                        <span>
                            {roomDetails.promoName},{" "}
                            {convertToLocaleCurrency(
                                selectedCurrency.symbol,
                                roomDetails.promoRate,
                                multiplier,
                                false
                            )}
                            /night
                        </span>
                        <button
                            onClick={() => setIsPromoModalOpen(true)}
                            className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                        >
                            <CiCircleInfo className="w-4 h-4"/>
                        </button>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-300 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium">
                        {convertToLocaleCurrency(
                            selectedCurrency.symbol,
                            bookingDetails.subtotal,
                            multiplier,
                            false
                        )}
                    </span>
                </div>

                <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-600">
                            Taxes, Surcharges, Fees
                        </span>
                        <button
                            onClick={() => setIsRateBreakdownOpen(true)}
                            className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                        >
                            <CiCircleInfo className="w-4 h-4"/>
                        </button>
                    </div>
                    <span className="text-sm font-medium">
                        {convertToLocaleCurrency(
                            selectedCurrency.symbol,
                            bookingDetails.taxes,
                            multiplier,
                            false
                        )}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-300 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">
                        Due Now
                    </span>
                    <span className="text-sm font-medium">
                        {convertToLocaleCurrency(
                            selectedCurrency.symbol,
                            bookingDetails.dueNow,
                            multiplier,
                            false
                        )}
                    </span>
                </div>

                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">
                        Due at Resort
                    </span>
                    <span className="text-sm font-medium">
                        {convertToLocaleCurrency(
                            selectedCurrency.symbol,
                            bookingDetails.dueAtResort,
                            multiplier,
                            false
                        )}
                    </span>
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <Button
                    variant="outline"
                    className="w-[193px] h-[44px] border-[3px] cursor-pointer"
                    onClick={handleContinue}
                >
                    {currentStep === 2 ? "CONTINUE SHOPPING" : "CHECKOUT"}
                </Button>
            </div>

            <PromoModal
                isOpen={isPromoModalOpen}
                onClose={() => setIsPromoModalOpen(false)}
                offer={promotionApplied}
                discountedPrice={convertToLocaleCurrency(
                    selectedCurrency.symbol,
                    roomDetails.promoRate,
                    multiplier,
                    false
                )}
            />

            <RateBreakdownModal
                isOpen={isRateBreakdownOpen}
                onClose={() => setIsRateBreakdownOpen(false)}
            />
        </div>
    );
};

export default TripItinerary;
