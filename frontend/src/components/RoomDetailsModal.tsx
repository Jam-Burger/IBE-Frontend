import PackageCard from "./PackageCard.tsx";
import { GoPerson } from "react-icons/go";
import { MdOutlineBed } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import ImageCarousel from "./ui/ImageCarousel";
import { Room } from "../types"; // Make sure this import matches your type definition
import { useEffect, useState } from "react";
import { api } from "../lib/api-client";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../redux/hooks.ts";

interface RoomDetailsModalProps {
    room: Room;
    onClose?: () => void;
    onSelectRoom?: () => void;
}

interface SpecialDiscount {
    title: string;
    description: string;
    property_id: number;
    start_date: string;
    end_date: string;
    discount_percentage: number;
}

const RoomDetailsModal = ({ room, onClose, onSelectRoom }: RoomDetailsModalProps) => {
    const [specialDiscounts, setSpecialDiscounts] = useState<SpecialDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { tenantId } = useParams<{ tenantId: string }>();
    
    // Get date range from redux store
    const dateRange = useAppSelector(state => state.roomFilters.dateRange);
    
    // Use room price for standard package
    const standardPackage = {
        title: "Standard Rate",
        description: "Our standard room rate with all basic amenities included.",
        price: 132, // Use a fixed price since Room type doesn't have price property
    };

    useEffect(() => {
        const fetchSpecialDiscounts = async () => {
            if (!tenantId || !room.propertyId) return;
            
            setIsLoading(true);
            try {
                // Use selected date range from filters if available
                let formattedStartDate, formattedEndDate;
                
                if (dateRange && dateRange.from && dateRange.to) {
                    formattedStartDate = dateRange.from.toISOString().split('T')[0];
                    formattedEndDate = dateRange.to.toISOString().split('T')[0];
                } else {
                    // Fallback to default dates if no selection
                    const today = new Date();
                    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
                    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
                    
                    formattedStartDate = startDate.toISOString().split('T')[0];
                    formattedEndDate = endDate.toISOString().split('T')[0];
                }
                
                // Use the API client's getSpecialDiscounts method
                const response = await api.getSpecialDiscounts({
                    tenantId: tenantId || '',
                    propertyId: room.propertyId,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate
                });
                
                if (response && response.data) {
                    setSpecialDiscounts(response.data);
                }
            } catch (error) {
                console.error("Error fetching special discounts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchSpecialDiscounts();
    }, [tenantId, room.propertyId, dateRange]);

    const handleSelectPackage = (packageTitle: string) => {
        console.log(`Selected package: ${packageTitle}`);
        
        // Call the onSelectRoom prop to advance the stepper
        if (onSelectRoom) {
            onSelectRoom();
        }
        
        // Close the modal if needed
        if (onClose) {
            onClose();
        }
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

    // Update the getDiscountedPackages function to use room price
    const getDiscountedPackages = () => {
        return specialDiscounts.map(discount => ({
            title: discount.title,
            description: discount.description,
            price: Math.round(standardPackage.price * (1 - discount.discount_percentage / 100))
        }));
    };

    const discountedPackages = getDiscountedPackages();

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
                        packageData={standardPackage}
                        onSelectPackage={() => handleSelectPackage(standardPackage.title)}
                    />

                    {discountedPackages.length > 0 && (
                        <>
                            <h2 className="text-xl font-bold mt-6">Deals & Packages</h2>
                            {isLoading ? (
                                <p className="text-gray-500 mt-2">Loading available deals...</p>
                            ) : (
                                discountedPackages.map((pkg, index) => (
                                    <PackageCard
                                        key={index}
                                        packageData={{
                                            title: pkg.title,
                                            description: pkg.description,
                                            price: pkg.price
                                        }}
                                        onSelectPackage={() => handleSelectPackage(pkg.title)}
                                    />
                                ))
                            )}
                        </>
                    )}
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

