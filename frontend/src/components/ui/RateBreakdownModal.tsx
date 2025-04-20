import React from "react";
import {Dialog, DialogContent} from "./Dialog";
import {useAppSelector} from "../../redux/hooks";
import {convertToLocaleCurrency, getDailyRates} from "../../lib/utils";

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
    const {room, propertyDetails, promotionApplied} = useAppSelector((state) => state.checkout);
    const {selectedCurrency, multiplier} = useAppSelector((state) => state.currency);

    if (!room || !propertyDetails) {
        return null;
    }

    // Calculate daily rates using the utility function
    const dailyRates = promotionApplied && "discount_percentage" in promotionApplied
        ? getDailyRates(promotionApplied, room.roomRates)
        : room.roomRates.map(rate => ({
            date: rate.date,
            minimumRate: rate.price,
            discountedRate: rate.price
        }));

    // Calculate totals
    const subtotal = dailyRates.reduce((acc, rate) => acc + rate.discountedRate, 0);

    // Calculate taxes and fees
    const occupancyTaxRate = propertyDetails.surcharge || 0;
    const resortFeeRate = propertyDetails.fees || 0;
    const additionalFeesRate = 0; // No additional fees in PropertyDetails type

    const occupancyTax = (subtotal * occupancyTaxRate) / 100;
    const resortFee = (subtotal * resortFeeRate) / 100;
    const additionalFees = (subtotal * additionalFeesRate) / 100;

    const totalTaxesAndFees = occupancyTax + resortFee + additionalFees;
    const totalAmount = subtotal + totalTaxesAndFees;

    // Calculate payment breakdown (5% now, rest at resort)
    const dueNow = totalAmount * 0.05;
    const dueAtResort = totalAmount - dueNow;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-[409px] !max-h-[742px] rounded-none p-8 overflow-y-auto">
                <div className="relative">
                    <h2 className="text-2xl font-bold mb-4">Rate Breakdown</h2>

                    <div className="space-y-3">
                        <div>
                            <h3 className="font-medium mb-1">Room type</h3>
                            <h3 className="font-medium mb-1">
                                Nightly Rate (per room)
                            </h3>
                        </div>

                        <div>
                            {promotionApplied && "title" in promotionApplied && (
                                <p className="mb-2">{promotionApplied.title}</p>
                            )}
                            {dailyRates.map((dayRate, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between py-1"
                                >
                                    <span>{formatDate(dayRate.date)}</span>
                                    <div className="text-right">
                                        {dayRate.minimumRate !== dayRate.discountedRate && (
                                            <span className="line-through text-gray-500 mr-2 no-translate">
                                                {convertToLocaleCurrency(selectedCurrency.symbol, dayRate.minimumRate, multiplier, false)}
                                            </span>
                                        )}
                                        <span className="no-translate">
                                            {convertToLocaleCurrency(selectedCurrency.symbol, dayRate.discountedRate, multiplier, false)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between py-2 mt-2">
                                <span className="font-medium">Room Subtotal</span>
                                <span className="font-medium no-translate">
                                    {convertToLocaleCurrency(selectedCurrency.symbol, subtotal, multiplier, false)}
                                </span>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-2">
                                Taxes and fees (per room)
                            </h3>
                            <div className="space-y-2 my-2">
                                {resortFeeRate > 0 && (
                                    <div className="flex justify-between">
                                        <span>Resort fee ({resortFeeRate}%)</span>
                                        <span className="no-translate">{convertToLocaleCurrency(selectedCurrency.symbol, resortFee, multiplier, false)}</span>
                                    </div>
                                )}
                                {occupancyTaxRate > 0 && (
                                    <div className="flex justify-between">
                                        <span>Occupancy tax ({occupancyTaxRate}%)</span>
                                        <span className="no-translate">{convertToLocaleCurrency(selectedCurrency.symbol, occupancyTax, multiplier, false)}</span>
                                    </div>
                                )}
                                {additionalFeesRate > 0 && (
                                    <div className="flex justify-between">
                                        <span>Additional fees ({additionalFeesRate}%)</span>
                                        <span className="no-translate">{convertToLocaleCurrency(selectedCurrency.symbol, additionalFees, multiplier, false)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Due now (5%)</span>
                                <span className="font-medium no-translate">
                                    {convertToLocaleCurrency(selectedCurrency.symbol, dueNow, multiplier, false)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">
                                    Due at resort
                                </span>
                                <span className="font-medium no-translate">
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
