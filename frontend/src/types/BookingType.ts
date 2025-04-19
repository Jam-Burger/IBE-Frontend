export interface BookingType {
    id: number;
    bookingId: number;
    roomTypeImage: string;
    status: "BOOKED" | "CANCELLED";
    totalCost: number;
    checkInDate: Date;
    checkOutDate: Date;
    propertyName: string;
    propertyAddress: string;
    contactNumber: string;
    childCount: number;
    adultCount: number;
  }