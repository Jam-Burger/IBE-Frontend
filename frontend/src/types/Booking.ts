import {SerializableDateRange} from "./Filter";

export interface Booking {
    formData: Record<string, string | boolean>;
    propertyId: number;
    dateRange: SerializableDateRange | undefined;
    roomCount: number;
    guests: Record<string, number>;
    bedCount: number;
    roomTypeId: number;
    promotionId: string | null;
    totalAmount: number
}
