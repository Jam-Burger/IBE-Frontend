import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
    if (price >= 1000000000) {
        return (price / 1000000000).toFixed(1) + 'B';
    }
    if (price >= 1000000) {
        return (price / 1000000).toFixed(1) + 'M';
    }
    if (price >= 1000) {
        return (price / 1000).toFixed(1) + 'K';
    }
    return price.toFixed(2);
}
