import PackageCard from "./PackageCard.tsx";
import { GoPerson } from "react-icons/go";
import { MdOutlineBed } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import ImageCarousel from "./ui/ImageCarousel";
import { Room } from "../types"; // Make sure this import matches your type definition

interface RoomDetailsModalProps {
    room: Room;
    onClose?: () => void;
}

// Sample package data - you might want to fetch this from an API later
const packageData = [
    {
        title: "Standard Rate",
        description: "Spend $10 every night you stay and earn $150 in dining credit at the resort.",
        price: 132,
    },
    {
        title: "150 Dining Credit Package",
        description: "Spend $10 every night you stay and earn $150 in dining credit at the resort.",
        price: 110,
    },
    {
        title: "Kids eat free",
        description: "Spend $10 every night you stay and earn $150 in dining credit at the resort.",
        price: 105,
    },
];

const RoomDetailsModal = ({ room, onClose }: RoomDetailsModalProps) => {
    const handleSelectPackage = (index: number) => {
        console.log(`Selected package: ${packageData[index].title}`);
    };

    // Format guest capacity text
    const guestText = `1-${room.maxCapacity} Guests`;
    
    // Format bed type text
    const bedText = room.singleBed > 0 && room.doubleBed > 0 
        ? `${room.singleBed} Single & ${room.doubleBed} Double` 
        : room.singleBed > 0 
            ? `${room.singleBed} Single Bed${room.singleBed > 1 ? 's' : ''}` 
            : `${room.doubleBed} Double Bed${room.doubleBed > 1 ? 's' : ''}`;
    
    // Format room size
    const roomSize = `${room.areaInSquareFeet} sqft`;

    return (
        <div className="w-full max-w-[1286px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden relative">
            {/* White close button */}
            {onClose && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-white hover:text-gray-200 transition-colors"
                    aria-label="Close"
                >
                    <IoClose size={28} />
                </button>
            )}

            {/* Header Section with Image Carousel */}
            <ImageCarousel
                images={room.images}
                height="381px"
                width="100%"
                showTitle={true}
                title={room.roomTypeName.replace('_', ' ')}
                arrowsStyle="large"
                showDots={true}
                autoRotate={true}
            />

            {/* Room Details */}
            <div className="p-8">
                <div className="flex justify-between items-start text-sm">
                    <div>
                        <div className="flex gap-4 text-gray-600">
                            <span className="flex justify-between items-center gap-2"><GoPerson />{guestText}</span>
                            <span className="flex justify-between items-center gap-2"><MdOutlineBed />{bedText}</span>
                            <span>{roomSize}</span>
                        </div>

                        {/* Description */}
                        <p className="text-black-700 text-[16px] leading-relaxed w-[590px] h-[98px] mt-4 font-normal">
                            {room.description}
                        </p>
                    </div>

                    {/* Amenities section */}
                    <div>
                        <h2 className="font-bold w-[129px] h-[23px] text-[16px] leading-[140%] font-normal text-black">
                            Amenities
                        </h2>

                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            {room.amenities.map((amenity, index) => (
                                <span key={index} className="flex justify-start items-center gap-2 font-normal text-[16px] text-[#2F2F2F]">
                                    <FaRegCircleCheck /> {amenity}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing & Packages */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold">Standard Rate</h2>
                    <PackageCard
                        packageData={packageData[0]}
                        onSelectPackage={() => handleSelectPackage(0)}
                    />

                    <h2 className="text-xl font-bold mt-6">Deals & Packages</h2>
                    {packageData.slice(1).map((pkg, index) => (
                        <PackageCard
                            key={index}
                            packageData={pkg}
                            onSelectPackage={() => handleSelectPackage(index + 1)}
                        />
                    ))}
                </div>

                {/* Promo Code Input */}
                <div className="mt-6">
                    <label className="text-gray-700 text-sm block mb-2">Enter a promo code</label>
                    <div className="flex gap-2">
                        <input type="text" className="border border-gray-400 p-2 rounded w-64 text-sm" />
                        <button className="flex justify-center items-center bg-primary text-white px-4 py-2 rounded text-sm w-[65px] h-[48px]">
                            <span className="h-[20px] w-[44px]">APPLY</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetailsModal;
