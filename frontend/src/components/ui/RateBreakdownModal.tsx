import React from "react";
import { Dialog, DialogContent } from "./Dialog";
import { useAppSelector } from "../../redux/hooks";
import { computeDiscountedPrice, convertToLocaleCurrency } from "../../lib/utils";

interface RateBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const RateBreakdownModal: React.FC<RateBreakdownModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { room, promotionApplied, propertyDetails } = useAppSelector((state) => state.checkout);
    const { selectedCurrency, multiplier } = useAppSelector((state) => state.currency);

    if (!room || !propertyDetails || !promotionApplied) {
        return null;
    }

    // Calculate base room rate and promo rate
    const roomRate = room.roomRates.reduce((acc, rate) => acc + rate.price, 0) / room.roomRates.length;
    const promoRate = "discount_percentage" in promotionApplied ? computeDiscountedPrice(promotionApplied, room.roomRates) : roomRate;

    // Calculate daily rates with promotion applied
    const dailyRates = room.roomRates.map((rate) => ({
        date: rate.date,
        originalRate: rate.price,
        discountedRate: "discount_percentage" in promotionApplied ? 
            rate.price * (1 - promotionApplied.discount_percentage / 100) : 
            rate.price
    }));

    // Calculate totals
    const totalOriginalRate = dailyRates.reduce((sum, day) => sum + day.originalRate, 0);
    const totalDiscountedRate = dailyRates.reduce((sum, day) => sum + day.discountedRate, 0);

    // Calculate fees
    const resortFee = (totalDiscountedRate * (propertyDetails.surcharge || 0)) / 100;
    const additionalFees = (totalDiscountedRate * (propertyDetails.fees || 0)) / 100;
    const totalFees = resortFee + additionalFees;

    // Calculate payment structure
    const isFullPaymentPromo = promotionApplied && 
        'discount_percentage' in promotionApplied && 
        promotionApplied.discount_percentage === 10;

    const totalAmount = totalDiscountedRate + totalFees;
    const dueNow = isFullPaymentPromo ? totalAmount : (totalAmount * 5) / 100;
    const dueAtResort = isFullPaymentPromo ? 0 : totalAmount - dueNow;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-[409px] !h-[742px] p-6 overflow-y-auto">
                <div className="relative">
                    <h2 className="text-2xl font-bold mb-4">Rate Breakdown</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-1">Room type</h3>
                            <p>{room.roomTypeName}</p>
                        </div>

                        <div>
                            <h3 className="font-medium mb-1">
                                Nightly Rate (per room)
                            </h3>
                            {promotionApplied.title && (
                                <p className="mb-2">{promotionApplied.title}</p>
                            )}
                            {dailyRates.map((dayRate, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between py-1"
                                >
                                    <span>{formatDate(dayRate.date)}</span>
                                    <div className="text-right">
                                        {dayRate.originalRate !== dayRate.discountedRate && (
                                            <span className="line-through text-gray-400 mr-2">
                                                {convertToLocaleCurrency(selectedCurrency.symbol, dayRate.originalRate, multiplier, false)}
                                            </span>
                                        )}
                                        <span>
                                            {convertToLocaleCurrency(selectedCurrency.symbol, dayRate.discountedRate, multiplier, false)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between py-2 border-t mt-2">
                                <span className="font-medium">Room Total</span>
                                <span className="font-medium">
                                    {convertToLocaleCurrency(selectedCurrency.symbol, totalDiscountedRate, multiplier, false)}
                                </span>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-2">
                                Taxes and fees (per room)
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Resort fee ({propertyDetails.surcharge}%)</span>
                                    <span>{convertToLocaleCurrency(selectedCurrency.symbol, resortFee, multiplier, false)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Additional fees ({propertyDetails.fees}%)</span>
                                    <span>{convertToLocaleCurrency(selectedCurrency.symbol, additionalFees, multiplier, false)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Due now {isFullPaymentPromo ? '(100%)' : '(5%)'}</span>
                                <span className="font-medium">
                                    {convertToLocaleCurrency(selectedCurrency.symbol, dueNow, multiplier, false)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">
                                    Due at resort {isFullPaymentPromo ? '' : '(95%)'}
                                </span>
                                <span className="font-medium">
                                    {convertToLocaleCurrency(selectedCurrency.symbol, dueAtResort, multiplier, false)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RateBreakdownModal;
