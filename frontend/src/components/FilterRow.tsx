import {CSSProperties, useEffect, useState} from "react";
import {
    Button,
    DatePickerWithRange,
    GuestSelector,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger
} from "./ui";
import {MdOutlineCalendarMonth} from "react-icons/md";
import {Filter} from "../types";
import {DateRange} from "react-day-picker";
import {toSerializableDateRange} from "../lib/utils";

interface SearchForm {
    guestOptions: {
        enabled: boolean;
    };
    roomOptions: {
        enabled: boolean;
        max: number;
    };
}

interface FilterRowProps {
    searchForm: SearchForm;
    filter: Filter;
    filterGroups: any;
    onSearch: (filters: Partial<Filter>) => void;
}

export const FilterRow = ({
                              searchForm,
                              filter,
                              filterGroups,
                              onSearch,
                          }: FilterRowProps) => {
    const [localFilter, setLocalFilter] = useState<Partial<Filter>>({
        roomCount: filter.roomCount ?? 1,
        bedCount: filter.bedCount ?? 1,
        guests: filter.guests,
        dateRange: filter.dateRange,
    });

    useEffect(() => {
        setLocalFilter({
            roomCount: filter.roomCount ?? 1,
            bedCount: filter.bedCount ?? 1,
            guests: filter.guests,
            dateRange: filter.dateRange,
        });
    }, [filter]);

    const handleGuestChange = (guests: Record<string, number>) => {
        setLocalFilter(prev => ({...prev, guests}));
    };

    const handleRoomCountChange = (value: string) => {
        const roomCount = parseInt(value, 10);
        setLocalFilter(prev => ({...prev, roomCount}));
    };

    const handleBedCountChange = (value: string) => {
        const bedCount = parseInt(value, 10);
        setLocalFilter(prev => ({...prev, bedCount}));
    };

    const handleDateChange = (dateRange: DateRange | undefined) => {
        const serializableRange = toSerializableDateRange(dateRange);
        setLocalFilter(prev => ({...prev, dateRange: serializableRange}));
    };

    const handleSearch = () => {
        onSearch(localFilter);
    };

    return (
        <div className="container mx-auto mt-4 mb-4">
            <div className="flex justify-center items-end gap-4">
                {searchForm.guestOptions.enabled && (
                    <div>
                        <GuestSelector
                            roomCount={localFilter.roomCount ?? 1}
                            showDetailedSummary={true}
                            width="264px"
                            height="68px"
                            value={localFilter.guests}
                            onChange={handleGuestChange}
                        />
                    </div>
                )}

                {searchForm.roomOptions.enabled && (
                    <div>
                        <Select
                            value={localFilter.roomCount?.toString()}
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
                                        {localFilter.roomCount}
                                    </span>
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
                    <Select
                        value={localFilter.bedCount?.toString()}
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
                                    {localFilter.bedCount}
                                </span>
                            </div>
                        </SelectTrigger>
                        <SelectContent position="popper">
                            {[...Array(filterGroups?.bedCount.max ?? 0)].map((_, i) => (
                                <SelectItem key={i} value={String(i + 1)}>
                                    {i + 1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <div style={{width: "510px"}} className="relative">
                        <DatePickerWithRange
                            propertyId={filter.propertyId}
                            disabled={false}
                            className="h-[68px]"
                            grayBorder={true}
                            displayStyle="checkInOut"
                            value={localFilter.dateRange}
                            onChange={handleDateChange}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <MdOutlineCalendarMonth className="h-6 w-6 text-black"/>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleSearch}
                    className="bg-primary text-white px-6"
                    style={{width: "168px", height: "66px"}}
                >
                    SEARCH DATES
                </Button>
            </div>
        </div>
    );
}; 