import { cn } from "../lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";
import RoomFilters from "../components/FilterRooms";
import ResortCard from "../components/ui/ResortCard";

const RoomPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for room filters
  const [selectedBedTypes, setSelectedBedTypes] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Handlers for updating filters
  const handleBedTypeChange = (bedType: string) => {
    setSelectedBedTypes((prev) =>
      prev.includes(bedType) ? prev.filter((b) => b !== bedType) : [...prev, bedType]
    );
  };

  const handleRatingChange = (rating: string) => {
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const steps = [
    { id: 0, label: "Choose room", completed: currentStep > 0 },
    { id: 1, label: "Choose add on", completed: currentStep > 1 },
    { id: 2, label: "Checkout", completed: currentStep > 2 },
  ];

  const handleStepClick = (stepId: number) => {
    // Only allow moving to steps that are either completed or the next available step
    if (stepId <= currentStep || stepId === currentStep + 1) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header section with background */}
      <div className="w-full bg-[#858685] h-48 flex-shrink-0" />
      
      {/* Stepper section */}
      <div className="flex items-center justify-center h-[92px] flex-shrink-0">
        {/* Stepper component with exact dimensions from the image */}
        <div className="w-[417px] relative">
          <div className="flex items-center justify-between relative">
            {/* First circle to last circle connecting line */}
            <div className="absolute top-[14px] h-[2px] bg-gray-300" style={{
              left: '32px',
              right: '32px',
              zIndex: -1
            }}></div>
            
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center z-10">
                {/* Step circle */}
                <div
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm cursor-pointer",
                    index === currentStep
                      ? "bg-red-500"
                      : step.completed || index < currentStep
                      ? "bg-primary"
                      : "bg-gray-300"
                  )}
                  onClick={() => handleStepClick(index)}
                >
                  {step.completed || index < currentStep ? <Check size={16} /> : index + 1}
                </div>
                
                {/* Step label */}
                <span className={cn(
                  "text-xs mt-1",
                  index === currentStep ? "text-primary font-medium" : "text-gray-500"
                )}>
                  {index + 1}. {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main content area - scrollable */}
      <div className="flex-grow overflow-y-auto relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar with filters */}
            <div className="md:w-[293px] sticky top-6 self-start">
              <RoomFilters
                selectedBedTypes={selectedBedTypes}
                onBedTypeChange={handleBedTypeChange}
                selectedRatings={selectedRatings}
                onRatingChange={handleRatingChange}
                selectedAmenities={selectedAmenities}
                onAmenityChange={handleAmenityChange}
                priceRange={priceRange}
                onPriceRangeChange={handlePriceRangeChange}
              />
            </div>
            
            {/* Room results section */}
            <div className="flex-1 md:ml-16 mt-10 md:mt-10  ">
              {/* Header with Room Results and Showing text */}
              <div className="flex justify-between items-center mb-4 mr-10">
                <h2 className="text-xl font-bold">Room Results</h2>
                <div className="flex items-center text-sm">
                  <span className="mr-6">Showing 1-4 of 5 Results</span>
                  <div className="flex items-center">
                    <span className="mr-2">Price</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Grid of resort cards with minimal gap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                {[1, 2, 3].map((item) => (
                  <ResortCard key={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;