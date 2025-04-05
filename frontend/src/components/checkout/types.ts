// Define the interfaces directly in this file
export interface Field {
  label: string;
  type: string;
  name: string;
  required: boolean;
  enabled: boolean;
  pattern?: string;
  options?: string[];
}

export interface Section {
  id: string;
  title: string;
  enabled: boolean;
  fields: Field[];
}

export interface CheckoutField {
  label: string;
  type: string;
  name: string;
  required: boolean;
  enabled: boolean;
  pattern: string | null;
  options?: string[] | null;
}

export interface CheckoutSection {
  id: string;
  title: string;
  enabled: boolean;
  fields: CheckoutField[];
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
        pattern: field.pattern === null ? undefined : field.pattern,
        // Convert options from string[]|null to string[]|undefined
        options: field.options === null ? undefined : field.options
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
        pattern: field.pattern === undefined ? null : field.pattern,
        // Convert options from string[]|undefined to string[]|null
        options: field.options === undefined ? null : field.options
      }))
    } as CheckoutSection;
  }
} 