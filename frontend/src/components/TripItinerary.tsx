import React, {useState} from 'react';
import {Button} from './ui';
import {CiCircleInfo} from "react-icons/ci";
import PromoModal from './ui/PromoModal';
import RateBreakdownModal from './ui/RateBreakdownModal';
import {useAppSelector} from '../redux/hooks';
import {computeDiscountedPrice, convertToLocaleCurrency, generateSummeryText, toTitleCase} from '../lib/utils';

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

interface TripItineraryProps {
    currency?: string;
    onRemove?: () => void;
    onContinueShopping?: () => void;
}

const TripItinerary: React.FC<TripItineraryProps> = ({
                                                         onRemove,
                                                         onContinueShopping
                                                     }) => {
    // Get data from Redux slices
    const {room, promotionApplied, propertyDetails} = useAppSelector((state) => state.checkout);
    const {filter} = useAppSelector((state) => state.roomFilters);

    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [isRateBreakdownOpen, setIsRateBreakdownOpen] = useState(false);
    const {selectedCurrency, multiplier} = useAppSelector((state) => state.currency);

    // Format date to "May 9" format
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
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

    const roomRate = room.roomRates.reduce((acc, rate) => acc + rate.price, 0) / room.roomRates.length;
    const promoRate = "discount_percentage" in promotionApplied ? computeDiscountedPrice(promotionApplied, room.roomRates) : roomRate;

    // Calculate taxes and fees
    const occupancyTaxRate = 0; // TODO: here
    const resortFeeRate = propertyDetails.surcharge || 0;
    const additionalFeesRate = propertyDetails.fees || 0;

    // Calculate total tax and fee percentages
    const totalTaxRate = occupancyTaxRate + resortFeeRate + additionalFeesRate;

    // Calculate base amount (before taxes)
    const baseAmount = promoRate;

    // Calculate total taxes and fees
    const totalTaxes = (baseAmount * totalTaxRate) / 100;

    // Calculate total amount (including taxes)
    const totalAmount = baseAmount + totalTaxes;

    // Check if promotion is for 100% upfront payment
    const isFullPaymentPromo = promotionApplied &&
        'discount_percentage' in promotionApplied &&
        promotionApplied.discount_percentage === 10;

    // Calculate due now and due at resort
    let dueNow = 0;
    let dueAtResort = 0;

    if (isFullPaymentPromo) {
        // For 100% upfront payment promotion with 10% discount
        dueNow = totalAmount;
        dueAtResort = 0;
    } else {
        // Standard payment structure: 5% upfront, 95% at resort
        dueNow = (totalAmount * 5) / 100;
        dueAtResort = totalAmount - dueNow;
    }

    // Prepare room details
    const roomDetails: RoomDetails = {
        name: toTitleCase(room.roomTypeName),
        rate: roomRate,
        count: filter.roomCount,
        promoName: promotionApplied.title,
        promoRate: promoRate
    };

    // Prepare booking details
    const bookingDetails: BookingDetails = {
        resortName: propertyDetails.propertyName,
        checkInDate: filter.dateRange?.from ? new Date(filter.dateRange.from) : new Date(),
        checkOutDate: filter.dateRange?.to ? new Date(filter.dateRange.to) : new Date(),
        guests: filter.guests,
        subtotal: baseAmount,
        taxes: totalTaxes,
        dueNow: dueNow,
        dueAtResort: dueAtResort
    };

    return (
        <div className="bg-[#F5F5F5] p-6 w-[400px] h-[500px]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#333]">Your Trip Itinerary</h2>
                <Button variant="link" className="text-blue-500 p-0 h-auto" onClick={onRemove}>Remove</Button>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-bold mb-1">{bookingDetails.resortName}</h3>
                <p className="text-sm text-gray-600 mb-1">
                    {formatDate(bookingDetails.checkInDate)} - {formatDate(bookingDetails.checkOutDate)}, {bookingDetails.checkOutDate.getFullYear()} | {generateSummeryText(bookingDetails.guests)}
                </p>
                <p className="text-sm text-gray-600 mb-1">{roomDetails.name}</p>
                <p className="text-sm text-gray-600 mb-1">{convertToLocaleCurrency(selectedCurrency.symbol, roomDetails.rate, multiplier, false)}/night</p>
                <p className="text-sm text-gray-600 mb-1">{roomDetails.count} room{roomDetails.count !== 1 ? 's' : ''}</p>

                {roomDetails.promoName && roomDetails.promoRate && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                        <span>{roomDetails.promoName}, {convertToLocaleCurrency(selectedCurrency.symbol, roomDetails.promoRate, multiplier, false)}/night</span>
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
                    <span
                        className="text-sm font-medium">{convertToLocaleCurrency(selectedCurrency.symbol, bookingDetails.subtotal, multiplier, false)}</span>
                </div>

                <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-600">Taxes, Surcharges, Fees</span>
                        <button
                            onClick={() => setIsRateBreakdownOpen(true)}
                            className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                        >
                            <CiCircleInfo className="w-4 h-4"/>
                        </button>
                    </div>
                    <span
                        className="text-sm font-medium">{convertToLocaleCurrency(selectedCurrency.symbol, bookingDetails.taxes, multiplier, false)}</span>
                </div>
            </div>

            <div className="border-t border-gray-300 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">Due Now</span>
                    <span
                        className="text-sm font-medium">{convertToLocaleCurrency(selectedCurrency.symbol, bookingDetails.dueNow, multiplier, false)}</span>
                </div>

                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">Due at Resort</span>
                    <span
                        className="text-sm font-medium">{convertToLocaleCurrency(selectedCurrency.symbol, bookingDetails.dueAtResort, multiplier, false)}</span>
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <Button
                    className="w-[193px] h-[44px] border-[3px] border-primary text-primary bg-gray hover:bg-blue-50"
                    onClick={onContinueShopping}
                >
                    CONTINUE SHOPPING
                </Button>
            </div>

            <PromoModal
                isOpen={isPromoModalOpen}
                onClose={() => setIsPromoModalOpen(false)}
            />

            <RateBreakdownModal
                isOpen={isRateBreakdownOpen}
                onClose={() => setIsRateBreakdownOpen(false)}
            />
        </div>
    );
};

export default TripItinerary; 