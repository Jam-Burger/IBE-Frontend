import PackageCard from "./PackageCard.tsx";
import {GoPerson} from "react-icons/go";
import {MdOutlineBed} from "react-icons/md";
import {FaRegCircleCheck} from "react-icons/fa6";
import ImageCarousel from "./ui/ImageCarousel";
import {PackageData, PromoOffer, Room, SpecialDiscount, StandardPackage,} from "../types";
import {useEffect, useState} from "react";
import {api} from "../lib/api-client";
import {useNavigate, useParams} from "react-router-dom";
import {useAppSelector} from "../redux/hooks.ts";
import toast from "react-hot-toast";
import {computeDiscountedPrice, formatDateToYYYYMMDD, toTitleCase} from "../lib/utils.ts";
import {setPromotionApplied, setRoom} from "../redux/checkoutSlice";
import {useAppDispatch} from "../redux/hooks";
import {setCurrentStep} from "../redux/stepperSlice.ts";

interface RoomDetailsModalProps {
    room: Room;
}


const RoomDetailsModal = ({
                              room,
                          }: RoomDetailsModalProps) => {
    const [specialDiscounts, setSpecialDiscounts] = useState<SpecialDiscount[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(false);
    const {tenantId} = useParams<{ tenantId: string }>();

    const [promoCode, setPromoCode] = useState("");
    const [promoOffer, setPromoOffer] = useState<PromoOffer | null>(null);
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);
    const [promoError, setPromoError] = useState("");
    const [appliedPromoCode, setAppliedPromoCode] = useState("");

    const dateRange = useAppSelector(
        (state) => state.roomFilters.filter.dateRange
    );
    const roomsListConfig = useAppSelector(
        (state) => state.config.roomsListConfig
    );

    // Check if various features are enabled based on existing config
    const showAmenities =
        roomsListConfig?.configData.filters.filterGroups.amenities.enabled;
    const amenitiesLabel =
        roomsListConfig?.configData.filters.filterGroups.amenities.label;
    const showRoomSize =
        roomsListConfig?.configData.filters.filterGroups.roomSize.enabled;
    const showBedTypes =
        roomsListConfig?.configData.filters.filterGroups.bedTypes.enabled;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const standardPackage: StandardPackage = {
        title: "Standard Rate",
        description:
            "Our standard room rate with all basic amenities included.",
        price:
            room.roomRates.reduce(
                (sum: number, rate: any) => sum + rate.price,
                0
            ) / room.roomRates.length,
    };

    useEffect(() => {
        const fetchSpecialDiscounts = async () => {
            if (!tenantId || !room.propertyId) return;

            setIsLoading(true);
            try {
                // Use selected date range from filters if available
                let formattedStartDate, formattedEndDate;

                if (dateRange && dateRange.from && dateRange.to) {
                    formattedStartDate = dateRange.from;
                    formattedEndDate = dateRange.to;
                } else {
                    // Fallback to default dates if no selection
                    const today = new Date();
                    const startDate = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate() + 1
                    );
                    const endDate = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate() + 5
                    );

                    formattedStartDate = formatDateToYYYYMMDD(startDate);
                    formattedEndDate = formatDateToYYYYMMDD(endDate);
                }

                // Use the API client's getSpecialDiscounts method
                const response = await api.getSpecialDiscounts({
                    tenantId: tenantId || "",
                    propertyId: room.propertyId,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
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
            if (!dateRange?.from || !dateRange?.to) {
                toast.error("Please select a date range");
                setPromoError("Please select a date range");
                return;
            }

            // Use the API client instead of fetch
            const response = await api.getPromoOffer({
                tenantId: tenantId,
                propertyId: room.propertyId,
                startDate: dateRange?.from,
                endDate: dateRange?.to,
                promoCode: promoCode,
            });

            if (response?.data) {
                setPromoOffer(response.data);
                setPromoError("");
                setAppliedPromoCode(promoCode);
                setPromoCode("");
                toast.success(
                    `Promo code "${promoCode}" applied successfully!`
                );
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

    const handleSelectPackage = (
        packageData: SpecialDiscount | PromoOffer | StandardPackage
    ) => {
        navigate(`/${tenantId}/checkout`);
        dispatch(setCurrentStep(2));
        dispatch(setPromotionApplied(packageData));
        dispatch(setRoom(room));
    };

    const guestText = `1-${room.maxCapacity} Guests`;

    const bedText =
        room.singleBed > 0 && room.doubleBed > 0
            ? `${room.singleBed} Single & ${room.doubleBed} Double`
            : room.singleBed > 0
                ? `${room.singleBed} Single Bed${room.singleBed > 1 ? "s" : ""}`
                : `${room.doubleBed} Double Bed${room.doubleBed > 1 ? "s" : ""}`;

    // Format room size
    const roomSize = `${room.areaInSquareFeet} sqft`;

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
                            <span className="flex items-center gap-2">
                                <GoPerson/>
                                {guestText}
                            </span>
                            {showBedTypes && (
                                <span className="flex items-center gap-2">
                                    <MdOutlineBed/>
                                    {bedText}
                                </span>
                            )}
                            {showRoomSize && <span>{roomSize}</span>}
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
                                    <span
                                        key={index}
                                        className="flex justify-start items-center gap-2 font-normal text-sm md:text-base text-[#2F2F2F]"
                                    >
                                        <FaRegCircleCheck className="text-primary flex-shrink-0"/>{" "}
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pricing & Packages */}
                <div className="mt-6 md:mt-8">
                    <h2 className="text-lg md:text-xl font-bold">
                        Standard Rate
                    </h2>
                    <PackageCard
                        packageData={standardPackage}
                        onSelectPackage={() =>
                            handleSelectPackage(standardPackage)
                        }
                    />

                    {/* Promo Package if available */}
                    {promoOffer && (
                        <>
                            <h2 className="text-lg md:text-xl font-bold mt-6">
                                Promo Offer
                            </h2>
                            <PackageCard
                                packageData={{
                                    title: promoOffer.title,
                                    description: promoOffer.description,
                                    price: computeDiscountedPrice(promoOffer, room.roomRates),
                                }}
                                onSelectPackage={() =>
                                    handleSelectPackage(promoOffer)
                                }
                                onRemove={removePromoOffer}
                                promoCode={appliedPromoCode}
                            />
                        </>
                    )}

                    {/* Regular Deals & Packages */}
                    {specialDiscounts.length > 0 && (
                        <>
                            <h2 className="text-lg md:text-xl font-bold mt-6">
                                Deals & Packages
                            </h2>
                            {isLoading ? (
                                <p className="text-gray-500 mt-2">
                                    Loading available deals...
                                </p>
                            ) : (
                                specialDiscounts.map((pkg, index) => {
                                    const packageData: PackageData = {
                                        title: pkg.title,
                                        description: pkg.description,
                                        price: computeDiscountedPrice(
                                            pkg,
                                            room.roomRates
                                        ),
                                    };
                                    return (
                                        <PackageCard
                                            key={index}
                                            packageData={packageData}
                                            onSelectPackage={() =>
                                                handleSelectPackage(pkg)
                                            }
                                        />
                                    );
                                })
                            )}
                        </>
                    )}

                    {/* Promo Code Input */}
                    <div className="mt-6">
                        <label className="text-gray-700 text-sm block mb-2">
                            Enter a promo code
                        </label>
                        <div className="flex flex-row gap-2 justify-self-start">
                            <input
                                type="text"
                                className={`border ${
                                    promoError
                                        ? "border-red-500"
                                        : "border-gray-400"
                                } p-2 rounded text-sm w-[200px]`}
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                placeholder="Enter promo code"
                                disabled={promoOffer !== null}
                            />
                            <button
                                className="flex justify-center items-center bg-primary text-white px-4 py-2 rounded text-sm h-[48px] disabled:opacity-50 disabled:cursor-not-allowed min-w-[65px]"
                                onClick={validatePromoCode}
                                disabled={
                                    isValidatingPromo || promoOffer !== null
                                }
                            >
                                <span>
                                    {isValidatingPromo ? "..." : "APPLY"}
                                </span>
                            </button>
                        </div>
                        {promoError && (
                            <p className="text-red-500 text-xs mt-1">
                                {promoError}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetailsModal;
