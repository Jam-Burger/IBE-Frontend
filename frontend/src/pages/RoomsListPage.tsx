import {cn} from "../lib/utils";
import {FaCheck} from "react-icons/fa";
import {CSSProperties, useEffect, useState} from "react";
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
import {
    Button,
    DatePickerWithRange,
    GuestSelector,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "../components/ui";
import {syncWithUrl, updateFilter} from "../redux/filterSlice.ts";
import {filterToSearchParams, searchParamsToFilter,} from "../lib/url-params.ts";
import {MdOutlineCalendarMonth} from "react-icons/md";
import {FaChevronDown} from "react-icons/fa";

const RoomsListPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [rooms, setRooms] = useState<Room[]>([]);
    const {tenantId} = useParams<{ tenantId: string }>();
    const dispatch = useAppDispatch();
    const {roomsListConfig, status} = useAppSelector((state) => state.config);
    const isLoading = status === StateStatus.LOADING || !roomsListConfig;
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = useAppSelector((state) => state.roomFilters.filter);
    const searchForm = useAppSelector(
        (state) => state.config.landingConfig?.configData.searchForm
    );
    const filterGroups = roomsListConfig?.configData.filters.filterGroups;

    useEffect(() => {
        dispatch(syncWithUrl(searchParamsToFilter(searchParams)));
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
        dispatch(fetchConfig({tenantId, configType: ConfigType.LANDING}));
        dispatch(fetchConfig({tenantId, configType: ConfigType.ROOMS_LIST}));
    }, [tenantId, dispatch]);

    useEffect(() => {
        const fetchRooms = async () => {
            if (tenantId && !isLoading) {
                try {
                    const response = await api.getRooms(
                        tenantId,
                        Object.fromEntries(searchParams.entries())
                    );
                    setRooms(response.data);
                } catch (error) {
                    console.error("Error fetching rooms:", error);
                }
            }
        };

        fetchRooms();
    }, [tenantId, isLoading, searchParams]);

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

    const handleRoomCountChange = (value: string) => {
        const roomCount = parseInt(value, 10);
        dispatch(updateFilter({roomCount}));
    };

    const handleBedCountChange = (value: string) => {
        const bedCount = parseInt(value, 10);
        dispatch(updateFilter({bedCount}));
    };

    const handleDateSearch = () => {
    };

    const handleRoomSelection = () => {
        handleStepClick(1);
    };

    const handlePackageSelection = () => {
        handleStepClick(2);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div
                className="w-full bg-[#858685] h-48 flex-shrink-0"
                style={bannerStyle}
            />
            <div className="h-[92px] flex-shrink-0 bg-[#E4E4E4] flex items-center justify-center">
                <div className="flex items-center justify-center h-[92px] flex-shrink-0">
                    <div className="w-[417px] relative">
                        <div className="flex items-center justify-between relative">
                            <div
                                className={`absolute top-[14px] h-[2px] left-[32px] right-[50%] z-[1] ${
                                    currentStep > 0
                                        ? "bg-[#26266D]"
                                        : "bg-[#C1C2C2]"
                                }`}
                            ></div>

                            <div
                                className={`absolute top-[14px] h-[2px] left-[50%] right-[32px] z-[1] ${
                                    currentStep > 1
                                        ? "bg-[#26266D]"
                                        : "bg-[#C1C2C2]"
                                }`}
                            ></div>

                            {configuredSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center z-10"
                                >
                                    <button
                                        className={cn(
                                            "w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm cursor-pointer",
                                            index === currentStep
                                                ? "bg-[#D0182B]"
                                                : step.completed ||
                                                index < currentStep
                                                    ? "bg-[#26266D]"
                                                    : "bg-gray-300"
                                        )}
                                        onClick={() => handleStepClick(index)}
                                    >
                                        {step.completed ||
                                        index < currentStep ? (
                                            <FaCheck size={16}/>
                                        ) : index === currentStep ? (
                                            <FaCheck size={16}/>
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
                                    roomCount={filter.roomCount}
                                    showDetailedSummary={true}
                                    width="264px"
                                    height="68px"
                                />
                            </div>
                        )}

                        {searchForm.roomOptions.enabled && (
                            <div>
                                <Select
                                    value={filter.roomCount.toString()}
                                    onValueChange={handleRoomCountChange}
                                >
                                    <SelectTrigger
                                        id="rooms"
                                        className="w-full text-gray-500 min-h-[68px] min-w-[132px] [&>svg]:!text-black"
                                        style={
                                            {
                                                "--select-trigger-icon-color":
                                                    "black",
                                            } as CSSProperties
                                        }
                                    >
                                        <div className="flex flex-col items-start">
                                            <Label
                                                htmlFor="rooms"
                                                className="mb-1 block text-sm font-medium text-gray-500"
                                            >
                                                Rooms
                                            </Label>
                                            <span className="text-base font-medium text-gray-900">
                                                {filter.roomCount}
                                            </span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        {[
                                            ...Array(
                                                searchForm.roomOptions.max
                                            ),
                                        ].map((_, i) => (
                                            <SelectItem
                                                key={i}
                                                value={String(i + 1)}
                                            >
                                                {i + 1}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Select
                                value={filter.bedCount?.toString()}
                                onValueChange={handleBedCountChange}
                            >
                                <SelectTrigger
                                    id="beds"
                                    className="w-full text-gray-500 min-h-[68px] min-w-[132px] [&>svg]:!text-black"
                                    style={
                                        {
                                            "--select-trigger-icon-color":
                                                "black",
                                        } as CSSProperties
                                    }
                                >
                                    <div className="flex flex-col items-start">
                                        <Label
                                            htmlFor="beds"
                                            className="mb-1 block text-sm font-medium text-gray-500"
                                        >
                                            Beds
                                        </Label>
                                        <span className="text-base font-medium text-gray-900">
                                            {filter.bedCount}
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {[
                                        ...Array(
                                            filterGroups?.bedCount.max ?? 0
                                        ),
                                    ].map((_, i) => (
                                        <SelectItem
                                            key={i}
                                            value={String(i + 1)}
                                        >
                                            {i + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <div
                                style={{width: "510px"}}
                                className="relative"
                            >
                                <DatePickerWithRange
                                    propertyId={filter.propertyId}
                                    disabled={false}
                                    className="h-[68px]"
                                    grayBorder={true}
                                    displayStyle="checkInOut"
                                />
                                <div
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <MdOutlineCalendarMonth className="h-6 w-6 text-black"/>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleDateSearch}
                            className="bg-primary text-white px-6"
                            style={{width: "168px", height: "66px"}}
                        >
                            SEARCH DATES
                        </Button>
                    </div>
                </div>
            )}

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
                                        )?.label ?? ""}
                                        <FaChevronDown className="ml-2 h-4 w-4 text-gray-500"/>
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
                                        onSelectRoom={handleRoomSelection}
                                        onSelectPackage={handlePackageSelection}
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
