import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store"; // Adjust the path as needed
import { fetchLandingConfig } from "../../redux/configSlice"; // Adjust the path as needed
import { Button } from "./button";
import { Card, CardContent, CardFooter } from "./card";
import { Label } from "./label";
import { DatePickerWithRange } from "./DatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Checkbox } from "./checkbox";

export default function CardWithForm() {
  const dispatch = useDispatch<AppDispatch>();

  // Get landing config from Redux store
  const landingConfig = useSelector((state: RootState) => state.config.landingConfig?.data?.configData?.searchForm);
  const globalConfig = useSelector((state: RootState) => 
          state.config.globalConfig?.data?.configData
        );
  console.log(globalConfig);
  useEffect(() => {
    dispatch(fetchLandingConfig());
  }, [dispatch]);

  return (
    <Card className="w-[380px] min-h-[585px] p-4 shadow-lg rounded-lg">
      <CardContent>
        <form className="space-y-4">
          {/* Property Name */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="property">Property name*</Label>
            <Select>
              <SelectTrigger id="property" className="w-full text-gray-500">
                <SelectValue placeholder="Search all properties" />
              </SelectTrigger>
              <SelectContent position="popper">
                {/* Dynamic Properties */}
                {globalConfig?.properties?.map((property: string) => (
                  <SelectItem key={property} value={property}>
                    {property}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select Dates */}
          <div className="flex flex-col space-y-2">
            <Label>Select dates</Label>
            <DatePickerWithRange />
          </div>

          {/* Guests & Rooms */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="guests">Guests</Label>
              <Select>
                <SelectTrigger id="guests" className="w-full text-gray-500">
                  <SelectValue placeholder="Guests" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {/* Dynamic Guest Options */}
                  {landingConfig?.guestOptions?.categories?.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="rooms">Rooms</Label>
              <Select>
                <SelectTrigger id="rooms" className="w-full text-gray-500">
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
          </div>

          {/* Accessible Room Checkbox */}
          {landingConfig?.accessibility?.enabled && (
            <div className="flex items-center space-x-2">
              <Checkbox id="accessible-room" />
              <Label htmlFor="accessible-room" className="text-sm">
                {landingConfig.accessibility.label}
              </Label>
            </div>
          )}
        </form>
      </CardContent>

      {/* Submit Button */}
      <CardFooter className="flex justify-center">
        <Button className="bg-[#2A1D64] text-white px-6 py-6 rounded-lg w-[50%]">
          SEARCH
        </Button>
      </CardFooter>
    </Card>
  );
}
