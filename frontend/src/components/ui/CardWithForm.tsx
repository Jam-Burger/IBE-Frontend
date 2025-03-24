import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchLandingConfig } from "../../redux/configSlice";
import { Button } from "./button";
import { Card, CardContent, CardFooter } from "./card";
import { Label } from "./label";
import { DatePickerWithRange } from "./DatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Checkbox } from "./checkbox";
import { GuestSelector } from "./GuestSelector";
import axios from "axios";

import { FaWheelchair } from "react-icons/fa";

interface Property {
  propertyId: number;
  propertyName: string;
}

const API_URL=import.meta.env.VITE_PROPERTY_URL;

export default function CardWithForm() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedProperty, setSelectedProperty] = useState<string>("");

  const [properties, setProperties] = useState<Property[]>([]);
  // Get landing config from Redux store
  const landingConfig = useSelector((state: RootState) => state.config.landingConfig?.data?.configData?.searchForm);
  // const globalConfig = useSelector((state: RootState) =>
  //   state.config.globalConfig?.data?.configData
  // );

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get<Property[]>(
          API_URL
        );
        setProperties(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    dispatch(fetchLandingConfig());
  }, [dispatch]);

  // Handle property selection change
  const handlePropertyChange = (value: string) => {
    setSelectedProperty(value);
  };

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
                {!selectedProperty && <p>Select Property</p>}
                {selectedProperty && (
                  <span>
                    {properties.find(
                      (property) => selectedProperty === property.propertyName
                    )?.propertyName || "Property not found"}
                  </span>
                )}
              </SelectTrigger>
              <SelectContent position="popper">
                {/* Dynamic Properties */}
                {properties.map((property) => (
                  <SelectItem key={property.propertyId} value={property.propertyName} disabled={property.propertyName !== "Team 9 Hotel"}>
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
            <DatePickerWithRange property={selectedProperty} disabled={!selectedProperty} />
          </div>

          {/* Guests & Rooms */}
          <div className={landingConfig?.guestOptions?.enabled && landingConfig?.roomOptions?.enabled
            ? "grid grid-cols-12 gap-2"
            : "w-full"
          }>
            {landingConfig?.guestOptions?.enabled && (
              <div
                className={`flex flex-col space-y-1 ${landingConfig?.roomOptions?.enabled
                  ? 'col-span-8'
                  : 'w-full'
                  }`}
              >
                <Label htmlFor="guests">Guests</Label>
                <GuestSelector onChange={(counts) => console.log(counts)} />
              </div>
            )}

            {landingConfig?.roomOptions?.enabled && (
              <div
                className={`flex flex-col space-y-1 ${landingConfig?.guestOptions?.enabled
                  ? 'col-span-4'
                  : 'w-full'
                  }`}
              >
                <Label htmlFor="rooms">Rooms</Label>
                <Select>
                  <SelectTrigger id="rooms" className="w-full text-gray-500 min-h-[48px]">
                    <SelectValue placeholder="1" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {/* Dynamic Room Options */}
                    {[...Array(landingConfig?.roomOptions?.max || 1)].map((_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Accessible Room Checkbox */}
          {landingConfig?.accessibility?.enabled && (
            <div className="flex items-center space-x-2">
              <Checkbox id="accessible-room" />
              {/* <Wheelchair size={30} color="blue" strokeWidth={2} /> */}
              <FaWheelchair size={15} color="#2A1D64" />
              <Label htmlFor="accessible-room" className="text-sm">
               {landingConfig.accessibility.label}
              </Label>
            </div>
          )}
        </form>
      </CardContent>

      {/* Submit Button */}
      <CardFooter className="flex justify-center mt-[100px]">
        <Button className="bg-[#2A1D64] text-white px-6 py-6 rounded-lg w-[140px] h-[44px]">
          SEARCH
        </Button>
      </CardFooter>
    </Card>
  );
}