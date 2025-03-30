import {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {Select, SelectContent, SelectTrigger, SelectValue} from "./Select";
import {Button} from "./Button";
import toast from "react-hot-toast";
import {updateFilter} from "../../redux/filterSlice";

export interface GuestSelectorProps {
    roomCount: number;
}

export function GuestSelector({roomCount}: Readonly<GuestSelectorProps>) {
    const dispatch = useAppDispatch();
    const guestOptions = useAppSelector(
        (state) =>
            state.config.landingConfig?.configData.searchForm.guestOptions
    );

    // Track guest counts locally since they're not stored by category in Redux anymore
    const allGuests = useAppSelector(
        (state) => state.roomFilters.filter.guests
    );
    console.log(allGuests);
    const totalGuests = Object.values(allGuests).reduce(
        (sum, count) => sum + count,
        0
    );

    console.log(totalGuests);
    useEffect(() => {
        if (guestOptions?.categories) {
            if (totalGuests === 0 && Object.keys(allGuests).length === 0) {
                const initialCounts: Record<string, number> = {};

                guestOptions.categories.forEach((category) => {
                    if (category.enabled) {
                        initialCounts[category.name] = category.default || 0;
                    }
                });

                dispatch(
                    updateFilter({
                        guests: initialCounts,
                    })
                );
            }
        }
    }, [guestOptions, dispatch, totalGuests, allGuests]);

    // Calculate max guests allowed per room - if not defined in config, default to 4
    const maxGuestsPerRoom = 4; // Default value
    const totalMaxGuests = maxGuestsPerRoom * roomCount;

    const handleChange = (categoryName: string, increment: boolean) => {
        if (!guestOptions?.categories) return;

        const category = guestOptions.categories.find(
            (c) => c.name === categoryName
        );
        if (!category?.enabled) return;

        // Check minimum guests requirement for the whole booking
        if (!increment && totalGuests <= guestOptions.min) {
            toast.error(`Minimum of ${guestOptions.min} guest required`);
            return;
        }

        // Check if incrementing would exceed the total max guests
        if (increment && totalGuests >= totalMaxGuests) {
            toast.error(
                `Maximum of ${totalMaxGuests} guests allowed for ${roomCount} room${
                    roomCount > 1 ? "s" : ""
                }`
            );
            return;
        }

        // Get current count for this category
        const currentCount = allGuests[categoryName] || 0;

        // Check category specific limits
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

        // If all checks pass, update the local state and Redux
        const newCounts = {
            ...allGuests,
            [categoryName]: increment ? currentCount + 1 : currentCount - 1,
        };

        // Update totalGuests in Redux
        dispatch(
            updateFilter({
                guests: newCounts,
            })
        );
    };

    if (!guestOptions?.enabled) return null;

    return (
        <div>
            <Select>
                <SelectTrigger
                    className="w-full px-[1.1875rem] py-[0.75rem] !h-[3rem] text-[#858685] rounded-[0.25rem] border border-gray-300">
                    <SelectValue
                        placeholder={`${totalGuests} ${
                            totalGuests === 1 ? "Guest" : "Guests"
                        }`}
                        style={{
                            fontStyle: "italic",
                            color: "#2F2F2F",
                            fontWeight: "normal",
                        }}
                    />
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
                                                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-transparent"
                                                onClick={() =>
                                                    handleChange(
                                                        category.name,
                                                        false
                                                    )
                                                }
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
                                                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-transparent"
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
}
