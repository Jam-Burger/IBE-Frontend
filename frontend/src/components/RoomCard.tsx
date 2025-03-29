import {useState} from "react";
import {FaChevronLeft, FaChevronRight, FaStar} from "react-icons/fa";
import {IoLocationOutline} from "react-icons/io5";
import {GoPerson} from "react-icons/go";
import {MdOutlineBed} from "react-icons/md";
import {Room} from "../types/Room";

interface RoomCardProps {
    room: Room & {
        specialDeal?: {
            discount: number;
            minNights: number;
        };
        price?: number;
    };
}

const RoomCard = ({room}: RoomCardProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? room.images.length - 1 : prev - 1
        );
    };

    return (
        <div
            className={`w-[293px] bg-white rounded-lg shadow-md overflow-hidden ${
                room.specialDeal ? "h-[513px]" : "h-[450px]"
            }`}
        >
            {/* Image Carousel */}
            <div
                className="relative mb-2"
                style={{height: "145px", width: "293px"}}
            >
                <img
                    src={room.images[currentImageIndex]}
                    alt={`${room.roomTypeName}`}
                    className="w-full h-full object-cover"
                />

                {/* Carousel Navigation */}
                <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1"
                >
                    <FaChevronLeft className="text-gray-400"/>
                </button>
                <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                >
                    <FaChevronRight className="text-gray-400"/>
                </button>

                {/* Image Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                    {room.images.map((image, index) => (
                        <div
                            key={image}
                            className={`h-2 w-2 rounded-full ${
                                index === currentImageIndex
                                    ? "bg-white"
                                    : "bg-white/50"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Resort Details */}
            <div className="p-3">
                <div className="flex justify-between items-center mb-6 h">
                    <h2 className="font-bold text-base leading-[150%] w-[136.6px] h-[35px]">
                        {room.roomTypeName}
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
                        {room.singleBed !== 0 && `${room.singleBed} single `}
                        {room.doubleBed !== 0 && `${room.doubleBed} double `}
                        {"bed"}
                    </p>
                </div>

                {room.specialDeal && (
                    <>
                        <div className="relative mb-3">
                            <svg
                                width="121"
                                height="32"
                                viewBox="0 0 121 32"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="relative -ml-4"
                            >
                                <path
                                    d="M120.759 0H0V32H120.759L112.775 14.9677L120.759 0Z"
                                    fill="var(--primary)"
                                />
                            </svg>
                            <span
                                className="absolute top-0 left-1 text-white font-medium text-sm h-[32px] flex items-center">
                                Special deal
                            </span>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                            Save&nbsp;{room.specialDeal.discount ?? "N/A"}%
                            when you book&nbsp;{room.specialDeal.minNights ?? "N/A"}
                            &nbsp;nights
                        </div>
                    </>
                )}

                <div className="flex flex-col items-start mt-auto mb-2">
                    <div className="flex flex-col mb-2">
                        <span className="text-xl font-bold">
                            ${room.price ?? "N/A"}
                        </span>
                        <span className="text-sm text-gray-500">per night</span>
                    </div>
                    <button
                        className="w-[128px] h-[44px] bg-primary text-white rounded-lg flex items-center justify-center">
                        <span className="font-[600] text-sm leading-[140%] tracking-[2%]">
                            SELECT ROOM
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomCard;
