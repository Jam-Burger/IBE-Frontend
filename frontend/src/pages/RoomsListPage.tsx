import {cn} from "../lib/utils";
import {FaCheck, FaChevronDown} from "react-icons/fa";
import {CSSProperties, useEffect, useState} from "react";
import {RoomCard, RoomFilters, FilterRow} from "../components";
import {ConfigType, Room, SortOption, StateStatus} from "../types";
import {api} from "../lib/api-client";
import {useParams, useSearchParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {fetchConfig} from "../redux/configSlice";
import {PulseLoader} from "react-spinners";
import {
    Button,
    DatePickerWithRange,
    GuestSelector,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui";
import {syncWithUrl, updateFilter} from "../redux/filterSlice.ts";
import {filterToSearchParams, searchParamsToFilter,} from "../lib/url-params.ts";
import {MdOutlineCalendarMonth} from "react-icons/md";

const ITEMS_PER_PAGE = 3;

const RoomsListPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [rooms, setRooms] = useState<Room[]>([]);
    const {tenantId} = useParams<{ tenantId: string }>();
    const dispatch = useAppDispatch();
    const {roomsListConfig, status} = useAppSelector((state) => state.config);
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = useAppSelector((state) => state.roomFilters.filter);
    const searchForm = useAppSelector(
        (state) => state.config.landingConfig?.configData.searchForm
    );
    const filterGroups = roomsListConfig?.configData.filters.filterGroups;
    const [loading, setLoading] = useState(status === StateStatus.LOADING);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        dispatch(syncWithUrl(searchParamsToFilter(searchParams)));
    }, [dispatch, searchParams]);

    useEffect(() => {
        if (filter && !loading) {
            const params = filterToSearchParams(filter);
            setSearchParams(params);
        }
    }, [filter, setSearchParams, loading]);

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
            if (tenantId) {
                try {
                    const response = await api.getRooms(
                        tenantId,
                        Object.fromEntries(searchParams.entries()),
                    );
                    setRooms(response.data);
                    setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
                } catch (error) {
                    console.error("Error fetching rooms:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRooms();
    }, [tenantId, loading, searchParams]);

    if (loading || !roomsListConfig) {
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

    if (loading) {
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const paginatedRooms = rooms.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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
                <FilterRow
                    searchForm={searchForm}
                    filter={filter}
                    filterGroups={filterGroups}
                    onSearch={(filters) => {
                        dispatch(updateFilter(filters));
                        setCurrentPage(1); // Reset to first page when searching
                    }}
                />
            )}

            {/* Scrollable content area with sticky filter */}
            <div className="container mx-auto flex-grow overflow-hidden">
                <div className="flex flex-col mt-6 md:flex-row h-full">
                    {/* Sticky filter sidebar */}
                    <div className="md:w-[293px] md:sticky md:top-0 self-start h-fit flex-shrink-0">
                        <RoomFilters/>
                    </div>

                    {/* Scrollable room results */}
                    <div className="flex-1 md:ml-16 overflow-y-auto pb-6 pr-4">
                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-3">
                            <h2 className="text-xl font-bold">Room Results</h2>
                            <div className="flex items-center text-sm font-[600]">
                                <span className="mr-6 border-r border-gray-300 pr-6">
                                    {`Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, rooms.length)} of ${rooms.length} results`}
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
                                paginatedRooms.map((room) => (
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

                        {/* Pagination */}
                        {rooms.length > ITEMS_PER_PAGE && (
                            <div className="mt-8">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    isActive={currentPage === page}
                                                    onClick={() => handlePageChange(page)}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomsListPage;
