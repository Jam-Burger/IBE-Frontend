import {DayPicker, DayPickerProps} from "react-day-picker"
import {cn} from "../../lib/utils"
import {buttonVariants} from "./Button"

function Calendar({
                      className,
                      classNames,
                      showOutsideDays = true,
                      ...props
                  }: DayPickerProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-1 sm:p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row gap-2",
                month: "flex flex-col gap-2 sm:gap-4",
                caption: "flex justify-center pt-1 relative items-center w-full",
                caption_label: "text-sm font-medium",
                nav: "flex items-center gap-1",
                nav_button: cn(
                    buttonVariants({variant: "outline"}),
                    "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse",
                head_row: "flex justify-between",
                head_cell:
                    "text-muted-foreground rounded-md w-[50px] font-normal text-[0.7rem] sm:text-[0.8rem] text-center",
                row: "flex justify-between mt-1 sm:mt-2",
                cell: cn(
                    "relative p-0 text-center text-xs sm:text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md w-[50px]",
                    props.mode === "range"
                        ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        : "[&:has([aria-selected])]:rounded-md"
                ),
                day: cn(
                    buttonVariants({variant: "ghost"}),
                    "w-[50px] h-[50px] sm:h-[60px] p-0 font-normal aria-selected:opacity-100"
                ),
                day_range_start:
                    "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
                day_range_end:
                    "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                    "day-outside text-muted-foreground aria-selected:text-muted-foreground",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            {...props}
        />
    )
}

export {Calendar}
