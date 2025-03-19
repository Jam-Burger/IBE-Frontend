"use client";

import * as React from "react";
import { addDays, format, startOfToday, differenceInDays, isBefore } from "date-fns";
import { CalendarIcon } from "lucide-react";
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

  const handleSelect = (newRange: DateRange | undefined) => {
    if (newRange?.from && newRange?.to) {
      const diff = differenceInDays(newRange.to, newRange.from);
      if (diff > 14) return; // Restrict selection to max 14 days
    }
    setDate(newRange);
  };

  // ✅ Fixed function (always returns a boolean)
  const isDisabled = (day: Date): boolean => {
    return (
      isBefore(day, today) || // Always disable past days
      (date?.from ? isBefore(day, date.from) : false) // Disable all days before the selected start date
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
              "w-[270px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
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
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={isDisabled} // ✅ Fixed
            modifiers={{
              disabled: isDisabled, // ✅ Fixed
            }}
            modifiersStyles={{
              disabled: { textDecoration: "line-through", color: "#999" }, // Styling for struck-through days
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
