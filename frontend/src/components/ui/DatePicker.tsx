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
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";




export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const today = startOfToday();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: today,
    to: addDays(today, 7),
  });

  // State to track current month display
  const [currentMonth, setCurrentMonth] = React.useState<Date>(today);
  
  // State to store room rates
  const [roomRates, setRoomRates] = React.useState<RoomRate[]>([]);

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
  
  // Function to get price for a specific date
  const getPriceForDate = (day: Date): number | null => {
    const formattedDate = format(day, "yyyy-MM-dd");
    const rateInfo = roomRates.find(rate => rate.date === formattedDate);
    return rateInfo ? rateInfo.minimumRate : null;
  };

  // Function to fetch room rates without disrupting existing data
  interface RoomRate {
    date: string;
    minimumRate: number;
  }
  
  const fetchRoomRates = async () => {
    try {
      const startDate = format(subMonths(currentMonth, 1), "yyyy-MM-dd");
      const endDate = format(addMonths(currentMonth, 3), "yyyy-MM-dd");
  
      const response = await fetch(
        `http://localhost:8080/api/v1/1/1/room-rates/daily-minimum?startDate=${startDate}&endDate=${endDate}`
      );
      const result: { statusCode: string; data: RoomRate[] } = await response.json();
  
      if (result.statusCode === "OK" && Array.isArray(result.data)) {
        setRoomRates((prevRates) => {
          const existingDates = new Set(prevRates.map((rate) => rate.date));
  
          const newRates = result.data.filter((rate: RoomRate) => 
            typeof rate.date === "string" && 
            typeof rate.minimumRate === "number" &&
            !existingDates.has(rate.date)
          );
  
          return [...prevRates, ...newRates];
        });
      }
    } catch (error) {
      console.error("Error fetching room rates:", error);
    }
  };
  

  React.useEffect(() => {
    if (date?.from && !isSameMonth(date.from, currentMonth) && !isSameMonth(date.from, rightMonth)) {
      setCurrentMonth(date.from);
    }
  }, [date?.from]);
  
  // Initial fetch of room rates
  React.useEffect(() => {
    fetchRoomRates();
  }, []);
  
  // Fetch more room rates when current month changes, without replacing existing data
  React.useEffect(() => {
    fetchRoomRates();
  }, [currentMonth]);
  
  // Custom day content renderer - separated from the Day component
  const renderDayContents = (day: Date) => {
    const price = getPriceForDate(day);
    // const isSelectedDay = date?.from && date?.to && 
    //   ((day >= date.from && day <= date.to) || 
    //    day.getTime() === date.from.getTime() || 
    //    day.getTime() === date.to.getTime());
    
    const isRangeEnd = date?.from && date?.to && 
      (day.getTime() === date.from.getTime() || day.getTime() === date.to.getTime());
    
    return (
      <>
        <div>{format(day, "d")}</div>
        {price !== null && (
          <div className={`text-xs mt-1 font-medium ${isRangeEnd ? 'text-white' : ''}`}>
            ${price}
          </div>
        )}
      </>
    );
  };

  return (
    <div className={cn("relative", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
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
                months: "flex space-x-8",
                month: "w-full relative",
                caption: "hidden",
                nav: "hidden",
                table: "w-full border-collapse",
                head_row: "flex justify-between text-gray-600 text-sm font-medium mb-2",
                head_cell: "w-10 text-center",
                row: "flex justify-between gap-2", // Added gap-2 for horizontal spacing between date boxes
                cell: "w-12 h-10 flex flex-col items-center justify-center mb-5", // Added mb-2 for vertical spacing
                day: "h-10 w-12 flex flex-col items-center justify-center", 
                day_selected: "!bg-[#26266D] !text-white !font-bold",
                day_range_start: "!bg-[#26266D] !text-white !font-bold",
                day_range_end: "!bg-[#26266D] !text-white !font-bold",
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