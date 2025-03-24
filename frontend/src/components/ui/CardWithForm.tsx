import {useEffect, useState} from "react";
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
import {useAppSelector} from "../../redux/hooks";
import {PulseLoader} from "react-spinners";
// Import multiple accessibility icons from different icon sets
import {FaWheelchair} from "react-icons/fa";
import {useParams} from 'react-router-dom';

interface Property {
    propertyId: number;
    propertyName: string;
}

const CardWithForm = () => {
    const {tenantId} = useParams<{tenantId: string}>();
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    // Choose which icon to use (can be changed to any of the imported icons)
    const AccessibilityIcon = FaWheelchair;

    const searchForm = useAppSelector(state => state.config.landingConfig?.configData.searchForm);
    const globalConfig = useAppSelector(state => state.config.globalConfig);
    const configLoading = !searchForm || !globalConfig;

    // Get allowed property IDs from global config - these are numbers
    const allowedPropertyIds = globalConfig?.configData.properties || [];

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const propertiesData = await api.getProperties(tenantId);
            setProperties(propertiesData);
        } catch (err) {
            console.error("Error fetching properties:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [tenantId]);

    // Check if a property is enabled based on config
    const isPropertyEnabled = (propertyId: number): boolean => {
        // Check if the numeric property ID is in the allowed list
        return allowedPropertyIds.includes(propertyId);
    };

    // Handle property selection change
    const handlePropertyChange = (propertyIdString: string) => {
        const propertyId = parseInt(propertyIdString, 10);
        setSelectedPropertyId(propertyId);
    };

    // Get selected property name for display
    const getSelectedPropertyName = () => {
        if (selectedPropertyId === null) return "";
        const property = properties.find(p => p.propertyId === selectedPropertyId);
        return property ? property.propertyName : "";
    };

    if (loading || configLoading) {
        return (
            <Card className="w-[380px] min-h-[585px] p-4 shadow-lg rounded-lg flex items-center justify-center">
                <PulseLoader color="#26266D" size={10}/>
            </Card>
        );
    }

    return (
        <Card className="w-[380px] min-h-[585px] p-4 shadow-lg rounded-lg">
            <CardContent>
                <form className="space-y-4">
                    {/* Property Name */}
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="property">Property name</Label>
                        <Select onValueChange={handlePropertyChange}>
                            <SelectTrigger
                                id="property"
                                className="w-full min-h-[48px] text-gray-500 px-4 py-2 flex items-center border border-gray-200 shadow-sm rounded-md"
                            >
                                {selectedPropertyId === null && <p>Select Property</p>}
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
                                    >
                                        <Checkbox
                                            className="mr-2 data-[state=checked]:bg-[#26266D] text-white data-[state=checked]:text-white border-[#C1C2C2]"
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
                            ? "grid grid-cols-12 gap-2"
                            : "w-full"
                        }>
                            {searchForm.guestOptions.enabled && (
                                <div
                                    className={`flex flex-col space-y-1 ${searchForm.roomOptions.enabled
                                        ? 'col-span-8'
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
                                        ? 'col-span-4'
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
                                <AccessibilityIcon className="text-[#26266D] text-lg" aria-hidden="true"/>
                                <Label htmlFor="accessible-room" className="text-sm">
                                    {searchForm.accessibility.label}
                                </Label>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>

            {/* Submit Button */}
            <CardFooter className="flex justify-center mt-[100px]">
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