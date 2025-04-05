import {GenericField} from "./GenericField.ts";

export interface CheckoutSection {
    title: string;
    id: string;
    enabled: boolean;
    fields: GenericField[];
}

export interface CheckoutConfig {
    sections: CheckoutSection[];
}