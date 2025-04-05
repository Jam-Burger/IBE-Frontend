export interface SpecialDiscount {
    id: number;
    title: string;
    description: string;
    property_id: number;
    start_date: string;
    end_date: string;
    discount_percentage: number;
}

export interface PromoOffer {
    id: number;
    title: string;
    description: string;
    discount_percentage: number;
    promo_code: string;
}

export interface PackageData {
    title: string;
    price: number;
    description: string;
}

export type StandardPackage = PackageData