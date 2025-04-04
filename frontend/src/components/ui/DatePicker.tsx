import * as React from "react";
import {addDays, addMonths, differenceInDays, format, isBefore, startOfToday, subMonths} from "date-fns";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {FaChevronLeft, FaChevronRight} from "react-icons/fa";
import {MdOutlineCalendarMonth} from "react-icons/md";
import {DateRange} from "react-day-picker";
import {SerializableDateRange} from "../../types";

import {cn, convertToLocaleCurrency, toSerializableDateRange} from "../../lib/utils";
import {Button} from "./Button";
import {Calendar} from "./Calendar";
import {Popover, PopoverContent, PopoverTrigger} from "./Popover";
import {clearRoomRates, fetchRoomRates} from "../../redux/roomRatesSlice";
import {useParams} from "react-router-dom";
import {updateFilter} from "../../redux/filterSlice";
import { StateStatus } from "../../types/common";

interface DatePickerWithRangeProps {
    className?: string;
    propertyId: number;
    disabled: boolean;
    noBorder?: boolean;
    grayBorder?: boolean;
    displayStyle?: "default" | "checkInOut";
    value?: SerializableDateRange;
    onChange?: (dateRange: DateRange | undefined) => void;
}

interface RoomRates {
    [date: string]: {
        minimumRate: number;
        discountedRate: number;
    };
}

// Convert SerializableDateRange to DateRange for react-day-picker
const toDateRange = (serializableRange?: SerializableDateRange): DateRange | undefined => {
    if (!serializableRange) return undefined;

    // DateRange in react-day-picker is different than what TypeScript thinks
    // It can have undefined from/to properties, but TypeScript wants them defined
    // Using a type assertion to work around this
    const result = {} as DateRange;

    if (serializableRange.from) {
        result.from = new Date(serializableRange.from);
    }
    if (serializableRange.to) {
        result.to = new Date(serializableRange.to);
    }
    return result;
};

export function DatePickerWithRange({
                                        className,
                                        propertyId,
                                        disabled,
                                        noBorder = false,
                                        grayBorder = false,
                                        displayStyle = "default",
                                        value,
                                        onChange,
                                    }: Readonly<DatePickerWithRangeProps>) {
    const dispatch = useAppDispatch();
    const {tenantId} = useParams<{ tenantId: string }>();
    const {data: roomRates, status, error} = useAppSelector(state => state.roomRates);
    const {selectedCurrency, multiplier} = useAppSelector(state => state.currency);
    const {landingConfig} = useAppSelector(state => state.config);
    const filterDateRange = useAppSelector(state => state.roomFilters.filter.dateRange);
    const serializedDateRange = value ?? filterDateRange;

    // Convert serialized date range to DateRange for the Calendar component
    const dateRangeFromRedux = React.useMemo(() =>
            toDateRange(serializedDateRange)
        , [serializedDateRange]);

    const formattedRoomRates = React.useMemo(() => {
        const rates: RoomRates = {};
        roomRates.forEach(rate => {
            rates[rate.date] = rate;
        });
        return rates;
    }, [roomRates]);

    const today = startOfToday();
    const [date, setDate] = React.useState<DateRange | undefined>(dateRangeFromRedux);
    const [isOpen, setIsOpen] = React.useState(false);

    // Update local state when Redux state changes
    React.useEffect(() => {
        setDate(dateRangeFromRedux);
    }, [dateRangeFromRedux]);

    const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

    const handleSelect = (newRange: DateRange | undefined) => {
        if (!newRange) {
            setDate(undefined);
            return;
        }

        if (date?.from && date?.to &&
            newRange.from?.getTime() === date.from.getTime() &&
            newRange.to?.getTime() === date.to.getTime()) {
            setDate(undefined);
            return;
        }

        const minNights = landingConfig?.configData.searchForm.lengthOfStay.min ?? 0;
        const maxNights = landingConfig?.configData.searchForm.lengthOfStay.max ?? 0;

        if (newRange.from && !newRange.to) {
            setDate(newRange);
            return;
        }

        if (newRange.from && newRange.to) {
            const diff = differenceInDays(newRange.to, newRange.from);
            if (diff < minNights) {
                const adjustedTo = addDays(newRange.from, minNights);
                setDate({
                    from: newRange.from,
                    to: adjustedTo
                });
            } else if (diff > maxNights) {
                const adjustedTo = addDays(newRange.from, maxNights);
                setDate({
                    from: newRange.from,
                    to: adjustedTo
                });
            } else {
                setDate(newRange);
            }
        }
    };

    const handleApplyDates = () => {
        // Convert Date objects to serializable ISO strings
        const serializableRange = toSerializableDateRange(date);
        if (onChange) {
            onChange(date);
        } else {
            dispatch(updateFilter({dateRange: serializableRange}));
        }
        setIsOpen(false);
    };

    const isDisabled = (day: Date): boolean => {
        if (isBefore(day, today)) return true;

        if (date?.from && !date.to) {
            const diff = differenceInDays(day, date.from);
            const minNights = landingConfig?.configData.searchForm.lengthOfStay.min ?? 1;
            const maxNights = landingConfig?.configData.searchForm.lengthOfStay.max ?? 14;
            return diff < minNights || diff > maxNights;
        }

        return false;
    };

    const handleMonthChange = (newMonth: Date) => {
        setCurrentMonth(newMonth);
    };

    React.useEffect(() => {
        if (tenantId && propertyId) {
            dispatch(fetchRoomRates({
                tenantId,
                propertyId,
                startDate: currentMonth,
                endDate: addMonths(currentMonth, 2)
            }));
        } else {
            dispatch(clearRoomRates());
        }
    }, [tenantId, propertyId, dispatch, currentMonth]);

    const renderDayContents = (day: Date) => {
        if (isBefore(day, today)) {
            return (
                <div className="flex flex-col items-center justify-start h-full">
                    <div>{format(day, "d")}</div>
                </div>
            );
        }

        const dayStr = format(day, "yyyy-MM-dd");
        const originalPrice = formattedRoomRates[dayStr]?.minimumRate;
        const discountedPrice = formattedRoomRates[dayStr]?.discountedRate;
        const currencySymbol = selectedCurrency.symbol;

        const isRangeEnd = (date?.from && date?.to) &&
            (day.getTime() === date.from.getTime() || day.getTime() === date.to.getTime());

        const textColor = isRangeEnd ? 'text-white' : 'text-gray-600';

        return (
            <div className="flex flex-col items-center justify-start h-full">
                <div>{format(day, "d")}</div>
                {originalPrice !== 0 &&
                    (
                        <div className={`${textColor}`}>
                            {originalPrice !== discountedPrice && (
                                <div className="line-through text-gray-500 text-xs">
                                    {convertToLocaleCurrency(currencySymbol, originalPrice, multiplier)}
                                </div>
                            )}
                            <div className="text-xs">
                                {convertToLocaleCurrency(currencySymbol, discountedPrice, multiplier)}
                            </div>
                        </div>
                    )
                }
            </div>
        );
    };

    // Format dates for display based on style
    const renderDateContent = () => {
        if (displayStyle === "checkInOut") {
            return (
                <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex flex-col flex-5">
                        <span className="text-sm font-medium text-gray-500">Check in between</span>
                        <span className="text-black font-medium">
                            {date?.from ? format(date.from, "MMM dd, yyyy") : "Any Date"}
                        </span>
                    </div>
                    <div className="text-gray-400 text-xl mx-3 flex items-center f-[30px]">|</div>
                    <div className="flex flex-col flex-5">
                        <span className="text-sm font-medium text-gray-500">Check out between</span>
                        <span className="text-black font-medium">
                            {date?.to ? format(date.to, "MMM dd, yyyy") : "Any Date"}
                        </span>
                    </div>
                    <div className="ml-auto">
                        <MdOutlineCalendarMonth className="h-6 w-6 text-black"/>
                    </div>
                </div>
            );
        }

        // Default display style for CardWithForm
        if (!date?.from) {
            return (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                        <span className="text-gray-500 text-base ml-2">Check-in</span>
                        <span className="mx-4 text-gray-500">→</span>
                        <span className="text-gray-500 text-base">Check out</span>
                    </div>
                    <MdOutlineCalendarMonth className="h-5 w-5 text-gray-500 mr-2"/>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-between w-full">
                <div className="ml-2">
                    {date?.from ? (
                        date.to ? (
                            <>
                                {format(date.from, "LLL dd, y")} → {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Select dates</span>
                    )}
                </div>
                <MdOutlineCalendarMonth className="h-4 w-4 text-gray-500 mr-2"/>
            </div>
        );
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={noBorder ? "ghost" : "outline"}
                        className={cn(
                            "w-full justify-between text-left font-normal px-0",
                            !date && "text-muted-foreground",
                            noBorder && "!border-0 !shadow-none hover:!bg-transparent hover:!border-0",
                            grayBorder && "border border-gray-200 hover:border-gray-300",
                            displayStyle === "checkInOut" && "py-3 px-4",
                            className
                        )}
                        style={{
                            ...(grayBorder ? {borderColor: '#e5e7eb', borderRadius: '8px'} : {}),
                            ...(noBorder ? {border: 'none', boxShadow: 'none'} : {}),
                            height: className?.includes('h-[') ? undefined : (displayStyle === "checkInOut" ? 'auto' : undefined)
                        }}
                        disabled={disabled}
                    >
                        {renderDateContent()}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-[90vw] sm:w-[896px] bg-white shadow-md z-50 p-0  rounded-md"
                    align="center"
                    side="bottom"
                    sideOffset={5}
                >
                    <div className="p-2 sm:p-4">
                        {status === StateStatus.LOADING ? (
                            <div className="flex justify-center p-4">Loading rates and discounts...</div>
                        ) : (
                            <div className="flex flex-col">
                                <div className="flex items-center my-4 md:hidden px-4">
                                    <span className="text-sm font-medium mr-2 text-gray-500">
                                        {format(currentMonth, "MMMM")}
                                    </span>
                                    <button
                                        onClick={() => handleMonthChange(subMonths(currentMonth, 1))}
                                        className="h-6 w-6 flex items-center justify-center mx-1 text-gray-500"
                                    >
                                        <FaChevronLeft className="w-4 h-4"/>
                                    </button>
                                    <button
                                        onClick={() => handleMonthChange(addMonths(currentMonth, 1))}
                                        className="h-6 w-6 flex items-center justify-center mx-1 text-gray-500"
                                    >
                                        <FaChevronRight className="w-4 h-4"/>
                                    </button>
                                </div>
                                <div className="hidden md:flex md:space-x-8 justify-center">
                                    <div className="flex flex-col">
                                        <div className="flex items-center mb-4">
                                            <span className="text-sm font-medium mr-2 text-gray-500">
                                                {format(currentMonth, "MMMM")}
                                            </span>
                                            <button
                                                onClick={() => handleMonthChange(subMonths(currentMonth, 1))}
                                                className="h-6 w-6 flex items-center justify-center mx-1 text-gray-500"
                                            >
                                                <FaChevronLeft className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={() => handleMonthChange(addMonths(currentMonth, 1))}
                                                className="h-6 w-6 flex items-center justify-center mx-1 text-gray-500"
                                            >
                                                <FaChevronRight className="w-4 h-4"/>
                                            </button>
                                        </div>
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={currentMonth}
                                            month={currentMonth}
                                            selected={date ?? undefined}
                                            onSelect={handleSelect}
                                            onMonthChange={handleMonthChange}
                                            numberOfMonths={1}
                                            disabled={isDisabled}
                                            fromDate={today}
                                            modifiersStyles={{
                                                day_range_start: {
                                                    backgroundColor: "var(--primary)",
                                                    color: "white",
                                                    fontWeight: "bold"
                                                },
                                                day_range_end: {
                                                    backgroundColor: "var(--primary)",
                                                    color: "white",
                                                    fontWeight: "bold"
                                                },
                                                day_range_middle: {backgroundColor: "#9b9b9b", color: "black"}
                                            }}
                                            classNames={{
                                                months: "flex flex-col",
                                                month: "w-full relative",
                                                caption: "hidden",
                                                nav: "hidden",
                                                table: "w-full border-collapse",
                                                head_row: "flex justify-between",
                                                head_cell: "w-[50px] text-center font-medium text-gray-500",
                                                row: "flex justify-between mb-3",
                                                cell: "w-[50px] h-[60px] flex flex-col items-center justify-center mx-0.5",
                                                day: "h-[60px] w-[50px] flex flex-col items-center justify-center p-0",
                                                day_today: "bg-none",
                                                day_range_middle: "!bg-[#AAA] text-black font-normal",
                                                day_disabled: "!text-gray-400 font-light !cursor-not-allowed",
                                            }}
                                            formatters={{
                                                formatWeekdayName: (date) => {
                                                    return format(date, "EEEEEE").toUpperCase();
                                                },
                                                formatDay: (date) => {
                                                    return (
                                                        <div className="h-full">
                                                            {renderDayContents(date)}
                                                        </div>
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center mb-4">
                                            <span className="text-sm font-medium mr-2 text-gray-500">
                                                {format(addMonths(currentMonth, 1), "MMMM")}
                                            </span>
                                            <button
                                                onClick={() => handleMonthChange(subMonths(currentMonth, 1))}
                                                className="h-6 w-6 flex items-center justify-center mx-1 text-gray-500"
                                            >
                                                <FaChevronLeft className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={() => handleMonthChange(addMonths(currentMonth, 1))}
                                                className="h-6 w-6 flex items-center justify-center mx-1 text-gray-500"
                                            >
                                                <FaChevronRight className="w-4 h-4"/>
                                            </button>
                                        </div>
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={addMonths(currentMonth, 1)}
                                            month={addMonths(currentMonth, 1)}
                                            selected={date}
                                            onSelect={handleSelect}
                                            onMonthChange={handleMonthChange}
                                            numberOfMonths={1}
                                            disabled={isDisabled}
                                            fromDate={today}
                                            modifiersStyles={{
                                                day_range_start: {
                                                    backgroundColor: "var(--primary)",
                                                    color: "white",
                                                    fontWeight: "bold"
                                                },
                                                day_range_end: {
                                                    backgroundColor: "var(--primary)",
                                                    color: "white",
                                                    fontWeight: "bold"
                                                },
                                                day_range_middle: {backgroundColor: "#9b9b9b", color: "black"}
                                            }}
                                            classNames={{
                                                months: "flex flex-col",
                                                month: "w-full relative",
                                                caption: "hidden",
                                                nav: "hidden",
                                                table: "w-full border-collapse",
                                                head_row: "flex justify-between",
                                                head_cell: "w-[50px] text-center font-medium text-gray-500",
                                                row: "flex justify-between mb-3",
                                                cell: "w-[50px] h-[60px] flex flex-col items-center justify-center mx-0.5",
                                                day: "h-[60px] w-[50px] flex flex-col items-center justify-center p-0",
                                                day_today: "bg-none",
                                                day_range_middle: "!bg-[#AAA] text-black font-normal",
                                                day_disabled: "!text-gray-400 font-light !cursor-not-allowed",
                                            }}
                                            formatters={{
                                                formatWeekdayName: (date) => {
                                                    return format(date, "EEEEEE").toUpperCase();
                                                },
                                                formatDay: (date) => {
                                                    return (
                                                        <div className="h-full">
                                                            {renderDayContents(date)}
                                                        </div>
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="md:hidden">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={currentMonth}
                                        month={currentMonth}
                                        selected={date}
                                        onSelect={handleSelect}
                                        onMonthChange={handleMonthChange}
                                        numberOfMonths={1}
                                        disabled={isDisabled}
                                        fromDate={today}
                                        modifiersStyles={{
                                            day_range_start: {
                                                backgroundColor: "var(--primary)",
                                                color: "white",
                                                fontWeight: "bold"
                                            },
                                            day_range_end: {
                                                backgroundColor: "var(--primary)",
                                                color: "white",
                                                fontWeight: "bold"
                                            },
                                            day_range_middle: {backgroundColor: "#9b9b9b", color: "black"}
                                        }}
                                        classNames={{
                                            months: "flex flex-col",
                                            month: "w-full relative",
                                            caption: "hidden",
                                            nav: "hidden",
                                            table: "w-full border-collapse",
                                            head_row: "flex justify-between",
                                            head_cell: "w-[50px] text-center font-medium text-gray-500",
                                            row: "flex justify-between mb-3",
                                            cell: "w-[50px] h-[60px] flex flex-col items-center justify-center mx-0.5",
                                            day: "h-[60px] w-[50px] flex flex-col items-center justify-center p-0",
                                            day_today: "bg-none",
                                            day_range_middle: "!bg-[#AAA] text-black font-normal",
                                            day_disabled: "!text-gray-400 font-light !cursor-not-allowed",
                                        }}
                                        formatters={{
                                            formatWeekdayName: (date) => {
                                                return format(date, "EEEEEE").toUpperCase();
                                            },
                                            formatDay: (date) => {
                                                return (
                                                    <div className="h-full">
                                                        {renderDayContents(date)}
                                                    </div>
                                                );
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="text-red-500 text-center p-2">
                                Error loading room rates. Please try again.
                            </div>
                        )}
                    </div>
                    <div
                        className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex flex-col items-start mb-2 sm:mb-0">
                            <span className="text-red-500 text-xs mr-4">
                                {date?.from && date?.to && differenceInDays(date.to, date.from) > 14
                                    ? "Max. length of stay: 14 days"
                                    : ""}
                            </span>
                            {date?.from && date?.to && (
                                <div className="text-sm text-gray-700 mt-2">
                                    Total price: {(() => {
                                        let total = 0;
                                        let currentDate = new Date(date.from);
                                        while (currentDate < date.to) {
                                            const dayStr = format(currentDate, "yyyy-MM-dd");
                                            const rate = formattedRoomRates[dayStr];
                                            if (rate) {
                                                total += rate.discountedRate;
                                            }
                                            currentDate = addDays(currentDate, 1);
                                        }
                                        return convertToLocaleCurrency(selectedCurrency.symbol, total, multiplier);
                                    })()}
                                </div>
                            )}
                        </div>
                        <Button
                            className="h-8 text-sm px-6"
                            disabled={!date?.from || !date?.to}
                            onClick={handleApplyDates}
                        >
                            APPLY DATES
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}