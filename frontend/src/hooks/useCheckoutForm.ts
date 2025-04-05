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
  [key: string]: any; // Allow additional properties
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
    
    // Use field.name directly without prefix
    const fieldKey = field.name;
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