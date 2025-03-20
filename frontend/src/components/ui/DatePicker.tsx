"use client";

import * as React from "react";
import { addDays, format, startOfToday, differenceInDays, isBefore } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

// Define a type for price data
type PriceData = {
  [date: string]: number;
};

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const today = startOfToday();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: today,
    to: addDays(today, 7),
  });

  // Sample price data - create this only once to avoid re-renders
  const priceData = React.useMemo(() => {
    const data: PriceData = {};
    for (let i = 0; i < 60; i++) {
      const day = addDays(today, i);
      const price = Math.floor(Math.random() * 70) + 80;
      data[format(day, 'yyyy-MM-dd')] = price;
    }
    return data;
  }, [today]);

  const handleSelect = (newRange: DateRange | undefined) => {
    if (newRange?.from && newRange?.to) {
      const diff = differenceInDays(newRange.to, newRange.from);
      if (diff > 14) return; // Restrict selection to max 14 days
    }
    setDate(newRange);
  };

  // Disabled date function
  const isDisabled = (day: Date): boolean => {
    return (
      isBefore(day, today) || 
      (date?.from && !date.to ? differenceInDays(day, date.from) > 14 : false)
    );
  };

  // Create custom day cell content renderer
  const renderDayContents = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const price = priceData[dateKey];
    
    return (
      <>
        <div>{format(day, 'd')}</div>
        {price !== undefined && (
          <div className="text-xs text-gray-500 font-medium">
            ${price}
          </div>
        )}
      </>
    );
  };

  return (
    <div className={cn("grid gap-2", className)}>
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
        <PopoverContent className="w-auto p-0" align="start">
          <div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={isDisabled}
              formatters={{
                formatDay: (date) => (
                  <div className="h-9 w-9 p-0 relative flex flex-col items-center justify-center">
                    {renderDayContents(date)}
                  </div>
                )
              }}
              classNames={{
                day: cn("h-12 w-12 p-2 font-normal aria-selected:opacity-100 flex items-center justify-center m-1 bg-white"),
                cell: cn("h-12 w-12 p-2 font-normal aria-selected:opacity-100 m-1"),
                day_selected: "!bg-[#26266D] !text-white !font-bold",
                day_range_start: "!bg-[#26266D] !text-white !font-bold",
                day_range_end: "!bg-[#26266D] !text-white !font-bold",
                day_range_middle: "!bg-[#E5E5E5] !text-black", 
                day_disabled: "!text-gray-400 !cursor-not-allowed",
              }}
              
              
              

              
            />
          </div>
          <div className="p-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-red-500 text-sm">
              {date?.from && date?.to && differenceInDays(date.to, date.from) > 14 
                ? "Please select end date. Max. length of stay: 14 days" 
                : ""}
            </span>
            <Button className="bg-[#26266D]" disabled={!date?.from || !date?.to}>
              APPLY DATES
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
