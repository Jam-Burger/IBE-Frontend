import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateRange } from "react-day-picker";
import {
    SerializableDateRange,
    Room,
    SpecialDiscount,
    PromoOffer,
    RoomRate,
} from "../types";
import { parseISO, isWithinInterval } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateSummeryText(
    guestCounts: Record<string, number>
): string {
    const guestTypeMap: Record<string, { singular: string; plural: string }> = {
        Adults: { singular: "Adult", plural: "Adults" },
        Children: { singular: "Child", plural: "Children" },
        "Senior Citizens": {
            singular: "Senior Citizen",
            plural: "Senior Citizens",
        },
        Teens: { singular: "Teen", plural: "Teens" },
        Kids: { singular: "Kid", plural: "Kids" },
        Infants: { singular: "Infant", plural: "Infants" },
    };

    return Object.entries(guestCounts)
        .filter(([_, count]) => count > 0) // Only include non-zero counts
        .map(([type, count]) => {
            const typeInfo = guestTypeMap[type] || {
                singular: type,
                plural: type.endsWith("s") ? type : `${type}s`,
            };

            const displayType =
                count === 1 ? typeInfo.singular : typeInfo.plural;
            return `${count} ${displayType}`;
        })
        .join(", ");
}

/**
 * Formats a price with currency symbol and optional multiplier
 * @param symbol Currency symbol (e.g., '$', '€')
 * @param price Original price
 * @param multiplier Optional multiplier (e.g., number of nights)
 * @param shorten Whether to shorten the price (e.g., 1.5K, 2.3M)
 * @returns Formatted price string with symbol and multiplier if applicable
 */
export const convertToLocaleCurrency = (
    symbol: string,
    price: number = 0,
    multiplier: number = 1,
    shorten: boolean = true
): string => {
    const totalPrice = price * multiplier;
    if (shorten) {
        return `${symbol}${formatPrice(totalPrice)}`;
    }
    if (multiplier > 50) {
        return `${symbol}${totalPrice.toFixed(0)}`;
    }
    return `${symbol}${totalPrice.toFixed(2)}`;
};

export function formatPrice(price: number): string {
    if (price >= 1000000000) {
        return (price / 1000000000).toFixed(1) + "B";
    }
    if (price >= 1000000) {
        return (price / 1000000).toFixed(1) + "M";
    }
    if (price >= 1000) {
        return (price / 1000).toFixed(1) + "K";
    }
    return price.toFixed(1);
}

/**
 * Converts CAPITAL_CASE to Capital Case
 * @param text Text in CAPITAL_CASE format
 * @returns Text in Capital Case format
 */
export const toTitleCase = (text: string): string => {
    return text
        .toLowerCase()
        .split("_")
        .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
};

// Convert DateRange to SerializableDateRange for Redux
export const toSerializableDateRange = (
    dateRange?: DateRange
): SerializableDateRange | undefined => {
    if (!dateRange) return undefined;
    return {
        from: dateRange.from ? formatDateToYYYYMMDD(dateRange.from) : undefined,
        to: dateRange.to ? formatDateToYYYYMMDD(dateRange.to) : undefined,
    };
};

/**
 * Formats a Date object to YYYY-MM-DD string format
 * @param date Date object to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const computeDiscountedPrice = (
    discount: SpecialDiscount | PromoOffer,
    roomRates: Room["roomRates"]
): number => {
    if ("start_date" in discount) {
        if (!discount.start_date || !discount.end_date) {
            const averagePrice =
                roomRates.reduce(
                    (sum: number, rate: any) => sum + rate.price,
                    0
                ) / roomRates.length;
            return Math.round(
                averagePrice * (1 - discount.discount_percentage / 100)
            );
        }

        const discountStart = parseISO(discount.start_date);
        const discountEnd = parseISO(discount.end_date);

        let totalPrice = 0;
        let totalDays = 0;

        roomRates.forEach((rate) => {
            const rateDate = parseISO(rate.date);
            totalDays++;

            if (
                isWithinInterval(rateDate, {
                    start: discountStart,
                    end: discountEnd,
                })
            ) {
                totalPrice +=
                    rate.price * (1 - discount.discount_percentage / 100);
            } else {
                totalPrice += rate.price;
            }
        });

        return totalDays > 0 ? Math.round(totalPrice / totalDays) : 0;
    } else {
        const totalPrice = roomRates.reduce(
            (sum: number, rate: any) => sum + rate.price,
            0
        );
        return totalPrice * (1 - discount.discount_percentage / 100);
    }
};

export const getDailyRates = (
    discount: SpecialDiscount | PromoOffer,
    roomRates: Room["roomRates"]
): RoomRate[] => {
    if (!roomRates || roomRates.length === 0) {
        return [];
    }

    // If no date range specified in discount, apply to all dates
    if (
        !("start_date" in discount) ||
        !discount.start_date ||
        !discount.end_date
    ) {
        return roomRates.map((rate) => ({
            date: rate.date,
            minimumRate: rate.price,
            discountedRate:
                rate.price * (1 - discount.discount_percentage / 100),
        }));
    }

    const discountStart = parseISO(discount.start_date);
    const discountEnd = parseISO(discount.end_date);

    // Apply discount only to dates within the discount period
    return roomRates.map((rate) => {
        const rateDate = parseISO(rate.date);
        const isWithinDiscountPeriod = isWithinInterval(rateDate, {
            start: discountStart,
            end: discountEnd,
        });

        return {
            date: rate.date,
            minimumRate: rate.price,
            discountedRate: isWithinDiscountPeriod
                ? rate.price * (1 - discount.discount_percentage / 100)
                : rate.price,
        };
    });
};

/**
 * Calculates the occupancy tax rate based on the country.
 * @param country The country code (e.g., 'US', 'CA', 'GB', 'AU').
 * @returns The occupancy tax rate percentage.
 */
export const getOccupancyTax = (country?: string): number => {
    switch (country?.toUpperCase()) {
        case 'US':
            return 8.5; // Example: 8.5% for United States
        case 'CA':
            return 5.0; // Example: 5.0% for Canada
        case 'GB':
            return 20.0; // Example: 20.0% for United Kingdom
        case 'AU':
            return 10.0; // Example: 10.0% for Australia
        default:
            return 0; // Default to 0% for other countries
    }
};

export const maskCardNumber = (cardNumber: string): string => {
    if (!cardNumber || cardNumber.length < 4) {
        return "XXXX"; // Return a default mask if card number is invalid or too short
    }
    const lastFourDigits = cardNumber.slice(-4);
    const maskedPart = "X".repeat(cardNumber.length - 4);
    const maskedNumber = maskedPart + lastFourDigits;

    // Group the masked number into chunks of four
    return maskedNumber.replace(/(\w{4})/g, '$1 ').trim();
};
