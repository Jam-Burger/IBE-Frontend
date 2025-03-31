import {useState} from "react";
import {FaStar} from "react-icons/fa";
import {IoLocationOutline} from "react-icons/io5";
import {GoPerson} from "react-icons/go";
import {MdOutlineBed} from "react-icons/md";
import {Room} from "../types";
import ImageCarousel from "./ui/ImageCarousel.tsx";
import RoomDetailsModalPopup from "./RoomDetailsModalPopup.tsx";
import {convertToLocaleCurrency, toTitleCase} from "../lib/utils.ts";
import {useAppSelector} from "../redux/hooks.ts";
import {Button} from "./ui/Button.tsx";

interface RoomCardProps {
    room: Room & {
        specialDeal?: {
            discount: number;
            minNights: number;
        };
    };
    onSelectRoom?: () => void;
    onSelectPackage?: () => void;
}

const RoomCard = ({room, onSelectRoom, onSelectPackage}: RoomCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {selectedCurrency, multiplier} = useAppSelector(
        (state) => state.currency
    );
    const handleRoomSelect = () => {
        if (onSelectRoom) {
            onSelectRoom();
        }
        setIsModalOpen(true);
    };

    const handlePackageSelect = () => {
        if (onSelectPackage) {
            onSelectPackage();
        }
        setIsModalOpen(false);
    };

    return (
        <>
            <div
                className={`w-[293px] bg-white rounded-lg shadow-md overflow-hidden ${
                    room.specialDeal ? "h-[513px]" : "h-[450px]"
                }`}
            >
                {/* Image Carousel */}
                <ImageCarousel
                    images={room.images}
                    height="145px"
                    width="293px"
                    arrowsStyle="transparent"
                    className="mb-2"
                    autoRotate={true}
                />

                {/* Resort Details */}
                <div className="p-3">
                    <div className="flex justify-between items-center mb-6 h">
                        <h2 className="font-bold text-base leading-[150%] w-[136.6px] h-[35px]">
                            {toTitleCase(room.roomTypeName)}
                        </h2>
                        <div className="flex flex-col items-end">
                            {room.numberOfReviews > 0 ? (
                                <>
                                    <div className="flex items-center">
                                        <FaStar className="w-[15.84px] h-4"/>
                                        <span className="ml-1">
                                            {room.rating.toFixed(1)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {room.numberOfReviews} reviews
                                    </span>
                                </>
                            ) : (
                                <div
                                    className="h-[23px] w-[99px] bg-[#CDCDEE]  text-xs font-medium px-2 py-1 rounded-lg flex items-center justify-center">
                                    <span
                                        className="h-[20px] w-[86px] font-normal  leading-[140%] tracking-[0px] flex items-center justify-center">
                                        New property
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                        <p className="flex items-center gap-1 text-gray-700 mb-2">
                            <IoLocationOutline/>
                            {room.landmark}
                        </p>
                        <p className="text-xs py-0.5 inline-block mb-2">
                            <i>inclusive</i> {room.areaInSquareFeet} sqft
                        </p>
                        <p className="flex items-center gap-1 text-gray-700 mb-2">
                            <GoPerson/>
                            1-{room.maxCapacity}
                        </p>
                        <p className="flex items-center gap-1 text-gray-700 mb-2">
                            <MdOutlineBed/>
                            {room.singleBed !== 0 &&
                                `${room.singleBed} single `}
                            {room.singleBed * room.doubleBed !== 0 && `or `}
                            {room.doubleBed !== 0 &&
                                `${room.doubleBed} double `}
                            {"bed"}
                        </p>
                    </div>

                    {room.specialDeal && (
                        <>
                            <div className="mb-2">
                                <div
                                    className="bg-primary text-white text-[14px] font-medium flex items-center justify-center w-[120.76px] h-[32px] clip-path -translate-x-[20px]">
                                    <span
                                        className="font-normal text-base w-[101.95px] h-[22px] flex justify-center items-center">
                                        Special deal
                                    </span>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                                Save&nbsp;{room.specialDeal.discount ?? "N/A"}%
                                when you book&nbsp;
                                {room.specialDeal.minNights ?? "N/A"}
                                &nbsp;nights
                            </div>
                        </>
                    )}

                    <div className="flex flex-col items-start mt-auto mb-2">
                        <div className="flex flex-col mb-2">
                            <span className="text-xl font-bold">
                                {convertToLocaleCurrency(
                                    selectedCurrency.symbol,
                                    room.averagePrice,
                                    multiplier,
                                    false
                                )}
                            </span>
                            <span className="text-sm text-gray-500">
                                per night
                            </span>
                        </div>
                        <Button
                            className="w-[128px] h-[44px] font-[600] text-sm leading-[140%] tracking-[2%]   "
                            onClick={handleRoomSelect}
                        >
                            SELECT ROOM
                        </Button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <RoomDetailsModalPopup
                    room={room}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSelectRoom={handlePackageSelect}
                />
            )}
        </>
    );
};

export default RoomCard;
