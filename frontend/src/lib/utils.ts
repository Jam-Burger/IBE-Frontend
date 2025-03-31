import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateSummeryText(
    guestCounts: Record<string, number>
): string {
    const guestTypeMap: Record<string, { singular: string; plural: string }> = {
        "Adults": {singular: "Adult", plural: "Adults"},
        "Children": {singular: "Child", plural: "Children"},
        "Senior Citizens": {singular: "Senior Citizen", plural: "Senior Citizens"},
        "Teens": {singular: "Teen", plural: "Teens"},
        "Kids": {singular: "Kid", plural: "Kids"},
        "Infants": {singular: "Infant", plural: "Infants"},
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