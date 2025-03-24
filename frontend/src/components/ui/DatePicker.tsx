"use client";
import * as React from "react";
import {
  addDays,
  format,
  startOfToday,
  differenceInDays,
  isBefore,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchRoomRates } from "../../redux/roomRatesSlice";
import { useEffect, useState } from 'react';

interface Discount {
  discountDate: string;
  discountPercentage: number;
}

const API_URL = import.meta.env.VITE_SPECIAL_DISCOUNT_API_URL;

interface DatePickerWithRangeProps {
  className?: string;
  property?: string;
  disabled?: boolean; 
}

export function DatePickerWithRange({ className, property, disabled }: DatePickerWithRangeProps) {

  const dispatch = useDispatch<AppDispatch>();
  const { data: roomRates, loading, error } = useSelector((state: RootState) => state.roomRates);

  const today = startOfToday();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: today,
    to: addDays(today, 7),
  });


  const [currentMonth, setCurrentMonth] = React.useState<Date>(today);

  const rightMonth = addMonths(currentMonth, 1);

  const handleSelect = (newRange: DateRange | undefined) => {
    if (newRange?.from && newRange?.to) {
      const diff = differenceInDays(newRange.to, newRange.from);
      if (diff > 14) return;
    }
    setDate(newRange);
  };

  const isDisabled = (day: Date): boolean => {
    return (
      isBefore(day, today) ||
      (date?.from && !date.to ? differenceInDays(day, date.from) > 14 : false)
    );
  };

  const prevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };


  const [discounts, setDiscounts] = useState<Record<string, number>>({});



  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.statusCode === "OK" && Array.isArray(data.data)) {
          const discountMap: Record<string, number> = {};
          data.data.forEach((item: Discount) => {
            discountMap[item.discountDate] = item.discountPercentage / 100;
          });
          setDiscounts(discountMap);
        }
      } catch (error) {
        console.error("Error fetching discounts:", error);
      }
    };

    fetchDiscounts();
  }, [property]);

  React.useEffect(() => {
    if (date?.from && !isSameMonth(date.from, currentMonth) && !isSameMonth(date.from, rightMonth)) {
      setCurrentMonth(date.from);
    }
  }, [date?.from]);


  React.useEffect(() => {
    dispatch(fetchRoomRates(currentMonth));
  }, [property]);

  // Custom day content renderer - separated from the Day component
  const renderDayContents = (day: Date) => {

    const formattedDate = format(day, "yyyy-MM-dd");
    const rateInfo = roomRates.find(rate => rate.date === formattedDate);

    if (!rateInfo) return <div>{format(day, "d")}</div>; // If no rate, just show the date

    const originalPrice = rateInfo.minimumRate;
    const discount = discounts[formattedDate] || 0;
    const discountedPrice = Math.round(originalPrice * (1 - discount) * 100) / 100;

    const isRangeEnd = date?.from && date?.to &&
      (day.getTime() === date.from.getTime() || day.getTime() === date.to.getTime());

    return (
      <>
        <div>{format(day, "d")}</div>
        <div className={`text-xs mt-1 font-medium ${isRangeEnd ? 'text-white' : ''}`}>
          {discount > 0 ? (
            <>
              <span className="line-through text-gray-500">${originalPrice.toFixed(2)}</span>
              <br />
              <span className="text-gray-500">${discountedPrice.toFixed(2)}</span>
            </>
          ) : (
            <span>${originalPrice.toFixed(2)}</span>
          )}
        </div>
      </>
    );
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
              <CalendarIcon className="h-5 w-5 text-gray-500" />
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
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={nextMonth}
                    className="h-6 w-6 flex items-center justify-center mx-1"
                  >
                    <ChevronRight className="w-4 h-4" />
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
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="h-6 w-6 flex items-center justify-center mx-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center p-4">Loading room rates...</div>
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
                  day_range_start: { backgroundColor: "#26266D", color: "white", fontWeight: "bold" },
                  day_range_end: { backgroundColor: "#26266D", color: "white", fontWeight: "bold" },
                  day_range_middle: { backgroundColor: "#C1C2C2", color: "black" }
                }}
                classNames={{
                  months: "flex space-x-9",
                  month: "w-full relative",
                  caption: "hidden",
                  nav: "hidden",
                  table: "w-full border-collapse",
                  head_row: "flex justify-between text-gray-600 text-sm font-medium mb-2",
                  head_cell: "w-10 text-center",
                  row: "flex justify-between gap-2",
                  cell: "w-[3.125rem] h-[2.5rem] flex flex-col items-start justify-center mb-7",
                  day: "h-[2.5rem] w-[3.125rem] flex flex-col items-center justify-center",
                  day_selected: "!bg-[#26266D] !text-white !font-bold !p-1 !min-h-15",
                  day_range_start: "!bg-[#26266D] !text-white !font-bold !p-1",
                  day_range_end: "!bg-[#26266D] !text-white !font-bold !p-1",
                  day_range_middle: "!bg-[#C1C2C2] !text-black",
                  day_disabled: "!text-gray-400 !cursor-not-allowed",
                }}
                formatters={{
                  formatDay: (date) => {
                    return (
                      <div className="flex flex-col items-center justify-center h-full">
                        {renderDayContents(date)}
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