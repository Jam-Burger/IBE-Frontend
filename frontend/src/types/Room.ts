export interface Room {
    roomTypeId: number;
    roomTypeName: string;
    maxCapacity: number;
    areaInSquareFeet: number;
    singleBed: number;
    doubleBed: number;
    propertyId: number;
    rating: number;
    numberOfReviews: number;
    landmark: string;
    description: string;
    roomRates: {
        date: string;
        price: number;
    }[];
    amenities: string[];
    images: string[];
}
