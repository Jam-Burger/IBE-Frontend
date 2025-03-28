import { useState } from "react";
import HotelPackageCard from "./HotelPackageCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GoPerson } from "react-icons/go";
import { MdOutlineBed } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";

// Add font import if not already in your project
// This can also be added to your global CSS or index.html
// import '@fontsource/lato';

const roomData = {
    room: {
        title: "Executive Room",
        images: [
            "https://content.r9cdn.net/rimg/himg/74/78/b8/leonardo-1124401-Deluxe_Room_King_Size_Bed_O-698642.jpg",
            "./banner.avif"
        ],
        guests: "1-2 Guests",
        bedType: "Queen or 2 Doubles",
        size: "301 ft²",
        description:
            "Smoke free and decorated in contemporary jewel and earth tones, the 15-story Casino Tower rooms are located directly above the casino. The 364 sq.ft. Casino Tower rooms are appointed with classic furnishings and include pillow-top mattresses, 40-inch flat panel plasma TV and Wi-Fi internet access.",
        amenities: [
            "Wireless Internet Access",
            "Cable & Pay TV Channels",
            "Alarm Clock",
            "Hair Dryer",
            "In-Room Safe",
            "Iron and Ironing Board",
            "Writing Desk and Chair",
        ],
    },
    packages: [
        {
            title: "Standard Rate",
            description: "Spend $10 every night you stay and earn $150 in dining credit at the resort.",
            price: 132,
        },
        {
            title: "150 Dining  ",
            description: "Spend $10 every night you stay and earn $150 in dining credit at the resort.",
            price: 110,
        },
        {
            title: "Kids eat free",
            description: "Spend $10 every night you stay and earn $150 in dining credit at the resort.",
            price: 105,
        },
    ],
};

const ExecutiveRoom = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % roomData.room.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? roomData.room.images.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="w-full max-w-[1286px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden" style={{ fontFamily: 'Lato, sans-serif' }}>
            {/* Header Section with Image Carousel */}
            <div
                className="relative w-full h-[381px] bg-cover bg-center"
                style={{
                    backgroundImage: `url(${roomData.room.images[currentImageIndex]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0  flex items-end px-20 py-6">
                    <h1 className="text-white text-4xl font-medium">{roomData.room.title}</h1>
                </div>

                {/* Carousel Controls */}
                <button
                    onClick={prevImage}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800/50  text-white text-xl  px-6 py-5"
                >
                    <FaChevronLeft />
                </button>
                <button
                    onClick={nextImage}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-900/50 transparent text-white text-xl px-6 py-5"
                >
                    <FaChevronRight />
                </button>
            </div>

            {/* Room Details */}
            <div className="p-8">
                <div className="flex justify-between items-start text-sm">
                    <div>
                        <div className="flex gap-4 text-gray-600">
                            <span className="flex justify-between items-center gap-2"><GoPerson />{roomData.room.guests}</span> <span className="flex justify-between items-center gap-2"><MdOutlineBed />{roomData.room.bedType}</span>  <span>{roomData.room.size}</span>
                        </div>

                        {/* Description moved up directly under the guest info */}
                        <p className="text-black-700 text-[16px] leading-relaxed w-[590px] h-[98px] mt-4 font-normal">
                            {roomData.room.description}
                        </p>
                    </div>

                    {/* Amenities section - unchanged */}
                    <div>
                        <h2 className="font-bold w-[129px] h-[23px] text-[16px] leading-[140%] font-normal text-black">
                            Amenities
                        </h2>

                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            {roomData.room.amenities.map((amenity, index) => (
                                <span key={index} className="flex justify-start items-center gap-2 font-normal text-[16px] text-[#2F2F2F]"><FaRegCircleCheck /> {amenity}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing & Packages */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold">Standard Rate</h2>
                    <HotelPackageCard packageData={roomData.packages[0]} />

                    <h2 className="text-xl font-bold mt-6">Deals & Packages</h2>
                    {roomData.packages.slice(1).map((pkg, index) => (
                        <HotelPackageCard key={index} packageData={pkg} />
                    ))}
                </div>

                {/* Promo Code Input */}
                <div className="mt-6">
                    <label className="text-gray-700 text-sm block mb-2">Enter a promo code</label>
                    <div className="flex gap-2">
                    <input type="text" className="border border-gray-400 p-2 rounded w-64 text-sm" />
                        <button className="flex justify-center items-center bg-primary text-white px-4 py-2 rounded text-sm w-[65px] h-[48px]"><span className="h-[20px] w-[44px]">APPLY</span></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveRoom;
