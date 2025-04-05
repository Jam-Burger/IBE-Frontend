import { State } from '../services/LocationService';
import { GenericField } from '../types';

/**
 * Validates a form field based on its type and requirements
 * @param field The field configuration
 * @param value The field value
 * @returns Error message if validation fails, empty string if valid
 */
export function validateField(field: GenericField, value: string | boolean): string {
  // Skip validation for disabled fields
  if (!field.enabled) return '';
  
  // Required field validation
  if (field.required) {
    if (typeof value === 'boolean' && !value) {
      return `${field.label} is required`;
    }
    
    if (typeof value === 'string' && !value.trim()) {
      return `${field.label} is required`;
    }
  }
  
  // Pattern validation for text fields
  if (typeof value === 'string' && value.trim()) {
    // First check if field has a specific pattern from config
    if (field.pattern) {
      const pattern = typeof field.pattern === 'string' ? field.pattern : '';
      if (pattern && !new RegExp(pattern).test(value)) {
        return `${field.label} format is invalid`;
      }
    }
    // Then check if field type has a default pattern
    else if (field.type) {
      switch (field.type) {
        case 'email':
          if (!validateEmail(value)) {
            return 'Please enter a valid email address';
          }
          break;

        case 'tel':
        case 'phone':
          if (!validatePhone(value)) {
            return 'Please enter a valid phone number';
          }
          break;

        case 'text':
          // Special handling for zip code fields
          if (field.label === 'Zip' && !validateZipCode(value)) {
            return 'Please enter a valid zip code';
          }
          break;
      }
    }
  }
  
  return '';
}

/**
 * Validates a form section
 * @param sectionId The section ID
 * @param fields Array of fields to validate
 * @returns Object with field IDs as keys and error messages as values
 */
export function validateSection(sectionId: string, fields: GenericField[]): Record<string, string> {
  console.log(`Validating section: ${sectionId} with ${fields.length} fields`);
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    if (!field.enabled) return;
    
    const fieldId = `${sectionId}_${field.name}`;
    console.log(`Looking for field with ID: ${fieldId}`);
    const element = document.getElementById(fieldId);
    
    if (element) {
      console.log(`Found element with ID: ${fieldId}`);
      let value: string | boolean;
      
      if (field.type === 'checkbox') {
        value = (element as HTMLInputElement).checked;
        console.log(`Checkbox value: ${value}`);
      } else if (field.type === 'select') {
        // For select elements, try to get the data-value attribute first
        const dataValue = element.getAttribute('data-value');
        value = dataValue || (element as HTMLSelectElement).value;
        console.log(`Select value: ${value}`);
      } else {
        value = (element as HTMLInputElement).value;
        console.log(`Input value: ${value}`);
      }
      
      const error = validateField(field, value);
      if (error) {
        console.log(`Validation error for ${fieldId}: ${error}`);
        errors[fieldId] = error;
      }
    } else {
      console.log(`Element with ID ${fieldId} not found`);
    }
  });
  
  console.log('Validation errors:', errors);
  return errors;
}

/**
 * Validates an email address
 * @param email Email to validate
 * @returns True if valid, false otherwise
 */
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validates a phone number
 * @param phone Phone number to validate
 * @returns True if valid, false otherwise
 */
function validatePhone(phone: string): boolean {
  // Basic validation - can be enhanced based on requirements
  return /^[0-9]{10,15}$/.test(phone.replace(/[^0-9]/g, ''));
}

/**
 * Validates location data (country, state, city)
 * @param countryCode Selected country code
 * @param stateName Selected state name
 * @param validStates Array of valid states
 * @returns Error message if validation fails, empty string if valid
 */
export function validateLocation(countryCode: string, stateName: string, validStates: State[]): string {
  if (!countryCode) {
    return 'Please select a country';
  }
  
  if (!stateName && validStates.length > 0) {
    return 'Please select a state';
  }
  
  if (stateName && validStates.length > 0) {
    const isValidState = validStates.some(s => s.name === stateName);
    if (!isValidState) {
      return 'Selected state is not valid for the chosen country';
    }
  }
  
  return '';
}

/**
 * Validates a zip code
 * @param zipCode Zip code to validate
 * @returns True if valid, false otherwise
 */
export function validateZipCode(zipCode: string): boolean {
  // Basic US zip code validation (5 digits or 5+4 format)
  return /^\d{5}(-\d{4})?$/.test(zipCode);
} 