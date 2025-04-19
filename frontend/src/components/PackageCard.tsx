import {FC} from "react";
import {MdClose, MdLocalOffer} from "react-icons/md";
import {useAppSelector} from "../redux/hooks.ts";
import {convertToLocaleCurrency} from "../lib/utils.ts";
import {Button} from "./ui";
import {PackageData} from "../types";

interface HotelPackageCardProps {
    packageData: PackageData;
    onSelectPackage?: () => void;
    onRemove?: () => void;
    promoCode?: string;
}

const PackageCard: FC<HotelPackageCardProps> = ({
                                                    packageData,
                                                    onSelectPackage,
                                                    onRemove,
                                                    promoCode,
                                                }) => {
    const {selectedCurrency, multiplier} = useAppSelector(
        (state) => state.currency
    );
    return (
        <div className="w-full md:w-[618px] min-h-[130px] flex rounded-lg shadow-md overflow-hidden my-4 relative">
            {/* Left section */}
            <div className="flex-1 p-4 flex flex-col justify-start items-start gap-2 mt-2">
                {promoCode && (
                    <div className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded-md flex items-center text-xs">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onRemove) onRemove();
                            }}
                            className="hover:bg-gray-300 p-0.5 rounded-full cursor-pointer"
                            aria-label="Remove promo code"
                        >
                            <MdClose size={16}/>
                        </button>
                        <MdLocalOffer className="mr-1" size={14}/>
                        <span className="mr-1 font-medium text-xs">
                            {promoCode}
                        </span>
                    </div>
                )}
                <h3 className="font-bold text-[16px] line-clamp-1">
                    {packageData.title}
                </h3>
                <p className="text-gray-600 text-[16px] font-normal leading-[1.4] line-clamp-2">
                    {packageData.description}
                </p>
            </div>
            {/* Right section */}
            <div className="min-w-[200px] min-h-full bg-[#EFF0F1] flex flex-col items-end justify-center p-4 text-right">
                <span className="text-xl font-bold flex justify-end mb-1 no-translate">
                    {convertToLocaleCurrency(
                        selectedCurrency.symbol,
                        packageData.price,
                        multiplier,
                        false
                    )}
                </span>
                <span className="text-gray-500 text-xs flex justify-end">
                    per night
                </span>
                <Button
                    className="mt-2 min-w-[153px] h-[35px]"
                    onClick={onSelectPackage}
                >
                    SELECT PACKAGE
                </Button>
            </div>
        </div>
    );
};

export default PackageCard;
