import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Button,
    Checkbox,
    Slider,
} from "./ui";
import { useDispatch } from "react-redux";
import { resetFilters, updateFilter } from "../redux/filterSlice";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api-client";
import { useAppSelector } from "../redux/hooks";
import { PulseLoader } from "react-spinners";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/Select";

interface Property {
    propertyId: number;
    propertyName: string;
}

function RoomFilters() {
    const dispatch = useDispatch();
    const [allAmenities, setAllAmenities] = useState<string[]>([]);
    const { tenantId } = useParams<{ tenantId: string }>();
    const filter = useAppSelector((state) => state.roomFilters.filter);
    const globalConfig = useAppSelector((state) => state.config.globalConfig);
    const configLoading = !globalConfig;

    const { bedTypes, ratings, amenities, roomSize, propertyId } = filter;

    const roomsListConfig = useAppSelector(
        (state) => state.config.roomsListConfig
    );

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const allowedPropertyIds = globalConfig?.configData.properties || [];

    useEffect(() => {
        const roomSizeConfig =
            roomsListConfig?.configData.filters.filterGroups.roomSize;
        if (!roomSizeConfig || roomSize[0] !== 0 || roomSize[1] !== 0) return;

        const initialRoomSize: [number, number] = [
            roomSizeConfig.min,
            roomSizeConfig.max,
        ];
        dispatch(updateFilter({ roomSize: initialRoomSize }));
    }, [dispatch, roomsListConfig, roomSize]);

    useEffect(() => {
        const fetchAmenities = async () => {
            if (!tenantId || !propertyId) return;
            const response = await api.getAmenities(tenantId, propertyId);
            setAllAmenities(response.data);
        };
        fetchAmenities();
    }, [tenantId, propertyId]);

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            if (!tenantId) {
                console.error("Tenant ID is not available");
                return;
            }
            const propertiesData = await api.getProperties(tenantId);
            setProperties(propertiesData);
        } catch (err) {
            console.error("Error fetching properties:", err);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const isPropertyEnabled = (propertyId: number): boolean => {
        return allowedPropertyIds.includes(propertyId);
    };

    const handlePropertyChange = (propertyId: number) => {
        dispatch(updateFilter({ propertyId }));
    };

    // Get selected property name for display
    const getSelectedPropertyName = () => {
        if (filter.propertyId === 0) return "";
        const property = properties.find(
            (p) => p.propertyId === filter.propertyId
        );
        return property ? property.propertyName : "";
    };

    if (!roomsListConfig || loading || configLoading) return null;

    const filterConfig = roomsListConfig.configData.filters;
    const ratingFilterConfig = filterConfig.filterGroups.ratings;
    const bedTypesConfig = filterConfig.filterGroups.bedTypes;
    const roomSizeConfig = filterConfig.filterGroups.roomSize;
    const amenitiesConfig = filterConfig.filterGroups.amenities;

    const handleSingleBedChange = () => {
        dispatch(
            updateFilter({
                bedTypes: {
                    ...bedTypes,
                    singleBed: !bedTypes.singleBed,
                },
            })
        );
    };

    const handleDoubleBedChange = () => {
        dispatch(
            updateFilter({
                bedTypes: {
                    ...bedTypes,
                    doubleBed: !bedTypes.doubleBed,
                },
            })
        );
    };

    const handleRatingChange = (rating: number) => {
        const newRatings = ratings.includes(rating)
            ? ratings.filter((r) => r !== rating)
            : [...ratings, rating];

        dispatch(updateFilter({ ratings: newRatings }));
    };

    const handleAmenityChange = (amenity: string) => {
        const newAmenities = amenities.includes(amenity)
            ? amenities.filter((a) => a !== amenity)
            : [...amenities, amenity];

        dispatch(updateFilter({ amenities: newAmenities }));
    };

    // This now updates local state only (not Redux)
    const handleRoomSizeChange = (values: number[]) => {
        dispatch(
            updateFilter({
                roomSize: [values[0], values[1]] as [number, number],
            })
        );
    };

    const handleResetFilters = () => {
        dispatch(resetFilters([roomSizeConfig.min, roomSizeConfig.max]));
    };

    if (loading || configLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <PulseLoader color="var(--primary)" size={10} />
            </div>
        );
    }

    return (
        <div className="w-[293px] p-8 bg-[#EFF0F1] rounded-[5px] min-h-[290px] max-h-fit">
            <div className="flex justify-between items-center mb-4 font-bold">
                <h2 className="font-700">Narrow your results</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-xs text-primary hover:bg-primary/10 cursor-pointer"
                >
                    Reset All
                </Button>
            </div>

            <Accordion type="single" collapsible className="w-full">
                {/* Property Selector */}
                <AccordionItem value="property-filter">
                    <AccordionTrigger>Property</AccordionTrigger>
                    <AccordionContent>
                        {properties
                            .filter((property) =>
                                isPropertyEnabled(property.propertyId)
                            )
                            .map((property) => (
                                <div
                                    key={property.propertyId}
                                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                        filter.propertyId ===
                                        property.propertyId
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-gray-100"
                                    }`}
                                    onClick={() =>
                                        handlePropertyChange(
                                            property.propertyId
                                        )
                                    }
                                >
                                    <span className="text-sm">
                                        {property.propertyName}
                                    </span>
                                </div>
                            ))}
                    </AccordionContent>
                </AccordionItem>

                {ratingFilterConfig.enabled && (
                    <AccordionItem value="rating-filter">
                        <AccordionTrigger>
                            {ratingFilterConfig.label}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-3">
                                {ratingFilterConfig.options
                                    .filter((option) => option.enabled)
                                    .map((option) => {
                                        return (
                                            <div
                                                key={option.value}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`rating-${option.value}`}
                                                    checked={ratings.includes(
                                                        option.value
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleRatingChange(
                                                            option.value
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={`rating-${option.value}`}
                                                    className="text-sm text-gray-700"
                                                >
                                                    {option.label}
                                                </label>
                                            </div>
                                        );
                                    })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {bedTypesConfig.enabled && (
                    <AccordionItem value="bed-type-filter">
                        <AccordionTrigger>
                            {bedTypesConfig.label}
                        </AccordionTrigger>
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
                )}

                {roomSizeConfig.enabled && (
                    <AccordionItem value="room-size-filter">
                        <AccordionTrigger>
                            {roomSizeConfig.label}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <div className="pt-2">
                                    <Slider
                                        value={roomSize}
                                        min={roomSizeConfig.min}
                                        max={roomSizeConfig.max}
                                        step={roomSizeConfig.max / 10}
                                        onValueChange={handleRoomSizeChange}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-sm font-medium">
                                        <span className="text-gray-700">
                                            Min:{" "}
                                        </span>
                                        <span className="text-primary">
                                            {roomSize[0]} sqft
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium">
                                        <span className="text-gray-700">
                                            Max:{" "}
                                        </span>
                                        <span className="text-primary">
                                            {roomSize[1]} sqft
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-700 mt-2">
                                    {`Selected range: ${roomSize[0]} - ${roomSize[1]} sqft`}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {amenitiesConfig.enabled && (
                    <AccordionItem value="amenities-filter">
                        <AccordionTrigger>
                            {amenitiesConfig.label}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-3 max-h-[200px] overflow-y-auto pr-2 rounded-md border border-gray-200 p-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                {allAmenities.map((amenity) => (
                                    <div
                                        key={amenity}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={amenity}
                                            checked={amenities.includes(
                                                amenity
                                            )}
                                            onCheckedChange={() =>
                                                handleAmenityChange(amenity)
                                            }
                                        />
                                        <label
                                            htmlFor={amenity}
                                            className="text-sm text-gray-700"
                                        >
                                            {amenity}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </div>
    );
}

export default RoomFilters;
