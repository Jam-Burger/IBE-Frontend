import { useDispatch } from 'react-redux';
import { updateFormData } from '../redux/checkoutSlice';

// Define a more flexible field interface
interface GenericField {
  label: string;
  type: string;
  name: string;
  required: boolean;
  enabled: boolean;
  pattern?: string | null | undefined;
  options?: string[] | null | undefined;
  [key: string]: unknown; // Allow additional properties
}

export const useCheckoutForm = (sectionPrefix: string) => {
  const dispatch = useDispatch();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: GenericField,
    originalHandler?: (e: React.ChangeEvent<HTMLInputElement>, field: GenericField) => void
  ) => {
    // Call original handler if provided
    if (originalHandler) {
      originalHandler(e, field);
    }

    // Map field labels to their corresponding Redux store keys
    const fieldMapping: Record<string, Record<string, string>> = {
      'billing': {
        'Zip': 'billingZip',
        'First Name': 'billingFirstName',
        'Last Name': 'billingLastName',
        'Phone': 'billingPhone',
        'Email': 'billingEmail',
        'Address 1': 'billingAddress1',
        'Mailing Address 1': 'billingAddress1',
        'Address 2': 'billingAddress2',
        'Mailing Address 2': 'billingAddress2',
        'Country': 'billingCountry',
        'State': 'billingState',
        'City': 'billingCity'
      },
      'traveler': {
        'First Name': 'travelerFirstName',
        'Last Name': 'travelerLastName',
        'Phone': 'travelerPhone',
        'Email': 'travelerEmail'
      }
    };

    // Use mapped field name or original name
    const sectionMapping = fieldMapping[sectionPrefix] || {};
    const fieldKey = sectionMapping[field.label] || field.name;
    console.log(`Updating form data for field: ${fieldKey} with value: ${e.target.value}`);

    dispatch(updateFormData({ [fieldKey]: e.target.value }));
  };
  
  const handleSelectChange = (
    value: string, 
    fieldName: string,
    originalHandler?: (value: string, sectionId: string) => void,
    sectionId?: string
  ) => {
    // Call original handler if provided
    if (originalHandler && sectionId) {
      originalHandler(value, sectionId);
    }
    
    // Use fieldName directly without prefix
    const fieldKey = fieldName;
    dispatch(updateFormData({ [fieldKey]: value }));
  };
  
  return {
    handleInputChange,
    handleSelectChange
  };
}; 