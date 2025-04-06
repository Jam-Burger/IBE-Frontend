// Define the interfaces directly in this file
export interface Field {
  label: string;
  type: string;
  name: string;
  required: boolean;
  enabled: boolean;
  pattern?: string;
  options?: string[];
  [key: string]: unknown; // Add index signature to make it compatible with GenericField
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

// Generic field interface used across components
export interface GenericField {
  label: string;
  type: string;
  name: string;
  required: boolean;
  enabled: boolean;
  pattern?: string | null;
  options?: string[] | null;
  [key: string]: unknown; // Allow for additional properties
}

// Component-specific props interfaces
export interface TravelerInfoSectionProps {
  section: CheckoutSection;
  expandedSection: string;
  completedSections: string[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: CheckoutField) => void;
  handleNextStep: () => void;
  handleSectionExpand: (sectionId: string) => void;
}

export interface BillingInfoSectionProps {
  section: Section;
  expandedSection: string;
  completedSections: string[];
  formErrors: Record<string, string>;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: GenericField) => void;
  handleNextStep: () => void;
  handleSectionExpand: (sectionId: string) => void;
  countries: Country[];
  selectedCountryCode: string;
  availableStates: State[];
  availableCities: City[];
  handleCountryChange: (countryName: string, sectionId: string) => void;
  handleStateChange: (stateName: string, sectionId: string) => void;
  handleCityChange: (cityName: string, sectionId: string) => void;
}

export interface PaymentInfoSectionProps {
  section: Section;
  expandedSection: string;
  completedSections: string[];
  formErrors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: GenericField) => void;
  handleNextStep?: () => void;
  handleSectionExpand: (sectionId: string) => void;
  handleSubmit: () => void;
}

// Location-related interfaces
export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface State {
  id: string;
  name: string;
  countryId: string;
}

export interface City {
  id: string;
  name: string;
  stateId: string;
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
    };
  }
  
  // Otherwise, it's already a Section
  return section as Section;
}

export function adaptField(field: GenericField): GenericField {
  return {
    ...field,
    // Explicitly handle the pattern property
    pattern: field.pattern
  };
}

// Adapter functions for location data
export function adaptCountry(country: { id: string; name: string; iso2: string }): Country {
  return {
    id: country.id,
    name: country.name,
    code: country.iso2
  };
}

export function adaptState(state: { id: string; name: string; iso2: string }, countryId: string): State {
  return {
    id: state.id,
    name: state.name,
    countryId: countryId
  };
}

export function adaptCity(city: { id: string; name: string }, stateId: string): City {
  return {
    id: city.id,
    name: city.name,
    stateId: stateId
  };
}

export function adaptCountries(countries: { id: string; name: string; iso2: string }[]): Country[] {
  return countries.map(country => adaptCountry(country));
}

export function adaptStates(states: { id: string; name: string; iso2: string }[], countryId: string): State[] {
  return states.map(state => adaptState(state, countryId));
}

export function adaptCities(cities: { id: string; name: string }[], stateId: string): City[] {
  return cities.map(city => adaptCity(city, stateId));
} 