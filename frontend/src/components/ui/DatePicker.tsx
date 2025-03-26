import * as React from "react";
import {useEffect, useState} from "react";
import {addDays, addMonths, differenceInDays, format, isBefore, startOfToday, subMonths} from "date-fns";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {FaChevronLeft, FaChevronRight} from "react-icons/fa";
import {MdOutlineCalendarMonth} from "react-icons/md";
import {DateRange} from "react-day-picker";
import {useParams} from 'react-router-dom';
import {StateStatus} from "../../types/common";

import {cn, formatPrice} from "../../lib/utils";
import {Button} from "./Button";
import {Calendar} from "./Calendar";
import {Popover, PopoverContent, PopoverTrigger} from "./Popover";
import {clearRoomRates, fetchRoomRates} from "../../redux/roomRatesSlice";
import {api} from "../../lib/api-client";

interface SpecialDiscount {
    id: number;
    propertyId: number;
    discountDate: string;
    discountPercentage: number;
    description?: string;
}

interface DatePickerWithRangeProps {
    className?: string;
    propertyId: number;
    disabled: boolean;
}

interface RoomRates {
    [date: string]: number;
}

export function DatePickerWithRange({className, propertyId, disabled}: Readonly<DatePickerWithRangeProps>) {
    const dispatch = useAppDispatch();
    const {data: roomRates, status, error} = useAppSelector(state => state.roomRates);
    const {selectedCurrency, multiplier} = useAppSelector(state => state.currency);
    const {landingConfig} = useAppSelector(state => state.config);
    const {tenantId} = useParams<{ tenantId: string }>();

    const formattedRoomRates = React.useMemo(() => {
        const rates: RoomRates = {};
        roomRates.forEach(rate => {
            rates[rate.date] = rate.minimumRate;
        });
        return rates;
    }, [roomRates]);

    const today = startOfToday();
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: today,
        to: addDays(today, 1),
    });

    // Set fixed date range from March to July
    const startMonth = new Date(new Date().getFullYear(), 2, 1); // March
    const endMonth = new Date(new Date().getFullYear(), 6, 1); // June
    const [currentMonth, setCurrentMonth] = React.useState<Date>(startMonth);
    const [specialDiscounts, setSpecialDiscounts] = useState<Record<string, number>>({});
    const [loadingDiscounts, setLoadingDiscounts] = useState<boolean>(false);
    const handleSelect = (newRange: DateRange | undefined) => {
        if (!newRange) {
            setDate(undefined);
            return;
        }

        // Reset selection if clicking the same cell
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
                // If selected range is less than minimum nights, adjust end date
                const adjustedTo = addDays(newRange.from, minNights);
                setDate({
                    from: newRange.from,
                    to: adjustedTo
                });
            } else if (diff > maxNights) {
                // If selected range is more than maximum nights, adjust end date
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
        // Only allow navigation between March and June
        if (newMonth >= startMonth && newMonth <= endMonth) {
            setCurrentMonth(newMonth);
        }
    };

    // Fetch all prices when property changes
    React.useEffect(() => {
        if (propertyId) {
            // Fetch prices for March to June
            dispatch(fetchRoomRates({
                currentMonth: startMonth,
                propertyId,
                endMonth
            }));
        } else {
            dispatch(clearRoomRates());
        }
    }, [propertyId, dispatch]);

    // Fetch special discounts for the entire range
    useEffect(() => {
        const fetchSpecialDiscounts = async () => {
            if (!propertyId) return;

            setLoadingDiscounts(true);
            try {
                const startDate = format(startMonth, "yyyy-MM-dd");
                const endDate = format(endMonth, "yyyy-MM-dd");

                const response = await api.getSpecialDiscounts({
                    propertyId,
                    startDate,
                    endDate,
                    tenantId
                });

                if (response.statusCode === "OK" && Array.isArray(response.data)) {
                    const discountMap: Record<string, number> = {};
                    response.data.forEach((discount: SpecialDiscount) => {
                        discountMap[discount.discountDate] = discount.discountPercentage;
                    });
                    setSpecialDiscounts(discountMap);
                }
            } catch (error) {
                console.error("Error fetching special discounts:", error);
            } finally {
                setLoadingDiscounts(false);
            }
        };

        fetchSpecialDiscounts();
    }, [propertyId, tenantId]);

    const renderDayContents = (day: Date) => {
        // Don't show prices for past dates
        if (isBefore(day, today)) {
            return (
                <div className="flex flex-col items-center justify-start h-full">
                    <div>{format(day, "d")}</div>
                </div>
            );
        }

        const dayStr = format(day, "yyyy-MM-dd");
        const originalPrice = formattedRoomRates[dayStr] * multiplier;
        const discountPercentage = specialDiscounts[dayStr];
        const discountedPrice = originalPrice * (1 - discountPercentage / 100);
        const currencySymbol = selectedCurrency.symbol;

        const isRangeEnd = date?.from && date?.to &&
            (day.getTime() === date.from.getTime() || day.getTime() === date.to.getTime());

        const textColor = isRangeEnd ? 'text-white' : 'text-gray-600';

        return (
            <div className="flex flex-col items-center justify-start h-full">
                <div>{format(day, "d")}</div>
                {discountPercentage > 0 ? (
                    <div className={`${textColor}`}>
                        <div className="line-through text-gray-500 text-sm">
                            {currencySymbol}{formatPrice(originalPrice)}
                        </div>
                        <div className="text-sm">
                            {currencySymbol}{formatPrice(discountedPrice)}
                        </div>
                    </div>
                ) : (
                    <div className={`${textColor} text-sm`}>
                        {currencySymbol}{formatPrice(originalPrice)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn("relative", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className="w-full text-gray-700 disabled:text-gray-500 max-w-md min-h-[48px] justify-start text-left font-normal rounded-md border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-2"
                        disabled={disabled}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 sm:gap-6 text-sm sm:text-base">
                                <div className="flex flex-col">
                                    <span>Check-in</span>
                                </div>
                                <div>→</div>
                                <div className="flex flex-col">
                                    <span>Check out</span>
                                </div>
                            </div>
                            <MdOutlineCalendarMonth className="h-5 w-5 "/>
                        </div>
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-[90vw] sm:w-[896px] bg-white shadow-md z-50 p-0 border rounded-md"
                    align="center"
                    side="bottom"
                    sideOffset={5}
                >
                    <div className="p-2 sm:p-4">
                        {status === StateStatus.LOADING || loadingDiscounts ? (
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
                        <div className="flex items-center mb-2 sm:mb-0">
                            <span className="text-red-500 text-xs mr-4">
                                {date?.from && date?.to && differenceInDays(date.to, date.from) > 14
                                    ? "Max. length of stay: 14 days"
                                    : ""}
                            </span>
                        </div>
                        <Button
                            className="bg-primary h-8 text-sm px-6 w-fit"
                            disabled={!date?.from || !date?.to}
                        >
                            APPLY DATES
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}