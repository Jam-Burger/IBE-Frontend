
import {FaCheck, FaChevronDown, FaFilter} from "react-icons/fa";
import {useEffect, useState} from "react";
import {FilterRow, RoomCard, RoomFilters} from "../components";
import {ConfigType, PaginationResponse, Room, SortOption, StateStatus} from "../types";
import {api} from "../lib/api-client";
import {useParams, useSearchParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {fetchConfig} from "../redux/configSlice";
import {PulseLoader} from "react-spinners";
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../components/ui";
import {syncWithUrl, updateFilter} from "../redux/filterSlice.ts";
import {filterToSearchParams, searchParamsToFilter,} from "../lib/url-params.ts";
import { Stepper } from '../components';

const ITEMS_PER_PAGE = 3;

const RoomsListPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
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
    const [roomsData, setRoomsData] = useState<PaginationResponse<Room>>({
        items: [],
        total: 0,
        currentPage: 1,
        pageSize: ITEMS_PER_PAGE,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                        {
                            page: roomsData.currentPage,
                            pageSize: ITEMS_PER_PAGE
                        }
                    );
                    setRoomsData(response.data);
                } catch (error) {
                    console.error("Error fetching rooms:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRooms();
    }, [tenantId, searchParams, roomsData.currentPage]);

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

    // const stepsEnabled = stepsConfig.enabled !== false;
    // const stepLabels = stepsConfig.labels;

    // const handleStepClick = (step: number) => {
    //     if (step < currentStep) {
    //         setCurrentStep(step);
    //     }
    // };

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

    const handleRoomSelection = () => {
        setCurrentStep(0);
    };

    const handlePackageSelection = () => {
        setCurrentStep(2);
    };

    const handlePageChange = (page: number) => {
        setRoomsData((prev: PaginationResponse<Room>) => ({...prev, currentPage: page}));
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div
                className="w-full bg-[#858685] h-48 flex-shrink-0"
                style={bannerStyle}
            />
            {stepsConfig.enabled !== false && (
                <Stepper 
                    steps={configuredSteps}
                    currentStep={currentStep}
                    onStepClick={(step) => {
                        if (step < currentStep) {
                            setCurrentStep(step);
                        }
                    }}
                />
            )}

            {searchForm && (
                <FilterRow
                    searchForm={searchForm}
                    filter={filter}
                    filterGroups={filterGroups}
                    onSearch={(filters) => {
                        dispatch(updateFilter(filters));
                    }}
                />
            )}

            {/* Scrollable content area with sticky filter */}
            <div className="container mx-auto flex-grow overflow-hidden">
                <div className="flex flex-col mt-6 lg:flex-row h-full px-6 lg:px-0">
                    {/* Desktop filter sidebar - hidden on mobile */}
                    <div className="hidden lg:block lg:w-[293px] lg:sticky lg:top-0 self-start h-fit flex-shrink-0">
                        <RoomFilters/>
                    </div>

                    {/* Mobile filter button - fixed position */}
                    <div className="fixed bottom-6 right-6 z-30 lg:hidden">
                        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    className="h-14 w-14 rounded-full bg-primary shadow-lg flex items-center justify-center"
                                    aria-label="Open filters"
                                >
                                    <FaFilter className="h-5 w-5 text-white"/>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                                <SheetHeader className="p-4">
                                    <SheetTitle className="text-primary">Filters</SheetTitle>
                                </SheetHeader>
                                <div className="px-4">
                                    <RoomFilters/>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Scrollable room results */}
                    <div className="flex-1 lg:ml-16 overflow-y-auto pb-6 pr-4">
                        <div
                            className="flex justify-between items-center mb-4 lg:sticky lg:top-0 bg-white lg:z-10 py-3">
                            <h2 className="text-xl font-bold">Room Results</h2>
                            <div className="flex items-center text-sm font-[600]">
                                <span className="mr-6 border-r border-gray-300 pr-6">
                                    {`Showing ${(roomsData.currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(roomsData.currentPage * ITEMS_PER_PAGE, roomsData.total)} of ${roomsData.total} results`}
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

                        <div
                            className="grid w-fit justify-self-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8 px-2 justify-center items-start">
                            {roomsData.items.length > 0 ? (
                                roomsData.items.map((room: Room) => {
                                    // Find the room with minimum average price
                                    const minPriceRoom = roomsData.items.reduce((min, current) => 
                                        current.averagePrice < min.averagePrice ? current : min
                                    );
                                    
                                    // Add special deal only to the room with minimum price
                                    const roomWithDeal = {
                                        ...room,
                                        specialDeal: room.roomTypeId === minPriceRoom.roomTypeId ? {
                                            discount: 10,
                                            minNights: 3
                                        } : undefined
                                    };
                                    
                                    return <RoomCard
                                        key={roomWithDeal.roomTypeId}
                                        room={roomWithDeal}
                                        onSelectRoom={handleRoomSelection}
                                        onSelectPackage={handlePackageSelection}
                                    />
                                })
                            ) : (
                                <div className="col-span-3 text-center py-8">
                                    No rooms found
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {roomsData.totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(roomsData.currentPage - 1)}
                                                className={!roomsData.hasPrevious ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        {Array.from({length: roomsData.totalPages}, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    onClick={() => handlePageChange(page)}
                                                    isActive={page === roomsData.currentPage}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(roomsData.currentPage + 1)}
                                                className={!roomsData.hasNext ? "pointer-events-none opacity-50" : ""}
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
