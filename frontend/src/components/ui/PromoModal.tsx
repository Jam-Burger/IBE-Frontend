import React from "react";
import { Dialog, DialogContent } from "./Dialog";
import { PromoOffer, SpecialDiscount, StandardPackage } from "../../types";
import { toTitleCase } from "../../lib/utils";

interface PromoModalProps {
    isOpen: boolean;
    onClose: () => void;
    offer: StandardPackage | SpecialDiscount | PromoOffer;
    discountedPrice: string;
}

const PromoModal: React.FC<PromoModalProps> = ({ isOpen, onClose, offer, discountedPrice }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] p-6">
                <div className="relative">
                    <h2 className="text-2xl font-bold mb-2">
                        {toTitleCase(offer.title)}
                    </h2>

                    <div className="space-y-2">
                        <p className="text-lg">{offer.description}</p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-medium">
                                Package Total
                            </span>
                            <span className="text-lg font-medium">
                                {discountedPrice}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PromoModal;
