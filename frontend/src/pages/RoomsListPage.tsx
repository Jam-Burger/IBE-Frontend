import {cn} from "../lib/utils";
import {FaCheck} from "react-icons/fa";
import {useEffect, useState} from "react";
import {RoomCard, RoomFilters} from "../components";
import {Room} from "../types";
import {api} from "../lib/api-client";
import {SortOption} from "../redux/filterSlice";
import {useParams} from "react-router-dom";
import {useAppSelector} from "../redux/hooks.ts";

const RoomsListPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const {tenantId} = useParams<{ tenantId: string }>();
    const filters = useAppSelector(state => state.roomFilters);

    useEffect(() => {
        const fetchRooms = async () => {
            if (filters.propertyId && tenantId) {
                try {
                    const response = await api.getRooms(
                        tenantId,
                        filters.propertyId
                    );
                    setRooms(response.data);
                } catch (error) {
                    console.error("Error fetching rooms:", error);
                }
            }
        };

        fetchRooms();
    }, [filters.propertyId, tenantId]);

    useEffect(() => {
        let result = [...rooms];

        if (filters.bedTypes.singleBed || filters.bedTypes.doubleBed) {
            result = result.filter(
                (room) =>
                    (filters.bedTypes.singleBed && room.singleBed > 0) ||
                    (filters.bedTypes.doubleBed && room.doubleBed > 0)
            );
        }

        if (filters.amenities.length > 0) {
            result = result.filter((room) =>
                filters.amenities.every((amenity) =>
                    room.amenities.includes(amenity)
                )
            );
        }

        if (filters.ratings.length > 0) {
            result = result.filter((room) => {
                const rating = room.rating;
                return filters.ratings.some((ratingFilter) => {
                    if (ratingFilter === "five-star") return rating >= 5;
                    if (ratingFilter === "four-star")
                        return rating >= 4 && rating < 5;
                    if (ratingFilter === "three-star")
                        return rating >= 3 && rating < 4;
                    if (ratingFilter === "less-than-three") return rating < 3;
                    return false;
                });
            });
        }

        if (filters.roomSize[0] > 0 || filters.roomSize[1] < 2000) {
            result = result.filter(
                (room) =>
                    room.areaInSquareFeet >= filters.roomSize[0] &&
                    room.areaInSquareFeet <= filters.roomSize[1]
            );
        }

        if (filters.capacity !== null) {
            result = result.filter(
                (room) => room.maxCapacity >= filters.capacity!
            );
        }

        switch (filters.sortBy) {
            case SortOption.PRICE_LOW_TO_HIGH:
                result.sort(() => 0);
                break;
            case SortOption.PRICE_HIGH_TO_LOW:
                result.sort(() => 0);
                break;
            case SortOption.RATING_HIGH_TO_LOW:
                result.sort((a, b) => b.rating - a.rating);
                break;
            case SortOption.CAPACITY_HIGH_TO_LOW:
                result.sort((a, b) => b.maxCapacity - a.maxCapacity);
                break;
            case SortOption.ROOM_SIZE_LARGE_TO_SMALL:
                result.sort((a, b) => b.areaInSquareFeet - a.areaInSquareFeet);
                break;
            default:
                break;
        }

        setFilteredRooms(result);
    }, [rooms, filters]);

    const steps = [
        {id: 0, label: "Choose room", completed: currentStep > 0},
        {id: 1, label: "Choose add on", completed: currentStep > 1},
        {id: 2, label: "Checkout", completed: currentStep > 2},
    ];

    const handleStepClick = (stepId: number) => {
        if (stepId <= currentStep || stepId === currentStep + 1) {
            setCurrentStep(stepId);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="w-full bg-[#858685] h-48 flex-shrink-0"/>
            <div className="flex items-center justify-center h-[92px] flex-shrink-0">
                <div className="w-[417px] relative">
                    <div className="flex items-center justify-between relative">
                        <div
                            className="absolute top-[14px] h-[2px] bg-gray-300"
                            style={{
                                left: "32px",
                                right: "32px",
                                zIndex: -1,
                            }}
                        ></div>

                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center z-10"
                            >
                                <button
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm cursor-pointer",
                                        index === currentStep
                                            ? "bg-red-500"
                                            : step.completed ||
                                            index < currentStep
                                                ? "bg-primary"
                                                : "bg-gray-300"
                                    )}
                                    onClick={() => handleStepClick(index)}
                                >
                                    {step.completed || index < currentStep ? (
                                        <FaCheck size={16}/>
                                    ) : (
                                        index + 1
                                    )}
                                </button>

                                <span
                                    className={cn(
                                        "text-xs mt-1",
                                        index === currentStep
                                            ? "text-primary font-medium"
                                            : "text-gray-500"
                                    )}
                                >
                                    {index + 1}. {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-[293px] sticky top-[100px] self-start">
                        <RoomFilters/>
                    </div>

                    <div className="flex-1 md:ml-16 mt-10 md:mt-10 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 mr-10">
                            <h2 className="text-xl font-bold">
                                Room Results
                            </h2>
                            <div className="flex items-center text-sm">
                                <span className="mr-6">
                                    Showing {filteredRooms.length} of{" "}
                                    {rooms.length} Results
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map((room) => (
                                    <RoomCard
                                        key={room.roomTypeId}
                                        room={room}
                                    />
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-10">
                                    <p className="text-gray-500">
                                        No rooms match your current filters
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomsListPage;
