import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Button,
    Checkbox,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Slider
} from "./ui";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {
    resetFilters,
    setAmenities,
    setPriceRange,
    setRatings,
    setRoomSize,
    setSortOption,
    SortOption,
    toggleDoubleBed,
    toggleSingleBed
} from "../redux/filterSlice";

function RoomFilters() {
    const dispatch = useDispatch();
    const {
        bedTypes,
        ratings,
        amenities,
        priceRange,
        roomSize,
        sortBy
    } = useSelector((state: RootState) => state.roomFilters);

    // Handle bed type changes
    const handleSingleBedChange = () => {
        dispatch(toggleSingleBed());
    };

    const handleDoubleBedChange = () => {
        dispatch(toggleDoubleBed());
    };

    // Handle ratings change
    const handleRatingChange = (rating: string) => {
        const newRatings = ratings.includes(rating)
            ? ratings.filter(r => r !== rating)
            : [...ratings, rating];
        dispatch(setRatings(newRatings));
    };

    // Handle amenities change
    const handleAmenityChange = (amenity: string) => {
        const newAmenities = amenities.includes(amenity)
            ? amenities.filter(a => a !== amenity)
            : [...amenities, amenity];
        dispatch(setAmenities(newAmenities));
    };

    // Handle price range change
    const handlePriceRangeChange = (values: number[]) => {
        dispatch(setPriceRange([values[0], values[1]]));
    };

    // Handle room size change
    const handleRoomSizeChange = (values: number[]) => {
        dispatch(setRoomSize([values[0], values[1]]));
    };

    // Handle sort option change
    const handleSortChange = (value: string) => {
        dispatch(setSortOption(value as SortOption));
    };

    // Handle reset filters
    const handleResetFilters = () => {
        dispatch(resetFilters());
    };

    return (
        <div className="w-[293px] p-8 bg-[#EFF0F1] rounded-[5px] min-h-[290px] max-h-fit">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-700">Narrow your results</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-xs text-primary hover:bg-primary/10"
                >
                    Reset All
                </Button>
            </div>

            <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort options"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={SortOption.PRICE_LOW_TO_HIGH}>Price: Low to High</SelectItem>
                        <SelectItem value={SortOption.PRICE_HIGH_TO_LOW}>Price: High to Low</SelectItem>
                        <SelectItem value={SortOption.RATING_HIGH_TO_LOW}>Rating: High to Low</SelectItem>
                        <SelectItem value={SortOption.CAPACITY_HIGH_TO_LOW}>Capacity: High to Low</SelectItem>
                        <SelectItem value={SortOption.ROOM_SIZE_LARGE_TO_SMALL}>Room Size: Large to Small</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>Popularity</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="five-star"
                                    checked={ratings.includes("five-star")}
                                    onCheckedChange={() => handleRatingChange("five-star")}
                                />
                                <label
                                    htmlFor="five-star"
                                    className="text-sm text-gray-700"
                                >
                                    5 Star
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="four-star"
                                    checked={ratings.includes("four-star")}
                                    onCheckedChange={() => handleRatingChange("four-star")}
                                />
                                <label
                                    htmlFor="four-star"
                                    className="text-sm text-gray-700"
                                >
                                    4 Star
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="three-star"
                                    checked={ratings.includes("three-star")}
                                    onCheckedChange={() => handleRatingChange("three-star")}
                                />
                                <label
                                    htmlFor="three-star"
                                    className="text-sm text-gray-700"
                                >
                                    3 Star
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="less-than-three"
                                    checked={ratings.includes("less-than-three")}
                                    onCheckedChange={() => handleRatingChange("less-than-three")}
                                />
                                <label
                                    htmlFor="less-than-three"
                                    className="text-sm text-gray-700"
                                >
                                    Less than 3 Star
                                </label>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Bed Type</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="single-bed"
                                    checked={bedTypes.singleBed}
                                    onCheckedChange={handleSingleBedChange}
                                />
                                <label
                                    htmlFor="single-bed"
                                    className="text-sm text-gray-700"
                                >
                                    Single Bed
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="double-bed"
                                    checked={bedTypes.doubleBed}
                                    onCheckedChange={handleDoubleBedChange}
                                />
                                <label
                                    htmlFor="double-bed"
                                    className="text-sm text-gray-700"
                                >
                                    Double Bed
                                </label>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Price</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="pt-2">
                                <Slider
                                    value={priceRange}
                                    min={0}
                                    max={1000}
                                    step={10}
                                    onValueChange={handlePriceRangeChange}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-sm font-medium">
                                    <span className="text-gray-700">Min: </span>
                                    <span className="text-primary">
                                        ${priceRange[0]}
                                    </span>
                                </div>
                                <div className="text-sm font-medium">
                                    <span className="text-gray-700">Max: </span>
                                    <span className="text-primary">
                                        ${priceRange[1]}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-700 mt-2">
                                Selected range: ${priceRange[0]} - $
                                {priceRange[1]}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>Room Size</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="pt-2">
                                <Slider
                                    value={roomSize}
                                    min={0}
                                    max={2000}
                                    step={50}
                                    onValueChange={handleRoomSizeChange}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-sm font-medium">
                                    <span className="text-gray-700">Min: </span>
                                    <span className="text-primary">
                                        {roomSize[0]} sqft
                                    </span>
                                </div>
                                <div className="text-sm font-medium">
                                    <span className="text-gray-700">Max: </span>
                                    <span className="text-primary">
                                        {roomSize[1]} sqft
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-700 mt-2">
                                Selected range: {roomSize[0]} - {roomSize[1]} sqft
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                    <AccordionTrigger>Amenities</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="wifi"
                                    checked={amenities.includes("wifi")}
                                    onCheckedChange={() => handleAmenityChange("wifi")}
                                />
                                <label
                                    htmlFor="wifi"
                                    className="text-sm text-gray-700"
                                >
                                    WiFi
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="breakfast"
                                    checked={amenities.includes("breakfast")}
                                    onCheckedChange={() => handleAmenityChange("breakfast")}
                                />
                                <label
                                    htmlFor="breakfast"
                                    className="text-sm text-gray-700"
                                >
                                    Breakfast
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="pool"
                                    checked={amenities.includes("pool")}
                                    onCheckedChange={() => handleAmenityChange("pool")}
                                />
                                <label
                                    htmlFor="pool"
                                    className="text-sm text-gray-700"
                                >
                                    Pool
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="spa"
                                    checked={amenities.includes("spa")}
                                    onCheckedChange={() => handleAmenityChange("spa")}
                                />
                                <label
                                    htmlFor="spa"
                                    className="text-sm text-gray-700"
                                >
                                    Spa
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="gym"
                                    checked={amenities.includes("gym")}
                                    onCheckedChange={() => handleAmenityChange("gym")}
                                />
                                <label
                                    htmlFor="gym"
                                    className="text-sm text-gray-700"
                                >
                                    Gym
                                </label>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

export default RoomFilters;