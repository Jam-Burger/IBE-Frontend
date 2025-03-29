import { cn } from "../lib/utils";
import { FaCheck } from "react-icons/fa";
import { useEffect, useState } from "react";
import { RoomCard, RoomFilters } from "../components";
import { Room } from "../types";
import { api } from "../lib/api-client";
import { SortOption } from "../redux/filterSlice";
import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../redux/hooks.ts";
import {
    GuestSelector,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    // SelectValue,
    Label,
    DatePickerWithRange,
    Button
} from "../components/ui";

import { setRoomCount } from "../redux/filterSlice.ts";

const RoomsListPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const { tenantId } = useParams<{ tenantId: string }>();
    const filters = useAppSelector(state => state.roomFilters);
    const dispatch = useAppDispatch();
    const searchForm = useAppSelector(state => state.config.landingConfig?.configData.searchForm);
    
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
        { id: 0, label: "Choose room", completed: currentStep > 0 },
        { id: 1, label: "Choose add on", completed: currentStep > 1 },
        { id: 2, label: "Checkout", completed: currentStep > 2 },
    ];

    const handleStepClick = (stepId: number) => {
        if (stepId <= currentStep || stepId === currentStep + 1) {
            setCurrentStep(stepId);
        }
    };

    const handleBedTypeChange = (value: string) => {
        const isSingleBed = value === 'single';
        const isDoubleBed = value === 'double';
        const isBoth = value === 'both';
        console.log(isDoubleBed, isSingleBed, isBoth);
        // dispatch(updateBedFilter({
        //     singleBed: isSingleBed || isBoth,
        //     doubleBed: isDoubleBed || isBoth
        // }));
    };

    const getCurrentBedValue = () => {
        if (filters.bedTypes.singleBed && filters.bedTypes.doubleBed) return 'both';
        if (filters.bedTypes.singleBed) return 'single';
        if (filters.bedTypes.doubleBed) return 'double';
        return 'any';
    };

    const handleRoomCountChange = (value: string) => {
        dispatch(setRoomCount(parseInt(value, 10)));
    };

    const handleSearch = () => {
        // Implement search functionality
        console.log("Searching with filters:", filters);
        // You could trigger a refetch of rooms or apply additional filters here
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="w-full bg-[#858685] h-48 flex-shrink-0" />
            <div className="h-[92px] flex-shrink-0 bg-[#E4E4E4] flex items-center justify-center">
            <div className="flex items-center justify-center h-[92px] flex-shrink-0">
          <div className="w-[417px] relative">
            <div className="flex items-center justify-between relative">
              {/* Line between step 1 and 2 */}
              <div 
                className={`absolute top-[14px] h-[2px] left-[32px] right-[50%] z-[1] ${currentStep > 0 ? "bg-[#26266D]" : "bg-[#C1C2C2]"}`}
              ></div>
              
              {/* Line between step 2 and 3 */}
              <div 
                className={`absolute top-[14px] h-[2px] left-[50%] right-[32px] z-[1] ${currentStep > 1 ? "bg-[#26266D]" : "bg-[#C1C2C2]"}`}
              ></div>

              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center z-10">
                  <button
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm cursor-pointer",
                      index === currentStep
                        ? "bg-[#D0182B]"
                        : step.completed || index < currentStep
                        ? "bg-[#26266D]"
                        : "bg-gray-300"
                    )}
                    onClick={() => handleStepClick(index)}
                  >
                    {step.completed || index < currentStep ? (
                      <FaCheck size={16} />
                    ) : index === currentStep ? (
                      <FaCheck size={16} />
                    ) : (
                      ""
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
            </div>

            {searchForm && (
                <div className="container mx-auto mt-4 mb-4">
                    <div className="flex justify-center items-end gap-4">
                        {searchForm.guestOptions.enabled && (
                            <div>
                                <GuestSelector
                                    roomCount={filters.roomCount}
                                    showDetailedSummary={true}
                                    width="264px" height="68px" />
                            </div>
                        )}

                        {searchForm.roomOptions.enabled && (
                            <div>
                                <Select value={filters.roomCount.toString()} onValueChange={handleRoomCountChange}>
                                    <SelectTrigger id="rooms" className="w-full text-gray-500 min-h-[68px] min-w-[132px]">
                                        <div className="flex flex-col items-start">
                                            <Label htmlFor="rooms" className="mb-1 block text-sm font-medium text-gray-700">Rooms</Label>
                                            <span className="text-lg font-medium text-gray-900">{filters.roomCount}</span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        {[...Array(searchForm.roomOptions.max)].map((_, i) => (
                                            <SelectItem key={i} value={String(i + 1)}>
                                                {i + 1}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>


                            <Select value={getCurrentBedValue()} onValueChange={handleBedTypeChange}>
                                <SelectTrigger id="beds" className="w-full text-gray-500 min-h-[68px] min-w-[132px]">
                                    <Label htmlFor="beds" className="mb-1 block">Beds</Label>
                                    {/* <SelectValue placeholder="Any Bed"/> */}
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="any">Any Bed</SelectItem>
                                    <SelectItem value="single">Single Bed</SelectItem>
                                    <SelectItem value="double">Double Bed</SelectItem>
                                    <SelectItem value="both">Both Beds</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>

                        <div>

                            <div style={{ width: '510px' }}>
                                <DatePickerWithRange
                                    propertyId={filters.propertyId}
                                    disabled={false}
                                    className="h-[68px]"
                                    grayBorder={true}
                                    displayStyle="checkInOut"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleSearch}
                            className="bg-primary text-white px-6"
                            style={{ width: '168px', height: '66px' }}
                        >
                            SEARCH DATES
                        </Button>
                    </div>
                </div>
            )}

            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-[293px] sticky top-[100px] self-start">
                        <RoomFilters />
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
