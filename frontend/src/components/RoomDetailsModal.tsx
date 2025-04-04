import PackageCard from "./PackageCard.tsx";
import {GoPerson} from "react-icons/go";
import {MdOutlineBed} from "react-icons/md";
import {FaRegCircleCheck} from "react-icons/fa6";
import ImageCarousel from "./ui/ImageCarousel";
import {Room} from "../types";
import {useEffect, useState} from "react";
import {api} from "../lib/api-client";
import {useParams} from "react-router-dom";
import {useAppSelector} from "../redux/hooks.ts";
import toast from 'react-hot-toast';
import {toTitleCase} from "../lib/utils.ts";

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

interface PromoOffer {
    title: string;
    description: string;
    discount_percentage: number;
    promo_code: string;
}

const RoomDetailsModal = ({room, onClose, onSelectRoom}: RoomDetailsModalProps) => {
    const [specialDiscounts, setSpecialDiscounts] = useState<SpecialDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const {tenantId} = useParams<{ tenantId: string }>();

    const [promoCode, setPromoCode] = useState("");
    const [promoOffer, setPromoOffer] = useState<PromoOffer | null>(null);
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);
    const [promoError, setPromoError] = useState("");
    const [appliedPromoCode, setAppliedPromoCode] = useState("");

    const dateRange = useAppSelector(state => state.roomFilters.filter.dateRange);
    const roomsListConfig = useAppSelector(state => state.config.roomsListConfig);
    
    // Check if various features are enabled based on existing config
    const showAmenities = roomsListConfig?.configData.filters.filterGroups.amenities.enabled;
    const amenitiesLabel = roomsListConfig?.configData.filters.filterGroups.amenities.label;
    const showRoomSize = roomsListConfig?.configData.filters.filterGroups.roomSize.enabled;
    const showBedTypes = roomsListConfig?.configData.filters.filterGroups.bedTypes.enabled;


    const standardPackage = {
        title: "Standard Rate",
        description: "Our standard room rate with all basic amenities included.",
        price: room.averagePrice,
    };

    useEffect(() => {
        const fetchSpecialDiscounts = async () => {
            if (!tenantId || !room.propertyId) return;

            setIsLoading(true);
            try {
                // Use selected date range from filters if available
                let formattedStartDate, formattedEndDate;

                if (dateRange && dateRange.from && dateRange.to) {
                    // Date strings are already in ISO format, just take the date part
                    formattedStartDate = dateRange.from.split('T')[0];
                    formattedEndDate = dateRange.to.split('T')[0];
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

                if (response?.data) {
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

    // Handle promo code validation
    const validatePromoCode = async () => {
        if (!promoCode.trim()) {
            toast.error("Please enter a promo code");
            setPromoError("Please enter a promo code");
            return;
        }

        if (!tenantId || !room.propertyId) {
            toast.error("Unable to validate promo code at this time");
            setPromoError("Unable to validate promo code at this time");
            return;
        }

        setIsValidatingPromo(true);
        setPromoError("");

        try {
            // Get date range for API call
            let formattedStartDate, formattedEndDate;

            if (dateRange && dateRange.from && dateRange.to) {
                formattedStartDate = dateRange.from.split('T')[0];
                formattedEndDate = dateRange.to.split('T')[0];
            } else {
                // Fallback to default dates if no selection
                const today = new Date();
                const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
                const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);

                formattedStartDate = startDate.toISOString().split('T')[0];
                formattedEndDate = endDate.toISOString().split('T')[0];
            }

            // Use the API client instead of fetch
            const response = await api.getPromoOffer({
                tenantId: tenantId,
                propertyId: room.propertyId,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                promoCode: promoCode
            });

            if (response?.data) {
                setPromoOffer(response.data);
                setPromoError("");
                // Store the applied promo code in the separate state
                setAppliedPromoCode(promoCode);
                // Clear the input field
                setPromoCode("");
                toast.success(`Promo code "${promoCode}" applied successfully!`);
            } else {
                setPromoError("Invalid promo code");
                setPromoOffer(null);
                toast.error(`Invalid promo code: "${promoCode}"`);
            }
        } catch (error) {
            console.error("Error validating promo code:", error);
            setPromoError("Failed to validate promo code");
            setPromoOffer(null);
            toast.error("Failed to validate promo code");
        } finally {
            setIsValidatingPromo(false);
        }
    };

    const handleSelectPackage = (packageTitle: string) => {
        if (packageTitle) {
            // Handle package selection logic here
        }

        if (onSelectRoom) {
            onSelectRoom();
        }

        if (onClose) {
            onClose();
        }
    };

    const guestText = `1-${room.maxCapacity} Guests`;

    const bedText = room.singleBed > 0 && room.doubleBed > 0
        ? `${room.singleBed} Single & ${room.doubleBed} Double`
        : room.singleBed > 0
            ? `${room.singleBed} Single Bed${room.singleBed > 1 ? 's' : ''}`
            : `${room.doubleBed} Double Bed${room.doubleBed > 1 ? 's' : ''}`;

    // Format room size
    const roomSize = `${room.areaInSquareFeet} sqft`;

    const getDiscountedPackages = () => {
        return specialDiscounts.map(discount => ({
            title: discount.title,
            description: discount.description,
            price: Math.round(standardPackage.price * (1 - discount.discount_percentage / 100))
        }));
    };

    const getPromoPackage = () => {
        if (!promoOffer) return null;

        return {
            title: promoOffer.title,
            description: promoOffer.description,
            price: Math.round(standardPackage.price * (1 - promoOffer.discount_percentage / 100))
        };
    };

    const promoPackage = getPromoPackage();
    const discountedPackages = getDiscountedPackages();

    // Add a function to remove the promo offer with toast notification
    const removePromoOffer = () => {
        const code = appliedPromoCode;
        setPromoOffer(null);
        setPromoCode("");
        setAppliedPromoCode("");
        setPromoError("");
        toast.success(`Promo code "${code}" removed`);
    };

    return (
        <div className="w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden relative">
            {/* Header Section with Image Carousel */}
            <ImageCarousel
                images={room.images}
                height="250px"
                width="100%"
                showTitle={true}
                title={toTitleCase(room.roomTypeName)}
                arrowsStyle="large"
                showDots={true}
                autoRotate={true}
                className="md:h-[320px] lg:h-[381px]"
            />

            {/* Room Details */}
            <div className="p-4 md:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start text-sm">
                    <div className="w-full lg:w-auto mb-6 lg:mb-0">
                        <div className="flex flex-wrap gap-3 text-gray-600 text-sm md:text-base">
                            <span className="flex items-center gap-2"><GoPerson/>{guestText}</span>
                            {showBedTypes && (
                                <span className="flex items-center gap-2"><MdOutlineBed/>{bedText}</span>
                            )}
                            {showRoomSize && (
                                <span>{roomSize}</span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-black-700 text-sm md:text-base leading-relaxed w-full md:max-w-[480px] lg:max-w-[590px] mt-4 font-normal">
                            {room.description}
                        </p>
                    </div>

                    {/* Amenities section */}
                    {showAmenities && (
                        <div className="w-full lg:w-auto mt-4 lg:mt-0">
                            <h2 className="text-base md:text-lg font-medium text-black mb-2">
                                {amenitiesLabel}
                            </h2>

                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                {room.amenities.map((amenity, index) => (
                                    <span key={index}
                                          className="flex justify-start items-center gap-2 font-normal text-sm md:text-base text-[#2F2F2F]">
                                        <FaRegCircleCheck className="text-primary flex-shrink-0"/> {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pricing & Packages */}
                <div className="mt-6 md:mt-8">
                    <h2 className="text-lg md:text-xl font-bold">Standard Rate</h2>
                    <PackageCard
                        packageData={standardPackage}
                        onSelectPackage={() => handleSelectPackage(standardPackage.title)}
                    />

                    {/* Promo Package if available */}
                    {promoPackage && (
                        <>
                            <h2 className="text-lg md:text-xl font-bold mt-6">Promo Offer</h2>
                            <PackageCard
                                packageData={promoPackage}
                                onSelectPackage={() => handleSelectPackage(promoPackage.title)}
                                onRemove={removePromoOffer}
                                promoCode={appliedPromoCode}
                            />
                        </>
                    )}

                    {/* Regular Deals & Packages */}
                    {discountedPackages.length > 0 && (
                        <>
                            <h2 className="text-lg md:text-xl font-bold mt-6">Deals & Packages</h2>
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

                    {/* Promo Code Input */}
                    <div className="mt-6">
                        <label className="text-gray-700 text-sm block mb-2">Enter a promo code</label>
                        <div className="flex flex-row gap-2 justify-self-start">
                            <input
                                type="text"
                                className={`border ${promoError ? 'border-red-500' : 'border-gray-400'} p-2 rounded text-sm w-[200px]`}
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                placeholder="Enter promo code"
                                disabled={promoOffer !== null}
                            />
                            <button
                                className="flex justify-center items-center bg-primary text-white px-4 py-2 rounded text-sm h-[48px] disabled:opacity-50 disabled:cursor-not-allowed w-[65px]"
                                onClick={validatePromoCode}
                                disabled={isValidatingPromo || promoOffer !== null}
                            >
                                <span>
                                    {isValidatingPromo ? "..." : "APPLY"}
                                </span>
                            </button>
                        </div>
                        {promoError && (
                            <p className="text-red-500 text-xs mt-1">{promoError}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetailsModal;

