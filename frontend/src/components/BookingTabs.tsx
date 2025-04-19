import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

import BookingCard from "./BookingCard";

import { BookingType } from "../types";

interface BookingTabsProps {
  bookedHotels: BookingType[];
  cancelledHotels: BookingType[];
}

const BookingTabs = ({ bookedHotels, cancelledHotels }: BookingTabsProps) => {
  return (
    <Tabs defaultValue="booked" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-14">
        <TabsTrigger value="booked" className="text-lg">
          Booked
        </TabsTrigger>
        <TabsTrigger value="cancelled" className="text-lg py-3">
          Cancelled
        </TabsTrigger>
      </TabsList>

      <TabsContent value="booked" className="mt-4 space-y-6">
        {bookedHotels.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium text-gray-600">No bookings found</h3>
            <p className="text-gray-500 mt-2">You don't have any active hotel bookings.</p>
          </div>
        ) : (
          bookedHotels.map((booking,index) => (
            <BookingCard key={index} booking={booking} />
          ))
        )}
      </TabsContent>

      <TabsContent value="cancelled" className="mt-4 space-y-6">
        {cancelledHotels.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium text-gray-600">No cancelled bookings</h3>
            <p className="text-gray-500 mt-2">You don't have any cancelled hotel bookings.</p>
          </div>
        ) : (
           cancelledHotels.map((booking,index) => (
            <BookingCard key={index} booking={booking} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default BookingTabs;
