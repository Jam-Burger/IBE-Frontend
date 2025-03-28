import { useState } from 'react';
import { FaStar,FaChevronLeft,FaChevronRight } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { GoPerson } from "react-icons/go";
import { MdOutlineBed } from "react-icons/md";

const ResortCard = () => {
    // Resort data embedded directly in the component
    const resortData = {
        "name": "Long Beautiful Resort Name",
        "rating": 3.5,
        "reviews": 0,
        "location": "Near city center",
        "distance": "301 ft",
        "type": "Inclusive",
        "roomType": "1-2 • Queen or 2 doubles",
        "price": 132,
        "specialDeal": {
            "discount": 10,
            "minNights": 2
        },
        "images": [
            "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtnvAOajH9gS4C30cRF7rD_voaTAKly2Ntaw&s"
        ]
    };

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            (prev + 1) % resortData.images.length
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? resortData.images.length - 1 : prev - 1
        );
    };

    return (

        <div className={`w-[293px] bg-white rounded-lg shadow-md overflow-hidden ${resortData.specialDeal ? 'h-[513px]' : 'h-[450px]'}`}>

            {/* Image Carousel */}
            <div className="relative mb-2" style={{ height: '145px', width: '293px' }}>
                <img
                    src={resortData.images[currentImageIndex]}
                    alt={`${resortData.name} view`}
                    className="w-full h-full object-cover"
                />

                {/* Carousel Navigation */}
                <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1"
                >
                    
                    <FaChevronLeft  className="text-gray-400" />
                </button>
                <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                >
                    <FaChevronRight  className="text-gray-400" />
                </button>

                {/* Image Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                    {resortData.images.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 w-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Resort Details */}
            <div className="p-3" >
                <div className="flex justify-between items-center mb-6 h">
                    <h2 className="font-bold text-base leading-[150%] w-[136.6px] h-[35px]">
                        {resortData.name}
                    </h2>
                    <div className="flex flex-col items-end">
                        {resortData.reviews > 0 ? (
                            <>
                                <div className="flex items-center">
                                    <FaStar className="w-[15.84px] h-4" />
                                    <span className="ml-1">{resortData.rating}</span>
                                </div>
                                <span className="text-xs text-gray-500">{resortData.reviews} reviews</span>
                            </>
                        ) : (
                            <div className="h-[23px] w-[99px] bg-[#CDCDEE]  text-xs font-medium px-2 py-1 rounded-lg flex items-center justify-center">
                                <span className='h-[20px] w-[86px] font-normal  leading-[140%] tracking-[0px] flex items-center justify-center'>New property</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                    <p className="flex items-center gap-1 text-gray-700 mb-2"><IoLocationOutline />{resortData.location}</p>
                    <p className="text-xs py-0.5 inline-block mb-2">
                       <i>{resortData.type}</i> {resortData.distance}
                    </p>
                    <p className="flex items-center gap-1 text-gray-700 mb-2"><GoPerson />1-2</p>
                    <p className="flex items-center gap-1 text-gray-700 mb-2"><MdOutlineBed />Queen or 2 doubles</p>
                </div>

                {resortData.specialDeal && (
                    <>
                        <div className="mb-2">
                            <div className="bg-primary text-white text-[14px] font-medium flex items-center justify-center w-[120.76px] h-[32px] clip-path -translate-x-[20px]">
                                <span className='font-normal text-base w-[101.95px] h-[22px] flex justify-center items-center'>
                                    Special deal
                                </span>

                            </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                            Save {resortData.specialDeal.discount}% when you book {resortData.specialDeal.minNights}+ nights
                        </div>
                    </>
                )}

                <div className="flex flex-col items-start mt-auto mb-2">
                    <div className="flex flex-col mb-2">
                        <span className="text-xl font-bold">${resortData.price}</span>
                        <span className="text-sm text-gray-500">per night</span>
                    </div>
                    <button
                        className="w-[128px] h-[44px] bg-primary text-white rounded-lg flex items-center justify-center"
                    >
                       <span className="font-bold text-[14px] leading-[140%] tracking-[2%] w-[99px] h-[20px] ">SELECT ROOM</span>
                    </button>
                </div>
            </div>
        </div>

    );
};

export default ResortCard;
