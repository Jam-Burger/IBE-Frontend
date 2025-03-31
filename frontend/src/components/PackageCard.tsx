import {FC} from "react";
import { IoClose } from "react-icons/io5";
import { MdLocalOffer } from "react-icons/md";

interface PackageData {
    title: string;
    price: number;
    description: string;
}

interface HotelPackageCardProps {
    packageData: PackageData;
    onSelectPackage?: () => void;
    removable?: boolean;
    onRemove?: () => void;
    promoCode?: string;
}

const PackageCard: FC<HotelPackageCardProps> = ({
    packageData,
    onSelectPackage,
    removable = false,
    onRemove,
    promoCode
}) => {
  console.log("PackageCard props:", { removable, promoCode });

  return (
    <div className="w-[618px] h-[130px] flex rounded-lg shadow-md overflow-hidden my-4 relative">
      {/* Custom promo code badge with remove button - moved to top-left corner */}
      {removable && promoCode && (
        <div className="absolute top-0 left-0 z-50">
          <div className="bg-gray-200 text-gray-800 px-3 py-1 rounded-br-md shadow-md flex items-center text-xs">

          <button
              onClick={(e) => {
                e.stopPropagation();
                if (onRemove) onRemove();
              }}
              className="hover:bg-gray-300 p-0.5 rounded-full"
              aria-label="Remove promo code"
            >
              <IoClose size={16} />

            </button>
            <span className="mr-1 font-medium">{promoCode}</span>

            <MdLocalOffer className="mr-1" size={14} />
          </div>
        </div>
      )}

      {/* Left section */}
      <div className="flex-1 p-4 flex flex-col justify-start gap-2 mt-2">
        <h3 className="font-bold text-[16px] line-clamp-1">{packageData.title}</h3>
        <p className="text-gray-600 text-[16px] font-normal leading-[1.4] line-clamp-2">
          {packageData.description}
        </p>
      </div>
      {/* Right section */}
      <div className="w-[200px] h-[130px] bg-[#EFF0F1] flex flex-col items-end justify-center p-4 text-right">
        <span className="text-xl font-bold flex justify-end mb-1">${packageData.price}</span>
        <span className="text-gray-500 text-xs flex justify-end">per night</span>
        <button
          className="mt-2 bg-[#26266D] text-white text-sm w-[153px] h-[35px] rounded"
          onClick={onSelectPackage}
        >
          SELECT PACKAGE
        </button>
      </div>
    </div>
  );
};

export default PackageCard;
