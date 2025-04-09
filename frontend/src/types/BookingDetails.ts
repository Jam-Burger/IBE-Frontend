import {SpecialDiscount} from "./Package";

// Enum for booking status
export enum BookingStatus {
    BOOKED = "BOOKED",
    CANCELLED = "CANCELLED",
}

// Enum for transaction status
export enum TransactionStatus {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
}

export interface Transaction {
    id: number;
    transactionId: string;
    amount: number;
    cardNumber: string;
    status: TransactionStatus;
    timestamp: string;
}

export interface GuestDetails {
    id: number;
    travelerFirstName: string;
    travelerLastName?: string;
    travelerEmail: string;
    billingFirstName?: string;
    billingLastName?: string;
    billingEmail?: string;
    billingPhone?: string;
    billingAddress1?: string;
    billingAddress2?: string;
    billingCity?: string;
    billingState?: string;
    billingCountry?: string;
    billingZip?: string;
    travelerPhone?: string;
    receiveOffers?: boolean;
    agreedToTerms?: boolean;
}

export interface BookingDetails {
    booking_id: number;
    check_in_date: string;
    check_out_date: string;
    adult_count: number;
    child_count: number;
    total_cost: number;
    amount_due_at_resort: number;
    booking_status: BookingStatus;
    transaction: Transaction;
    property_id: number;
    room_type_id: number;
    room_numbers: number[];
    special_offer?: SpecialDiscount;
    guest_details: GuestDetails;
}
