import {useCallback, useEffect, useState} from "react";
import {
    Button,
    Card,
    CardContent,
    CardFooter,
    Checkbox,
    DatePickerWithRange,
    GuestSelector,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./";
import {api} from "../../lib/api-client";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {PulseLoader} from "react-spinners";
import {FaWheelchair} from "react-icons/fa";
import {useParams} from 'react-router-dom';
import {setPropertyId} from "../../redux/filterSlice.ts";

interface Property {
    propertyId: number;
    propertyName: string;
}

const CardWithForm = () => {
    const {tenantId} = useParams<{ tenantId: string }>();

    const dispatch = useAppDispatch();
    const selectedPropertyId = useAppSelector(state => state.roomFilters.propertyId);

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const AccessibilityIcon = FaWheelchair;

    const searchForm = useAppSelector(state => state.config.landingConfig?.configData.searchForm);
    const globalConfig = useAppSelector(state => state.config.globalConfig);
    const configLoading = !searchForm || !globalConfig;

    const allowedPropertyIds = globalConfig?.configData.properties || [];

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
        dispatch(setPropertyId(propertyId));
    };

    const getSelectedPropertyName = () => {
        if (selectedPropertyId === null) return "";
        const property = properties.find(p => p.propertyId === selectedPropertyId);
        return property ? property.propertyName : "";
    };

    if (loading || configLoading) {
        return (
            <Card className="w-[380px] h-[585px] p-4 shadow-lg rounded-lg flex items-center justify-center">
                <PulseLoader color="var(--primary)" size={10}/>
            </Card>
        );
    }

    return (
        <Card className="w-[380px] h-[585px] py-8 sm:py-12 px-4 sm:px-8 shadow-lg rounded-lg mx-auto">
            <CardContent className="flex flex-col h-full">
                <form className="space-y-4 flex-1">
                    {/* Property Name */}
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="property">Property name</Label>
                        <Select>
                            <SelectTrigger
                                id="property"
                                className="w-full min-h-[48px] text-gray-700 px-4 py-2 flex items-center border border-gray-200 shadow-sm rounded-md"
                            >
                                {selectedPropertyId === null &&
                                    <p className="text-muted-foreground italic font-light">Search all properties</p>}
                                {selectedPropertyId !== null && (
                                    <span>{getSelectedPropertyName()}</span>
                                )}
                            </SelectTrigger>
                            <SelectContent position="popper">
                                {/* Dynamic Properties */}
                                {properties.map((property) => (
                                    <SelectItem
                                        key={property.propertyId}
                                        value={property.propertyId.toString()}
                                        disabled={!isPropertyEnabled(property.propertyId)}
                                        onClick={() => handlePropertyChange(property.propertyId)}
                                    >
                                        <Checkbox
                                            className="mr-2 data-[state=checked]:bg-primary text-white data-[state=checked]:text-white border-[#C1C2C2]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        />
                                        {property.propertyName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Label>Select dates</Label>
                        {selectedPropertyId !== null ? (
                            <DatePickerWithRange
                                propertyId={selectedPropertyId}
                                disabled={false}
                            />
                        ) : (
                            <DatePickerWithRange
                                propertyId={0}
                                disabled={true}
                            />
                        )}
                    </div>

                    {/* Guests & Rooms */}
                    {searchForm.guestOptions && searchForm.roomOptions && (
                        <div className={searchForm.guestOptions.enabled && searchForm.roomOptions.enabled
                            ? "flex gap-2"
                            : "w-full"
                        }>
                            {searchForm.guestOptions.enabled && (
                                <div
                                    className={`flex flex-col space-y-1 ${searchForm.roomOptions.enabled
                                        ? 'flex-6'
                                        : 'w-full'
                                    }`}
                                >
                                    <Label htmlFor="guests">Guests</Label>
                                    <GuestSelector/>
                                </div>
                            )}

                            {searchForm.roomOptions.enabled && (
                                <div
                                    className={`flex flex-col space-y-1 ${searchForm.guestOptions.enabled
                                        ? 'flex-4'
                                        : 'w-full'
                                    }`}
                                >
                                    <Label htmlFor="rooms">Rooms</Label>
                                    <Select>
                                        <SelectTrigger id="rooms" className="w-full text-gray-500 min-h-[48px]">
                                            <SelectValue placeholder="1"/>
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            {/* Dynamic Room Options */}
                                            {[...Array(searchForm.roomOptions.max)].map((_, i) => (
                                                <SelectItem key={i} value={String(i + 1)}>
                                                    {i + 1}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Accessible Room Checkbox with Wheelchair Icon */}
                    {searchForm.accessibility && searchForm.accessibility.enabled && (
                        <div className="flex items-center space-x-2">
                            <Checkbox id="accessible-room"/>
                            <div className="flex items-center space-x-2">
                                <AccessibilityIcon className="text-primary text-lg" aria-hidden="true"/>
                                <Label htmlFor="accessible-room" className="text-sm">
                                    {searchForm.accessibility.label}
                                </Label>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>

            {/* Submit Button */}
            <CardFooter className="flex justify-center mt-[60px] sm:mt-[100px]">
                <Button
                    className="bg-[#2A1D64] text-white px-6 py-6 rounded-lg w-[140px] h-[44px]"
                    disabled={selectedPropertyId === null}
                >
                    SEARCH
                </Button>
            </CardFooter>
        </Card>
    );
}

export default CardWithForm;