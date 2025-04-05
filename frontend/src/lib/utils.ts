import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {DateRange} from "react-day-picker";
import {SerializableDateRange} from "../types/Filter";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateSummeryText(
    guestCounts: Record<string, number>
): string {
    const guestTypeMap: Record<string, { singular: string; plural: string }> = {
        Adults: {singular: "Adult", plural: "Adults"},
        Children: {singular: "Child", plural: "Children"},
        "Senior Citizens": {
            singular: "Senior Citizen",
            plural: "Senior Citizens",
        },
        Teens: {singular: "Teen", plural: "Teens"},
        Kids: {singular: "Kid", plural: "Kids"},
        Infants: {singular: "Infant", plural: "Infants"},
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
    return `${symbol}${Math.round(totalPrice)}`;
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
    // yyyy-mm-dd
    const result: SerializableDateRange = {};
    if (dateRange.from) {
        result.from =
            dateRange.from.getFullYear() +
            "-" +
            (dateRange.from.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            dateRange.from.getDate().toString().padStart(2, "0");
    }
    if (dateRange.to) {
        result.to =
            dateRange.to.getFullYear() +
            "-" +
            (dateRange.to.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            dateRange.to.getDate().toString().padStart(2, "0");
    }
    return result;
};
