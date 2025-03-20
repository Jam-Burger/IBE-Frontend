import { Button } from "./button";
import {
  Card,
  CardContent,
  CardFooter,
} from "./card";
import { Label } from "./label";
import { DatePickerWithRange } from "./DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

import { Checkbox } from "./checkbox";

export default function CardWithForm() {
  return (
    <Card className="w-[380px] h-[623px] p-4 shadow-lg rounded-lg gap-50">
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
                <SelectItem value="property1">Property 1</SelectItem>
                <SelectItem value="property2">Property 2</SelectItem>
                <SelectItem value="property3">Property 3</SelectItem>
                <SelectItem value="property4">Property 4</SelectItem>
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
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
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
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Accessible Room Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox id="accessible-room" />
            <Label htmlFor="accessible-room" className="text-sm">
              I need an Accessible Room
            </Label>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button className="bg-[#2A1D64] text-white px-6 py-6 rounded-lg w-[50%]">
          SEARCH
        </Button>
      </CardFooter>
    </Card>
  );
}
