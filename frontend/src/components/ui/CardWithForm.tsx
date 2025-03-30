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
import {useNavigate, useParams} from 'react-router-dom';
import {updateFilter} from "../../redux/filterSlice.ts";

interface Property {
    propertyId: number;
    propertyName: string;
}

// Add custom CSS to hide the right checkmark
const hideRightCheckmarkStyle = `
  .select-item-no-right-check [data-slot="select-item"] span.absolute {
    display: none !important;
  }
`;

const CardWithForm = () => {
    const {tenantId} = useParams<{ tenantId: string }>();
    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const filter = useAppSelector(state => state.roomFilters.filter);
    const {
        propertyId,
        roomCount,
        isAccessible
    } = filter;

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
        dispatch(updateFilter({propertyId}));
    };

    const handleRoomCountChange = (value: string) => {
        dispatch(updateFilter({roomCount: parseInt(value, 10)}));
    };

    const handleAccessibilityChange = (checked: boolean) => {
        dispatch(updateFilter({isAccessible: checked}));
    };

    // Get selected property name for display
    const getSelectedPropertyName = () => {
        if (propertyId === 0) return "";
        const property = properties.find(p => p.propertyId === propertyId);
        return property ? property.propertyName : "";
    };

    const handleSearch = () => {
        navigate(`/${tenantId}/rooms-list`);
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
            {/* Add the style tag to inject our custom CSS */}
            <style>{hideRightCheckmarkStyle}</style>

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
                                {propertyId === 0 &&
                                    <p className="text-muted-foreground italic font-light">Search all properties</p>}
                                {propertyId !== 0 && (
                                    <span>{getSelectedPropertyName()}</span>
                                )}
                            </SelectTrigger>
                            <SelectContent position="popper" className="select-item-no-right-check">
                                {/* Dynamic Properties */}
                                {properties.map((property) => (
                                    <SelectItem
                                        key={property.propertyId}
                                        value={property.propertyId.toString()}
                                        disabled={!isPropertyEnabled(property.propertyId)}
                                    >
                                        <div className="flex items-center w-full">
                                            <Checkbox
                                                id={`property-${property.propertyId}`}
                                                className="mr-2 data-[state=checked]:bg-primary text-white data-[state=checked]:text-white border-[#C1C2C2]"
                                                checked={propertyId === property.propertyId}
                                                onClick={() => handlePropertyChange(property.propertyId)}
                                            />
                                            <span>{property.propertyName}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Label>Select dates</Label>
                        {propertyId !== 0 ? (
                            <DatePickerWithRange
                                propertyId={propertyId}
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
                                    <GuestSelector roomCount={roomCount}/>
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
                                    <Select value={roomCount.toString()} onValueChange={handleRoomCountChange}>
                                        <SelectTrigger id="rooms" className="w-full text-gray-500 min-h-[48px]">
                                            <SelectValue placeholder={roomCount.toString()}/>
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
                            <Checkbox
                                id="accessible-room"
                                checked={isAccessible}
                                onCheckedChange={handleAccessibilityChange}
                            />
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
                    disabled={propertyId === 0}
                    onClick={handleSearch}
                >
                    SEARCH
                </Button>
            </CardFooter>
        </Card>
    );
}

export default CardWithForm;