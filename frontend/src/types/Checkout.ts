// Define the interfaces directly in this file
import {GenericField} from "./index.ts";

export interface Section {
    id: string;
    title: string;
    enabled: boolean;
    fields: GenericField[];
}

export interface CheckoutSection {
    id: string;
    title: string;
    enabled: boolean;
    fields: GenericField[];
}

// Create a bidirectional adapter function
export function adaptCheckoutSection(section: unknown): Section | CheckoutSection {
    // If the input has pattern fields that are null, it's likely a CheckoutSection
    // and we need to convert to Section
    if (section && typeof section === 'object' && 'fields' in section &&
        Array.isArray(section.fields) && section.fields.some(f => f && typeof f === 'object' && 'pattern' in f && f.pattern === null)) {
        return {
            ...section as CheckoutSection,
            fields: (section as CheckoutSection).fields.map((field) => ({
                ...field,
                // Convert pattern from string|null to string|undefined
                pattern: field.pattern ?? null,
                // Convert options from string[]|null to string[]|undefined
                options: field.options ?? null
            }))
        } as Section;
    }
    // Otherwise, assume it's a Section and convert to CheckoutSection
    else {
        return {
            ...section as Section,
            fields: (section as Section).fields.map((field) => ({
                ...field,
                // Convert pattern from string|undefined to string|null
                pattern: field.pattern ?? null,
                // Convert options from string[]|undefined to string[]|null
                options: field.options ?? null
            }))
        } as CheckoutSection;
    }
} 