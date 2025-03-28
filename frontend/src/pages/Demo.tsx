// import  { useState } from 'react';
// import RoomFilters from '../components/FilterRooms';

// const Demo = () => {
//   // State for different filters
//   const [selectedBedTypes, setSelectedBedTypes] = useState<string[]>([]);
//   const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
//   const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
//   const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

//   // Handlers for updating filters
//   const handleBedTypeChange = (bedType: string) => {
//     setSelectedBedTypes((prev) =>
//       prev.includes(bedType) ? prev.filter((b) => b !== bedType) : [...prev, bedType]
//     );
//   };

//   const handleRatingChange = (rating: string) => {
//     setSelectedRatings((prev) =>
//       prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
//     );
//   };

//   const handleAmenityChange = (amenity: string) => {
//     setSelectedAmenities((prev) =>
//       prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
//     );
//   };

//   const handlePriceRangeChange = (values: number[]) => {
//     setPriceRange([values[0], values[1]]);
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-4">Filter Rooms</h1>
//       <RoomFilters
//         selectedBedTypes={selectedBedTypes}
//         onBedTypeChange={handleBedTypeChange}
//         selectedRatings={selectedRatings}
//         onRatingChange={handleRatingChange}
//         selectedAmenities={selectedAmenities}
//         onAmenityChange={handleAmenityChange}
//         priceRange={priceRange}
//         onPriceRangeChange={handlePriceRangeChange}
//       />
//     </div>
//   );
// };

// export default Demo;
