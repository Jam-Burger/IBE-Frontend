import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Checkbox } from "./ui/Checkbox";
import { Slider } from "./ui/slider";

export interface RoomFiltersProps {
  selectedBedTypes: string[];
  onBedTypeChange: (bedType: string) => void;
  selectedRatings: string[];
  onRatingChange: (rating: string) => void;
  selectedAmenities: string[];
  onAmenityChange: (amenity: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (values: number[]) => void;
}
export default function RoomFilters({
  selectedBedTypes,
  onBedTypeChange,
  selectedRatings,
  onRatingChange,
  selectedAmenities,
  onAmenityChange,
  priceRange,
  onPriceRangeChange
}: RoomFiltersProps) {
  
  return (
    <div className="w-[293px] p-8 bg-[#EFF0F1] rounded-[5px] min-h-[290px] max-h-fit">
      <h2 className="font-700">Narrow your results</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Popularity</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="five-star" 
                  checked={selectedRatings.includes('five-star')}
                  onCheckedChange={() => onRatingChange('five-star')}
                />
                <label htmlFor="five-star" className="text-sm text-gray-700">5 Star</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="four-star" 
                  checked={selectedRatings.includes('four-star')}
                  onCheckedChange={() => onRatingChange('four-star')}
                />
                <label htmlFor="four-star" className="text-sm text-gray-700">4 Star</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="three-star" 
                  checked={selectedRatings.includes('three-star')}
                  onCheckedChange={() => onRatingChange('three-star')}
                />
                <label htmlFor="three-star" className="text-sm text-gray-700">3 Star</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="less-than-three" 
                  checked={selectedRatings.includes('less-than-three')}
                  onCheckedChange={() => onRatingChange('less-than-three')}
                />
                <label htmlFor="less-than-three" className="text-sm text-gray-700">Less than 3 Star</label>
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
                  id="king-bed" 
                  checked={selectedBedTypes.includes('king-bed')}
                  onCheckedChange={() => onBedTypeChange('king-bed')}
                />
                <label htmlFor="king-bed" className="text-sm text-gray-700">1 King Bed</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="two-queen-beds" 
                  checked={selectedBedTypes.includes('two-queen-beds')}
                  onCheckedChange={() => onBedTypeChange('two-queen-beds')}
                />
                <label htmlFor="two-queen-beds" className="text-sm text-gray-700">2 Queen Beds</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="one-queen-bed" 
                  checked={selectedBedTypes.includes('one-queen-bed')}
                  onCheckedChange={() => onBedTypeChange('one-queen-bed')}
                />
                <label htmlFor="one-queen-bed" className="text-sm text-gray-700">1 Queen Bed</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="two-double-beds" 
                  checked={selectedBedTypes.includes('two-double-beds')}
                  onCheckedChange={() => onBedTypeChange('two-double-beds')}
                />
                <label htmlFor="two-double-beds" className="text-sm text-gray-700">2 Double Beds</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="one-double-bed" 
                  checked={selectedBedTypes.includes('one-double-bed')}
                  onCheckedChange={() => onBedTypeChange('one-double-bed')}
                />
                <label htmlFor="one-double-bed" className="text-sm text-gray-700">1 Double Bed</label>
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
                  defaultValue={priceRange} 
                  value={priceRange}
                  min={0} 
                  max={1000} 
                  step={10}
                  onValueChange={onPriceRangeChange}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">
                  <span className="text-gray-700">Min: </span>
                  <span className="text-primary">${priceRange[0]}</span>
                </div>
                <div className="text-sm font-medium">
                  <span className="text-gray-700">Max: </span>
                  <span className="text-primary">${priceRange[1]}</span>
                </div>
              </div>
              <div className="text-xs text-gray-700 mt-2">
                Selected range: ${priceRange[0]} - ${priceRange[1]}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Ammenities</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="wifi" 
                  checked={selectedAmenities.includes('wifi')}
                  onCheckedChange={() => onAmenityChange('wifi')}
                />
                <label htmlFor="wifi" className="text-sm text-gray-700">Wireless Internet Access</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="cable-tv" 
                  checked={selectedAmenities.includes('cable-tv')}
                  onCheckedChange={() => onAmenityChange('cable-tv')}
                />
                <label htmlFor="cable-tv" className="text-sm text-gray-700">Cable & Pay TV Channels</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="alarm-clock" 
                  checked={selectedAmenities.includes('alarm-clock')}
                  onCheckedChange={() => onAmenityChange('alarm-clock')}
                />
                <label htmlFor="alarm-clock" className="text-sm text-gray-700">Alarm Clock</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hair-dryer" 
                  checked={selectedAmenities.includes('hair-dryer')}
                  onCheckedChange={() => onAmenityChange('hair-dryer')}
                />
                <label htmlFor="hair-dryer" className="text-sm text-gray-700">Hair Dryer</label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}