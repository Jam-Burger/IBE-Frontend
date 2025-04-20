import {useCallback, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {Select, SelectContent, SelectTrigger, SelectValue} from "./Select";
import {Button} from "./Button";
import toast from "react-hot-toast";
import {updateFilter} from "../../redux/filterSlice.ts";
import {generateSummeryText} from "../../lib/utils.ts";
import {Label} from "./Label";

export interface GuestSelectorProps {
    roomCount: number;
    showDetailedSummary?: boolean;
    className?: string;
    height?: string;
    value?: Record<string, number>;
    onChange?: (guests: Record<string, number>) => void;
    onValidationFail?: () => void;
}

export const GuestSelector = ({
                                  roomCount,
                                  showDetailedSummary = false,
                                  className,
                                  height,
                                  value,
                                  onChange,
                                  onValidationFail,
                              }: GuestSelectorProps) => {
    const dispatch = useAppDispatch();
    const guestOptions = useAppSelector(
        (state) =>
            state.config.landingConfig?.configData.searchForm.guestOptions
    );

    const filterGuests = useAppSelector((state) => state.roomFilters.filter.guests);
    const allGuests = value || filterGuests;
    const totalGuests = Object.values(allGuests).reduce(
        (sum, count) => sum + count,
        0
    );
    const adultCount = allGuests["Adults"] ?? null;

    // Minimum adults per room validation
    const validateAdultsPerRoom = useCallback(() => {
        const minAdultsPerRoom = 1;
        if (adultCount != null && adultCount < roomCount * minAdultsPerRoom) {
            toast.error(`Please add at least ${minAdultsPerRoom} adult per room. Current: ${adultCount} adults for ${roomCount} rooms`);
            if (onValidationFail) {
                onValidationFail();
            }
            return false;
        }
        return true;
    }, [adultCount, roomCount, onValidationFail]);

    useEffect(() => {
        validateAdultsPerRoom();
    }, [validateAdultsPerRoom]);

    useEffect(() => {
        if (guestOptions?.categories) {
            if (totalGuests === 0 && Object.keys(allGuests).length === 0) {
                const initialCounts: Record<string, number> = {};

                guestOptions.categories.forEach((category) => {
                    if (category.enabled) {
                        initialCounts[category.name] = category.default || 0;
                    }
                });

                if (onChange) {
                    onChange(initialCounts);
                } else {
                    dispatch(
                        updateFilter({
                            guests: initialCounts,
                        })
                    );
                }
            }
        }
    }, [guestOptions, dispatch, totalGuests, allGuests, onChange]);

    const maxGuestsPerRoom = 4;
    const totalMaxGuests = maxGuestsPerRoom * roomCount;

    const handleChange = (categoryName: string, increment: boolean) => {
        if (!guestOptions?.categories) return;

        const category = guestOptions.categories.find(
            (c) => c.name === categoryName
        );
        if (!category?.enabled) return;

        const currentCount = allGuests[categoryName] || 0;
        const newCount = increment ? currentCount + 1 : currentCount - 1;
        const newAdultCount = categoryName === "Adults" ?
            adultCount + (increment ? 1 : -1) :
            adultCount;

        // Check minimum adults
        if (categoryName === "Adults" && !increment && newAdultCount < roomCount) {
            toast.error(`You need at least ${roomCount} adult${roomCount > 1 ? 's' : ''} for ${roomCount} room${roomCount > 1 ? 's' : ''}`);
            return;
        }

        if (!increment && totalGuests <= guestOptions.min) {
            toast.error(`Minimum of ${guestOptions.min} guest required`);
            return;
        }

        if (increment && totalGuests >= totalMaxGuests) {
            toast.error(
                `Maximum of ${totalMaxGuests} guests allowed for ${roomCount} room${
                    roomCount > 1 ? "s" : ""
                }`
            );
            return;
        }

        if (increment && currentCount >= category.max) {
            toast.error(
                `Maximum of ${
                    category.max
                } ${category.name.toLowerCase()} allowed`
            );
            return;
        } else if (!increment && currentCount <= category.min) {
            toast.error(
                `Minimum of ${
                    category.min
                } ${category.name.toLowerCase()} required`
            );
            return;
        }

        const newCounts = {
            ...allGuests,
            [categoryName]: newCount,
        };

        if (onChange) {
            onChange(newCounts);
        } else {
            dispatch(
                updateFilter({
                    guests: {...newCounts},
                })
            );
        }
    };

    const getSummaryText = () => {
        if (!showDetailedSummary) {
            return `${totalGuests} Guest${totalGuests !== 1 ? "s" : ""}`;
        }
        return generateSummeryText(allGuests);
    };

    if (!guestOptions?.enabled) return null;

    return (
        <div className={className}>
            <Select>
                <SelectTrigger
                    className={`w-full text-gray-500 ${
                        showDetailedSummary ? "min-h-[68px]" : ""
                    }`}
                    style={{
                        height: showDetailedSummary ? "auto" : height ?? "48px",
                        minHeight: showDetailedSummary
                            ? "68px"
                            : height ?? "48px",
                    }}
                >
                    {showDetailedSummary ? (
                        <div className="flex flex-col items-start w-[90%] text-left">
                            <Label
                                htmlFor="guests"
                                className="mb-1 block text-sm font-medium text-gray-500"
                            >
                                Guests
                            </Label>
                            <span className="text-base font-medium text-gray-900 truncate w-full overflow-hidden">
                                {getSummaryText()}
                            </span>
                        </div>
                    ) : (
                        <SelectValue placeholder={getSummaryText()}/>
                    )}
                </SelectTrigger>
                <SelectContent className="p-4 min-w-[300px]">
                    {guestOptions.categories.map(
                        (category) =>
                            category.enabled && (
                                <div
                                    key={category.name}
                                    className="flex flex-col mb-6 last:mb-2"
                                >
                                    {/* Counter controls */}
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-base text-[#2F2F2F]">
                                            {category.name}
                                        </span>
                                        <div className="flex items-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-transparent focus:ring-2 focus:ring-offset-2"
                                                onClick={() =>
                                                    handleChange(
                                                        category.name,
                                                        false
                                                    )
                                                }
                                                disabled={!allGuests[category.name]}
                                            >
                                                <span className="text-lg font-medium">
                                                    −
                                                </span>
                                            </Button>
                                            <span className="mx-4 text-center min-w-[20px] text-base">
                                                {allGuests[category.name] || 0}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-transparent focus:ring-2 focus:ring-offset-2"
                                                onClick={() =>
                                                    handleChange(
                                                        category.name,
                                                        true
                                                    )
                                                }
                                            >
                                                <span className="text-lg font-medium">
                                                    +
                                                </span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Age range label below */}
                                    <div className="text-xs text-gray-500">
                                        {category.label}
                                    </div>
                                </div>
                            )
                    )}
                </SelectContent>
            </Select>
        </div>
    );
};
