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
import { CheckoutField, CheckoutSection } from './types';
import { useCheckoutForm } from '../../hooks/useCheckoutForm';
import { updateFormData } from '../../redux/checkoutSlice';
import { RootState } from '../../redux/store';

interface Field {
  label: string;
  type: string;
  required: boolean;
  enabled: boolean;
  pattern?: string | null;
  options?: string[] | null;
}

interface TravelerInfoSectionProps {
  section: CheckoutSection;
  expandedSection: string;
  completedSections: string[];
  formErrors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: Field) => void;
  handleNextStep: () => void;
  handleSectionExpand: (sectionId: string) => void;
}

const adaptField = (field: CheckoutField): Field => {
  return {
    ...field,
    // Explicitly handle the pattern property
    pattern: field.pattern
  };
};

const TravelerInfoSection: React.FC<TravelerInfoSectionProps> = ({
  section,
  expandedSection,
  completedSections,
  formErrors,
  handleInputChange,
  handleNextStep,
  handleSectionExpand
}) => {
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.checkout.formData);
  const [fieldValidation, setFieldValidation] = useState<Record<string, boolean>>({});
  const [showValidation, setShowValidation] = useState(false);
  
  // Use our custom hook for form data storage
  const { handleInputChange: handleFormInputChange, handleSelectChange } = useCheckoutForm('traveler');
  
  // Check which required fields are empty
  useEffect(() => {
    if (expandedSection === 'traveler_info') {
      const newValidation: Record<string, boolean> = {};
      
      section.fields.forEach(field => {
        if (field.enabled && field.required) {
          const fieldKey = `traveler_${field.label.toLowerCase().replace(/\s/g, '_')}`;
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
    field: CheckoutField
  ) => {
    // Convert CheckoutField to Field using the adapter
    handleFormInputChange(e, adaptField(field), handleInputChange);
    
    // Update validation state for this field
    if (field.required) {
      const fieldKey = `traveler_${field.label.toLowerCase().replace(/\s/g, '_')}`;
      setFieldValidation(prev => ({
        ...prev,
        [fieldKey]: !!e.target.value
      }));
    }
  };
  
  // Custom next step handler that shows validation
  const handleCustomNextStep = () => {
    setShowValidation(true);
    handleNextStep();
  };
  
  return (
    <div className="mb-6">
      {/* Gray background header - clickable but maintain original styling */}
      <div 
        className="bg-[#E4E4E4] h-[43px] w-[736px] flex items-center px-4 cursor-pointer"
        onClick={() => handleSectionExpand('traveler_info')}
      >
        <h2 className="text-base font-bold text-[#333]">
          1. {section.title}
          {completedSections.includes('traveler_info') && (
            <span className="ml-2 text-green-600">✓</span>
          )}
        </h2>
      </div>
      
      {/* Section content - conditionally expanded */}
      {expandedSection === 'traveler_info' && (
        <div className="px-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mb-4">
            {section.fields.filter((field: CheckoutField) => field.enabled).map((field: CheckoutField, index: number) => {
              const fieldKey = `traveler_${field.label.toLowerCase().replace(/\s/g, '_')}`;
              const isRequired = field.required;
              const isEmpty = isRequired && fieldValidation[fieldKey] === false;
              const showError = showValidation && isEmpty;
              
              return (
                <div key={index} className={field.type === 'checkbox' ? 'col-span-2' : ''}>
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
                        className={`h-[48px] w-[346px] ${showError ? 'border-red-500' : ''}`}
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
                  ) : field.type === 'select' ? (
                    <>
                      <Select 
                        onValueChange={(value) => handleSelectChange(value, field.label.toLowerCase().replace(/\s/g, '_'))}
                        defaultValue={formData[fieldKey] || undefined}
                      >
                        <SelectTrigger 
                          id={fieldKey} 
                          className={`h-[48px] w-[346px] ${showError ? 'border-red-500' : ''}`}
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
                  ) : field.type === 'checkbox' ? (
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
                  ) : null}
                </div>
              );
            })}
          </div>
          
          {formErrors['section_error'] && expandedSection === 'traveler_info' && (
            <div className="col-span-2 mt-2">
              <p className="text-red-500 text-sm font-medium">
                {formErrors['section_error']}
              </p>
            </div>
          )}
          
          <div className="flex justify-end mb-4">
            <Button 
              onClick={handleCustomNextStep}
              className="bg-[#1E2678] hover:bg-[#161c5e] text-white"
            >
              NEXT: BILLING INFO
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelerInfoSection; 