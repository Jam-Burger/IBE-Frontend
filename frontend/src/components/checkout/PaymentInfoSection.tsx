import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Button, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Checkbox
} from '../../components/ui';
import { useCheckoutForm } from '../../hooks/useCheckoutForm';
import { updateFormData } from '../../redux/checkoutSlice';
import { RootState } from '../../redux/store';
import { GenericField } from '../../types/GenericField';

// Define Field interface
interface Field {
  label: string;
  type: string;
  required: boolean;
  enabled: boolean;
  pattern?: string;
  options?: string[];
}

// Define Section interface
interface Section {
  id: string;
  title: string;
  enabled: boolean;
  fields: Field[];
}

interface PaymentInfoSectionProps {
  section: Section;
  expandedSection: string;
  completedSections: string[];
  formErrors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: GenericField) => void;
  handleNextStep?: () => void;
  handleSectionExpand: (sectionId: string) => void;
  handleSubmit: () => void;
}

// Update the adapter function to accept GenericField
const adaptField = (field: GenericField): GenericField => {
  return {
    ...field,
    pattern: field.pattern || undefined
  };
};

const PaymentInfoSection: React.FC<PaymentInfoSectionProps> = ({
  section,
  expandedSection,
  completedSections,
  formErrors,
  handleInputChange,
  handleNextStep,
  handleSectionExpand,
  handleSubmit
}) => {
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.checkout.formData);
  const [fieldValidation, setFieldValidation] = useState<Record<string, boolean>>({});
  const [showValidation, setShowValidation] = useState(false);
  
  // Use our custom hook for form data storage
  const { handleInputChange: handleFormInputChange, handleSelectChange } = useCheckoutForm('payment');
  
  // Check which required fields are empty
  useEffect(() => {
    if (expandedSection === 'payment_info') {
      const newValidation: Record<string, boolean> = {};
      
      section.fields.forEach(field => {
        if (field.enabled && field.required) {
          const fieldKey = `payment_${field.label.toLowerCase().replace(/\s/g, '_')}`;
          newValidation[fieldKey] = !!formData[fieldKey];
        }
      });
      
      setFieldValidation(newValidation);
    }
  }, [expandedSection, formData, section.fields]);
  
  // Reset validation display when section changes
  useEffect(() => {
    setShowValidation(false);
  }, [expandedSection]);
  
  // Custom input change handler that also updates validation state
  const handleCustomInputChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: GenericField
  ) => {
    // Use the adapter to ensure compatible types
    handleFormInputChange(e, adaptField(field), handleInputChange);
    
    // Update validation state for this field
    if (field.required) {
      const fieldKey = `payment_${field.label.toLowerCase().replace(/\s/g, '_')}`;
      setFieldValidation(prev => ({
        ...prev,
        [fieldKey]: !!e.target.value
      }));
    }
  };
  
  // Custom submit handler that shows validation
  const handleCustomSubmit = () => {
    setShowValidation(true);
    
    // Check if all required fields are filled
    const allFieldsValid = section.fields
      .filter(field => field.enabled && field.required)
      .every(field => {
        const fieldKey = `payment_${field.label.toLowerCase().replace(/\s/g, '_')}`;
        return !!formData[fieldKey];
      });
    
    if (allFieldsValid) {
      // Call handleNextStep if provided before submitting
      if (handleNextStep) {
        handleNextStep();
      }
      handleSubmit();
    }
  };
  
  return (
    <div className="mb-6">
      {/* Gray background header - clickable but maintain original styling */}
      <div 
        className={`bg-[#E4E4E4] h-[43px] w-full flex items-center px-4 ${
          completedSections.includes('billing_info') ? 'cursor-pointer' : 'opacity-70'
        }`}
        onClick={() => completedSections.includes('billing_info') && handleSectionExpand('payment_info')}
      >
        <h2 className="text-base font-bold text-[#333]">
          3. {section.title}
          {completedSections.includes('payment_info') && (
            <span className="ml-2 text-green-600">✓</span>
          )}
        </h2>
      </div>
      
      {/* Section content - conditionally expanded */}
      {expandedSection === 'payment_info' && (
        <div className="px-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mb-4">
            {section.fields.filter(field => field.enabled).map((field, index) => {
              const fieldKey = `payment_${field.label.toLowerCase().replace(/\s/g, '_')}`;
              const isRequired = field.required;
              const isEmpty = isRequired && fieldValidation[fieldKey] === false;
              const showError = showValidation && isEmpty;
              
              return (
                <div key={index} className={
                  field.type === 'checkbox' ? 'col-span-2' : 
                  field.label === 'Card Number' || field.label === 'Cardholder Name' ? 'col-span-2' : ''
                }>
                  {field.type !== 'checkbox' && (
                    <Label htmlFor={fieldKey} className="text-sm mb-1 block">
                      {field.label}{isRequired && <span className="text-red-500">*</span>}
                    </Label>
                  )}
                  
                  {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'password' ? (
                    <>
                      <Input 
                        id={fieldKey} 
                        placeholder={field.label} 
                        type={field.type}
                        className={`min-h-[48px] w-full ${showError ? 'border-red-500' : ''}`}
                        required={field.required}
                        pattern={field.pattern || undefined}
                        value={formData[fieldKey] || ''}
                        onChange={(e) => handleCustomInputChange(e, field)}
                      />
                      {showError && (
                        <p className="text-red-500 text-xs mt-1">
                          This field is required
                        </p>
                      )}
                      {formErrors[fieldKey] && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors[fieldKey]}
                        </p>
                      )}
                    </>
                  ) : field.type === 'select' && (
                    <>
                      <Select 
                        onValueChange={(value) => handleSelectChange(value, field.label.toLowerCase().replace(/\s/g, '_'))}
                        defaultValue={formData[fieldKey] || undefined}
                      >
                        <SelectTrigger 
                          id={fieldKey} 
                          className={`min-h-[48px] w-full ${showError ? 'border-red-500' : ''}`}
                        >
                          <SelectValue placeholder="Choose" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option: string, optIndex: number) => (
                            <SelectItem key={optIndex} value={option.toLowerCase()}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {showError && (
                        <p className="text-red-500 text-xs mt-1">
                          This field is required
                        </p>
                      )}
                    </>
                  )}
                  {field.type === 'checkbox' && (
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={fieldKey} 
                        required={field.required}
                        defaultChecked={formData[fieldKey] === 'true'}
                        onCheckedChange={(checked) => {
                          dispatch(updateFormData({ 
                            [fieldKey]: checked ? 'true' : 'false' 
                          }));
                          if (field.required) {
                            setFieldValidation(prev => ({
                              ...prev,
                              [fieldKey]: !!checked
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={fieldKey} className="text-sm">
                        {field.label}
                      </Label>
                      {showError && (
                        <p className="text-red-500 text-xs ml-2">
                          This field is required
                        </p>
                      )}
                      {formErrors[fieldKey] && (
                        <p className="text-red-500 text-xs ml-2">
                          {formErrors[fieldKey]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {formErrors['section_error'] && expandedSection === 'payment_info' && (
            <div className="mt-4 mb-2">
              <p className="text-red-500 text-sm font-medium">
                {formErrors['section_error']}
              </p>
            </div>
          )}
          
          <div className="flex justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={() => handleSectionExpand('billing_info')}
              className="border-[#1E2678] text-[#1E2678]"
            >
              EDIT BILLING INFO
            </Button>
            <Button 
              onClick={handleCustomSubmit}
              className="bg-[#1E2678] hover:bg-[#161c5e] text-white"
            >
              COMPLETE BOOKING
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentInfoSection; 