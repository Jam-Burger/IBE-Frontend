import { FaRegCalendarAlt } from "react-icons/fa";
const BookingHeader = () => {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between">
      <div className="flex items-center gap-3 mb-4 sm:mb-0">
        <div className="bg-[#9b87f5] p-2 rounded-lg">
          <FaRegCalendarAlt className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1F2C]">My Bookings</h1>
      </div>
      <p className="text-[#8E9196] text-center sm:text-right">
        Manage all your hotel reservations in one place
      </p>
    </header>
  );
};

export default BookingHeader;
