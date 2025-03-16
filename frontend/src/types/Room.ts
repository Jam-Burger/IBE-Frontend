export interface RoomType {
  areaInSquareFeet: number;
  doubleBed: number;
  maxCapacity: number;
  roomTypeName: string;
  singleBed: number;
}

export interface Room {
  roomNumber: number;
  roomType: RoomType;
}

export interface RoomBooking {
  room: Room;
}

export interface Promotion {
  promotionTitle: string;
  priceFactor: number;
}

export interface Property {
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  contactNumber: string;
}

export interface BookingStatus {
  statusId: string;
  status: string;
  isDeactivated: boolean;
}

export interface Guest {
  guestId: string;
  guestName: string;
}

export interface Booking {
  bookingId: string;
  checkInDate: string;
  checkOutDate: string;
  adultCount: number;
  childCount: number;
  totalCost: number;
  amountDueAtResort: number;
  property: Property;
  status: BookingStatus;
  guest: Guest;
  promotionApplied?: Promotion;
  roomBooked: RoomBooking[];
} 