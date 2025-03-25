"use client";
import * as React from "react";
import {useEffect, useState} from "react";
import {addDays, addMonths, differenceInDays, format, isBefore, isSameMonth, startOfToday, subMonths,} from "date-fns";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {CalendarIcon, ChevronLeft, ChevronRight} from "lucide-react";
import {DateRange} from "react-day-picker";
import {useParams} from 'react-router-dom';

import {cn} from "../../lib/utils";
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

export function DatePickerWithRange({className, propertyId, disabled}: Readonly<DatePickerWithRangeProps>) {
    const dispatch = useAppDispatch();
    const {data: roomRates, loading, error} = useAppSelector(state => state.roomRates);
    const {selectedCurrency, multiplier} = useAppSelector(state => state.currency);
    const {globalConfig, landingConfig} = useAppSelector(state => state.config);
    const {tenantId} = useParams<{ tenantId: string }>();

    const today = startOfToday();
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: today,
        to: addDays(today, 1),
    });

    const [currentMonth, setCurrentMonth] = React.useState<Date>(today);
    const [specialDiscounts, setSpecialDiscounts] = useState<Record<string, number>>({});
    const [loadingDiscounts, setLoadingDiscounts] = useState<boolean>(false);

    const rightMonth = addMonths(currentMonth, 1);

    const handleSelect = (newRange: DateRange | undefined) => {
        if (newRange?.from && newRange?.to) {
            const diff = differenceInDays(newRange.to, newRange.from);
            if (diff > (landingConfig?.configData.searchForm.lengthOfStay.max ?? 0)) return;
        }
        setDate(newRange);
    };

    const isDisabled = (day: Date): boolean => {
        return (
            isBefore(day, today) ||
            (date?.from && !date.to ? differenceInDays(day, date.from) > (landingConfig?.configData.searchForm.lengthOfStay.max ?? 0) : false)
        );
    };

    const prevMonth = () => {
        setCurrentMonth((prev) => subMonths(prev, 1));
    };

    const nextMonth = () => {
        setCurrentMonth((prev) => addMonths(prev, 1));
    };

    // Fetch special discounts
    useEffect(() => {
        const fetchSpecialDiscounts = async () => {
            if (!propertyId) return;

            setLoadingDiscounts(true);
            try {
                const startDate = format(subMonths(currentMonth, 1), "yyyy-MM-dd");
                const endDate = format(addMonths(currentMonth, 3), "yyyy-MM-dd");

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
    }, [propertyId, currentMonth, tenantId]);

    React.useEffect(() => {
        if (date?.from && !isSameMonth(date.from, currentMonth) && !isSameMonth(date.from, rightMonth)) {
            setCurrentMonth(date.from);
        }
    }, [date?.from, currentMonth, rightMonth]);


    React.useEffect(() => {
        if (propertyId) {
            try {
                dispatch(fetchRoomRates({
                    currentMonth,
                    propertyId
                }));
            } catch (error) {
                console.error("Error parsing property ID:", error);
            }
        } else {
            dispatch(clearRoomRates());
        }
    }, [propertyId, currentMonth, dispatch]);

    // Custom day content renderer - separated from the Day component
    const renderDayContents = (day: Date) => {
        const formattedDate = format(day, "yyyy-MM-dd");
        const rateInfo = roomRates.find(rate => rate.date === formattedDate);
        const isPastDate = isBefore(day, today);

        // Only show the date number for past dates
        if (isPastDate) {
            return <div className="flex flex-col items-center justify-center h-full">{format(day, "d")}</div>;
        }

        if (!rateInfo) return <div
            className="flex flex-col items-center justify-center h-full">{format(day, "d")}</div>; // If no rate, just show the date

        // Convert prices using the currency multiplier
        const originalPrice = rateInfo.minimumRate * multiplier;
        const discountPercentage = specialDiscounts[formattedDate] || 0;
        const discountedPrice = discountPercentage > 0
            ? Math.round(originalPrice * (1 - discountPercentage / 100) * 100) / 100
            : originalPrice;

        // Get the currency symbol
        let currencySymbol = '$';
        if (globalConfig?.configData?.currencies) {
            const currencyObj = globalConfig.configData.currencies.find(c => c.code === selectedCurrency);
            if (currencyObj) {
                currencySymbol = currencyObj.symbol;
            }
        }

        const isRangeEnd = date?.from && date?.to &&
            (day.getTime() === date.from.getTime() || day.getTime() === date.to.getTime());

        const textColor = isRangeEnd ? 'text-white' : '';

        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div>{format(day, "d")}</div>
                {discountPercentage > 0 ? (
                    <div className={`text-xs mt-1 ${textColor}`}>
                        <div className="line-through text-gray-500">{currencySymbol}{originalPrice.toFixed(2)}</div>
                        <div>{currencySymbol}{discountedPrice.toFixed(2)}</div>
                    </div>
                ) : (
                    <div className={`text-xs mt-1 ${textColor}`}>
                        {currencySymbol}{originalPrice.toFixed(2)}
                    </div>
                )}
            </div>
        );
    };

    // Format day cells
    const formatDay = (day: Date) => {
        return renderDayContents(day);
    };

    return (
        <div className={cn("relative", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className="w-full max-w-md h-14 justify-start text-left font-normal rounded-md border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-2 min-h-[48px]"
                        disabled={disabled}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 font-medium">Check-in</span>
                                </div>
                                <div className="text-gray-500">→</div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 font-medium">Check out</span>
                                </div>
                            </div>
                            <CalendarIcon className="h-5 w-5 text-gray-500"/>
                        </div>
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="absolute left-0 top-full mt-2 w-[896px] bg-white shadow-md z-50"
                    align="start"
                    side="bottom"
                    sideOffset={5}
                >
                    <div className="p-4">
                        <div className="flex space-x-8">
                            <div className="w-full">
                                <div className="flex items-center mb-4 justify-start">
                                    <span className="text-lg font-medium mx-2">{format(currentMonth, "MMMM")}</span>
                                    <button
                                        onClick={prevMonth}
                                        className="h-6 w-6 flex items-center justify-center mx-1"
                                    >
                                        <ChevronLeft className="w-4 h-4"/>
                                    </button>

                                    <button
                                        onClick={nextMonth}
                                        className="h-6 w-6 flex items-center justify-center mx-1"
                                    >
                                        <ChevronRight className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>

                            <div className="w-full">
                                <div className="flex items-center mb-4 justify-start">
                                    <span className="text-lg font-medium mr-2">{format(rightMonth, "MMMM")}</span>
                                    <button
                                        onClick={prevMonth}
                                        className="h-6 w-6 flex items-center justify-center mx-1"
                                    >
                                        <ChevronLeft className="w-4 h-4"/>
                                    </button>
                                    <button
                                        onClick={nextMonth}
                                        className="h-6 w-6 flex items-center justify-center mx-1"
                                    >
                                        <ChevronRight className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading || loadingDiscounts ? (
                            <div className="flex justify-center p-4">Loading rates and discounts...</div>
                        ) : (
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={currentMonth}
                                month={currentMonth}
                                selected={date}
                                onSelect={handleSelect}
                                numberOfMonths={2}
                                disabled={isDisabled}
                                modifiersStyles={{
                                    day_range_start: {backgroundColor: "#26266D", color: "white", fontWeight: "bold"},
                                    day_range_end: {backgroundColor: "#26266D", color: "white", fontWeight: "bold"},
                                    day_range_middle: {backgroundColor: "#C1C2C2", color: "black"}
                                }}
                                classNames={{
                                    months: "flex space-x-9",
                                    month: "w-full relative",
                                    caption: "hidden",
                                    nav: "hidden",
                                    table: "w-full border-collapse",
                                    head_row: "flex justify-between text-gray-600 text-sm font-medium mb-2",
                                    head_cell: "w-10 text-center",
                                    row: "flex justify-between gap-2 mb-3",
                                    cell: "w-[3.125rem] h-[3.75rem] flex flex-col items-center justify-center",
                                    day: "h-[3.75rem] w-[3.125rem] flex flex-col items-center justify-center p-0",
                                    day_selected: "!bg-[#26266D] !text-white !font-bold",
                                    day_range_start: "!bg-[#26266D] !text-white !font-bold",
                                    day_range_end: "!bg-[#26266D] !text-white !font-bold",
                                    day_range_middle: "!bg-[#C1C2C2] !text-black",
                                    day_disabled: "!text-gray-400 !cursor-not-allowed",
                                }}
                                formatters={{
                                    formatDay: (date) => {
                                        return (
                                            <div className="h-full">
                                                {formatDay(date)}
                                            </div>
                                        );
                                    }
                                }}
                            />
                        )}
                        {error && (
                            <div className="text-red-500 text-center p-2">
                                Error loading room rates. Please try again.
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                        <div className="flex items-center">
              <span className="text-red-500 text-xs mr-4">
                {date?.from && date?.to && differenceInDays(date.to, date.from) > 14
                    ? "Max. length of stay: 14 days"
                    : ""}
              </span>
                        </div>
                        <Button
                            className="bg-[#26266D] h-8 text-sm"
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