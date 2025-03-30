import {cn} from "../lib/utils";
import {FaCheck} from "react-icons/fa";
import {useEffect, useState} from "react";
import {RoomCard, RoomFilters} from "../components";
import {ConfigType, Room, SortOption, StateStatus} from "../types";
import {api} from "../lib/api-client";
import {useParams, useSearchParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {fetchConfig} from "../redux/configSlice";
import {PulseLoader} from "react-spinners";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/DropdownMenu.tsx";
import {syncWithUrl, updateFilter} from "../redux/filterSlice.ts";
import {filterToSearchParams} from "../lib/url-params.ts";

const RoomsListPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [rooms, setRooms] = useState<Room[]>([]);
    const {tenantId} = useParams<{ tenantId: string }>();
    const dispatch = useAppDispatch();
    const {roomsListConfig, status} = useAppSelector((state) => state.config);
    const isLoading = status === StateStatus.LOADING || !roomsListConfig;
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = useAppSelector((state) => state.roomFilters.filter);

    useEffect(() => {
        dispatch(syncWithUrl(searchParams));
    }, [dispatch, searchParams]);

    useEffect(() => {
        if (filter && !isLoading) {
            const params = filterToSearchParams(filter);
            setSearchParams(params);
        }
    }, [filter, setSearchParams, isLoading]);

    useEffect(() => {
        if (!tenantId) {
            console.error("Tenant ID is not available");
            return;
        }
        dispatch(fetchConfig({tenantId, configType: ConfigType.ROOMS_LIST}));
    }, [tenantId, dispatch]);

    useEffect(() => {
        const fetchRooms = async () => {
            if (filter.propertyId && tenantId && !isLoading) {
                try {
                    const response = await api.getRooms(
                        tenantId,
                        Array.from(searchParams.entries())
                    );
                    setRooms(response.data);
                } catch (error) {
                    console.error("Error fetching rooms:", error);
                }
            }
        };

        fetchRooms();
    }, [filter, tenantId, isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <PulseLoader color="var(--primary-color)" size={15}/>
                <p className="mt-4 text-gray-600">
                    Loading application configuration...
                </p>
            </div>
        );
    }
    const stepsConfig = roomsListConfig.configData.steps;
    const configuredSteps = stepsConfig.labels.map((label, index) => ({
        id: index,
        label,
        completed: currentStep > index,
    }));

    const handleStepClick = (stepId: number) => {
        if (stepId <= currentStep || stepId === currentStep + 1) {
            setCurrentStep(stepId);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <PulseLoader color="var(--primary-color)" size={15}/>
                <p className="mt-4 text-gray-600">
                    Loading application configuration...
                </p>
            </div>
        );
    }

    const bannerConfig = roomsListConfig?.configData.banner;
    const bannerStyle = {
        backgroundImage:
            bannerConfig?.enabled && bannerConfig.imageUrl
                ? `url(${bannerConfig.imageUrl})`
                : undefined,
    };

    const handleSortChange = (sortOption: SortOption) => {
        dispatch(updateFilter({sortBy: sortOption}));
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Fixed banner */}
            <div
                className="w-full bg-[#858685] h-48 flex-shrink-0"
                style={bannerStyle}
            />

            {/* Fixed steps navigation */}
            <div className="flex items-center justify-center h-[92px] flex-shrink-0 bg-white z-10">
                <div className="w-[417px] relative">
                    <div className="flex items-center justify-between">
                        {stepsConfig.enabled &&
                            configuredSteps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center relative w-[130px]"
                                >
                                    {index > 0 && (
                                        <div
                                            className={cn(
                                                "absolute top-[14px] w-[130px] right-[70px] h-[2px] bg-gray-300 -z-10",
                                                index <= currentStep
                                                    ? "bg-primary"
                                                    : "bg-gray-300"
                                            )}
                                        ></div>
                                    )}
                                    <div className="flex flex-col items-center z-10">
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
                                            onClick={() =>
                                                handleStepClick(index)
                                            }
                                        >
                                            {step.completed ||
                                            index < currentStep ? (
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
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Scrollable content area with sticky filter */}
            <div className="container mx-auto flex-grow overflow-hidden">
                <div className="flex flex-col md:flex-row h-full max-h-[calc(100vh-140px)]">
                    {/* Sticky filter sidebar */}
                    <div className="md:w-[293px] md:sticky md:top-0 self-start h-fit flex-shrink-0">
                        <RoomFilters/>
                    </div>

                    {/* Scrollable room results */}
                    <div className="flex-1 md:ml-16 mt-6 md:mt-6 overflow-y-auto pb-6 pr-4">
                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-3">
                            <h2 className="text-xl font-bold">Room Results</h2>
                            <div className="flex items-center text-sm font-[600]">
                                <span className="mr-6 border-r border-gray-300 pr-6">
                                    {`Showing ${rooms.length}-${rooms.length} of ${rooms.length} results`}
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center">
                                        {roomsListConfig?.configData.filters.sortOptions.options.find(
                                            (option) =>
                                                option.value === filter.sortBy
                                        )?.label || "N/A"}
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>
                                            Sort Options
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator/>
                                        {roomsListConfig?.configData.filters
                                                .sortOptions.enabled &&
                                            roomsListConfig.configData.filters.sortOptions.options
                                                .filter(
                                                    (option) => option.enabled
                                                )
                                                .map((option) => (
                                                    <DropdownMenuItem
                                                        key={option.value}
                                                        onClick={() =>
                                                            handleSortChange(
                                                                option.value
                                                            )
                                                        }
                                                        className={
                                                            filter.sortBy ===
                                                            option.value
                                                                ? "bg-gray-100"
                                                                : ""
                                                        }
                                                    >
                                                        {option.label}
                                                        {filter.sortBy ===
                                                            option.value && (
                                                                <FaCheck className="ml-2 h-4 w-4"/>
                                                            )}
                                                    </DropdownMenuItem>
                                                ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8 px-2">
                            {rooms.length > 0 ? (
                                rooms.map((room) => (
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
