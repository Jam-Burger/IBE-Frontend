import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Button, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from '../../components/ui';
import { Country, State, City } from '../../services/LocationService';
import { useCheckoutForm } from '../../hooks/useCheckoutForm';
// import { updateFormData } from '../../redux/checkoutSlice';
import { RootState } from '../../redux/store';
import { GenericField } from '../../types/GenericField';
import { validateField } from '../../utils/validation';

// Define Field interface
interface Field {
  label: string;
  type: string;
  name: string;
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

interface BillingInfoSectionProps {
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

// Update the adapter function to accept GenericField
const adaptField = (field: GenericField): GenericField => {
  return {
    ...field,
    pattern: field.pattern || undefined
  };
};

const BillingInfoSection: React.FC<BillingInfoSectionProps> = ({
  section,
  expandedSection,
  completedSections,
  formErrors,
  setFormErrors,
  handleInputChange,
  handleNextStep,
  handleSectionExpand,
  countries,
  selectedCountryCode,
  availableStates,
  availableCities,
  handleCountryChange,
  handleStateChange,
  handleCityChange
}) => {
  // const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.checkout.formData);
  const [fieldValidation, setFieldValidation] = useState<Record<string, boolean>>({});
  const [showValidation, setShowValidation] = useState(false);
  
  // Use our custom hook for form data storage
  const { handleInputChange: handleFormInputChange, handleSelectChange } = useCheckoutForm('billing');
  
  // Add safety checks for arrays that might be undefined
  const safeCountries = countries || [];
  const safeStates = availableStates || [];
  const safeCities = availableCities || [];
  
  // Check which required fields are empty
  useEffect(() => {
    if (expandedSection === 'billing_info') {
      const newValidation: Record<string, boolean> = {};
      
      section.fields.forEach(field => {
        if (field.enabled && field.required) {
          const fieldKey = field.name;
          newValidation[fieldKey] = !!formData[fieldKey];
        }
      });
      
      // Special handling for location fields
      if (section.fields.find(f => f.label === 'Country' && f.required)) {
        newValidation['country'] = !!selectedCountryCode;
      }
      
      if (section.fields.find(f => f.label === 'State' && f.required)) {
        const stateValue = formData['state'];
        newValidation['state'] = !!stateValue;
      }
      
      if (section.fields.find(f => f.label === 'City' && f.required)) {
        const cityValue = formData['city'];
        newValidation['city'] = !!cityValue;
      }
      
      // Special handling for zip field
      if (section.fields.find(f => f.label === 'Zip' && f.required)) {
        const zipValue = formData['billingZip'];
        newValidation['billingZip'] = !!zipValue;
      }
      
      setFieldValidation(newValidation);
    }
  }, [expandedSection, formData, section.fields, selectedCountryCode]);
  
  // Reset validation display when section changes
  useEffect(() => {
    setShowValidation(false);
  }, [expandedSection]);
  
  // Custom input change handler that also updates validation state
  const handleCustomInputChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: GenericField
  ) => {
    console.log(`handleCustomInputChange called for field: ${field.name} with value: ${e.target.value}`);
    
    // Use the adapter to ensure compatible types
    handleFormInputChange(e, adaptField(field), handleInputChange);
    
    // Validate the field using the validation utility
    const error = validateField(field, e.target.value);
    if (error) {
      // Update form errors
      setFormErrors(prev => ({
        ...prev,
        [field.name]: error
      }));
    } else {
      // Clear error if it exists
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field.name];
        return newErrors;
      });
    }
    
    // Update validation state for this field
    if (field.required) {
      const fieldKey = field.name;
      setFieldValidation(prev => ({
        ...prev,
        [fieldKey]: !!e.target.value
      }));
    }
  };
  
  // Custom next step handler that shows validation and checks all required fields
  const handleCustomNextStep = () => {
    setShowValidation(true);
    
    // Log all fields to debug
    console.log('All fields:', section.fields);
    console.log('Required fields:', section.fields.filter(field => field.enabled && field.required));
    
    // Map field labels to their corresponding Redux store keys
    const fieldMapping: Record<string, string> = {
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
    };

    // Debug log the form data
    console.log('Current form data:', formData);

    // Check if all required fields are filled
    const requiredFields = section.fields.filter(field => field.enabled && field.required);
    console.log('Checking required fields:', requiredFields);

    const allRequiredFieldsFilled = requiredFields.every(field => {
      const fieldKey = fieldMapping[field.label];
      const value = formData[fieldKey];
      console.log(`Checking field: ${field.label} (${fieldKey}) = ${!!value}`, { value });
      return !!value;
    });
    
    // Special handling for location fields
    const countryFilled = !section.fields.find(f => f.label === 'Country' && f.required) || !!formData['billingCountry'];
    const stateFilled = !section.fields.find(f => f.label === 'State' && f.required) || !!formData['billingState'];
    const cityFilled = !section.fields.find(f => f.label === 'City' && f.required) || !!formData['billingCity'];
    const zipFilled = !section.fields.find(f => f.label === 'Zip' && f.required) || !!formData['billingZip'];
    
    // Check for validation errors
    const hasValidationErrors = Object.keys(formErrors)
      .filter(key => key.startsWith('billing_'))
      .length > 0;
    
    console.log('Form validation status:', {
      allRequiredFieldsFilled,
      countryFilled,
      stateFilled,
      cityFilled,
      zipFilled,
      hasValidationErrors,
      formData,
      formErrors
    });
    
    if (allRequiredFieldsFilled && countryFilled && stateFilled && cityFilled && zipFilled && !hasValidationErrors) {
      // All required fields are filled and valid, proceed to next step
      handleNextStep();
    } else {
      // Show error message with more details
      const missingFields = requiredFields
        .filter(field => !formData[fieldMapping[field.label]])
        .map(field => field.label)
        .join(', ');
      
      setFormErrors(prev => ({
        ...prev,
        section_error: `Please fill all required fields correctly in Billing Information${missingFields ? ': ' + missingFields : ''}`
      }));
    }
  };
  
  // Custom country change handler
  const handleCustomCountryChange = (countryName: string) => {
    handleCountryChange(countryName, 'billing_info');
    
    // Update validation for country
    if (section.fields.find(f => f.label === 'Country' && f.required)) {
      setFieldValidation(prev => ({
        ...prev,
        'country': !!countryName
      }));
    }
  };
  
  // Custom state change handler
  const handleCustomStateChange = (stateName: string) => {
    handleStateChange(stateName, 'billing_info');
    
    // Update validation for state
    if (section.fields.find(f => f.label === 'State' && f.required)) {
      setFieldValidation(prev => ({
        ...prev,
        'state': !!stateName
      }));
    }
  };
  
  // Custom city change handler
  const handleCustomCityChange = (cityName: string) => {
    handleCityChange(cityName, 'billing_info');
    
    // Update validation for city
    if (section.fields.find(f => f.label === 'City' && f.required)) {
      setFieldValidation(prev => ({
        ...prev,
        'city': !!cityName
      }));
    }
  };
  
  return (
    <div className="mb-6">
      {/* Gray background header - clickable but maintain original styling */}
      <div 
        className={`bg-[#E4E4E4] h-[43px] w-[736px] flex items-center px-4 ${
          completedSections.includes('traveler_info') ? 'cursor-pointer' : 'opacity-70'
        }`}
        onClick={() => completedSections.includes('traveler_info') && handleSectionExpand('billing_info')}
      >
        <h2 className="text-base font-bold text-[#333]">
          2. {section.title}
          {completedSections.includes('billing_info') && (
            <span className="ml-2 text-green-600">✓</span>
          )}
        </h2>
      </div>
      
      {/* Section content - conditionally expanded */}
      {expandedSection === 'billing_info' && (
        <div className="px-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mb-4">
            {/* First render name fields (First Name, Last Name) */}
            {section.fields.filter(field => 
              field.enabled && 
              (field.label === 'First Name' || field.label === 'Last Name')
            ).map((field, index) => {
              const fieldKey = field.name;
              const isRequired = field.required;
              const isEmpty = isRequired && fieldValidation[fieldKey] === false;
              const showError = showValidation && isEmpty;
              
              return (
                <div key={`name-${index}`} className="">
                  <Label htmlFor={fieldKey} className="text-sm mb-1 block">
                    {field.label}{isRequired && <span className="text-red-500">*</span>}
                  </Label>
                  <Input 
                    id={fieldKey} 
                    placeholder={field.label} 
                    type="text"
                    className={`h-[48px] w-[340px] ${showError ? 'border-red-500' : ''}`}
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
                </div>
              );
            })}
            
            {/* Then render address fields (Mailing Address 1, Mailing Address 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 col-span-2">
              {section.fields.filter(field => 
                field.enabled && 
                (field.label === 'Mailing Address 1' || field.label === 'Mailing Address 2' || 
                 field.label === 'Address 1' || field.label === 'Address 2')
              ).map((field, index) => {
                const fieldKey = field.name;
                const isRequired = field.required;
                const isEmpty = isRequired && fieldValidation[fieldKey] === false;
                const showError = showValidation && isEmpty;
                
                return (
                  <div key={`address-${index}`} className="">
                    <Label htmlFor={fieldKey} className="text-sm mb-1 block">
                      {field.label}{isRequired && <span className="text-red-500">*</span>}
                    </Label>
                    <Input 
                      id={fieldKey} 
                      placeholder={field.label} 
                      type="text"
                      className={`h-[48px] w-[340px] ${showError ? 'border-red-500' : ''}`}
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
                  </div>
                );
              })}
            </div>
            
            {/* Then render Country field */}
            {section.fields.filter(field => field.enabled && field.label === 'Country').map((field, index) => (
              <div key={`country-${index}`} className="col-span-2">
                <div className="md:w-1/2">
                  <Label htmlFor={field.name} className="text-sm mb-1 block">
                    {field.label}{field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange(value, 'billingCountry', handleCustomCountryChange, 'billing_info')}
                    defaultValue={formData['billingCountry'] || undefined}
                  >
                    <SelectTrigger 
                      id={field.name} 
                      className={`h-[48px] min-h-[48px] w-[340px] flex items-center ${showValidation && !formData['billingCountry'] && field.required ? 'border-red-500' : ''}`}
                      style={{ height: '48px' }}
                    >
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeCountries.map((country) => (
                        <SelectItem value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showValidation && !formData['billingCountry'] && field.required && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                  {formErrors[field.name] && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors[field.name]}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Then render City, State, Zip fields */}
            <div className="col-span-2">
              <div className="flex flex-col md:flex-row gap-4">
                {/* City field */}
                <div className="flex-1">
                  <Label htmlFor="city" className="text-sm mb-1 block">
                    City{section.fields.find(f => f.label === 'City')?.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange(value, 'billingCity', handleCustomCityChange, 'billing_info')}
                    defaultValue={formData['billingCity'] || undefined}
                  >
                    <SelectTrigger 
                      id="city" 
                      className={`h-[48px] min-h-[48px] w-[340px] flex items-center ${showValidation && !formData['billingCity'] && section.fields.find(f => f.label === 'City')?.required ? 'border-red-500' : ''}`}
                      style={{ height: '48px' }}
                      disabled={!selectedCountryCode}
                    >
                      <SelectValue placeholder={!selectedCountryCode ? "Select country first" : "Choose"} />
                    </SelectTrigger>
                    <SelectContent>
                      {safeCities.length > 0 ? (
                        safeCities.map((city) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-gray-500">No cities available</div>
                      )}
                    </SelectContent>
                  </Select>
                  {showValidation && !formData['billingCity'] && section.fields.find(f => f.label === 'City')?.required && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                  {formErrors['billingCity'] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors['billingCity']}</p>
                  )}
                </div>
                
                {/* State field */}
                <div className="w-full md:w-1/3">
                  <Label htmlFor="state" className="text-sm mb-1 block">
                    State{section.fields.find(f => f.label === 'State')?.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange(value, 'billingState', handleCustomStateChange, 'billing_info')}
                    defaultValue={formData['billingState'] || undefined}
                  >
                    <SelectTrigger 
                      id="state" 
                      className={`h-[48px] min-h-[48px] w-[184px] flex items-center ${showValidation && !formData['billingState'] && section.fields.find(f => f.label === 'State')?.required ? 'border-red-500' : ''}`}
                      style={{ height: '48px' }}
                      disabled={!selectedCountryCode || safeStates.length === 0}
                    >
                      <SelectValue placeholder={!selectedCountryCode ? "Select country first" : safeStates.length === 0 ? "Loading states..." : "Choose"} />
                    </SelectTrigger>
                    <SelectContent>
                      {safeStates.length > 0 ? (
                        safeStates.map((state) => (
                          <SelectItem key={state.id} value={state.name}>
                            {state.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-gray-500">
                          {!selectedCountryCode ? "Select a country first" : "No states available"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {showValidation && !formData['billingState'] && section.fields.find(f => f.label === 'State')?.required && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                  {formErrors['billingState'] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors['billingState']}</p>
                  )}
                </div>
                
                {/* Zip field */}
                <div className="w-full md:w-1/4">
                  <Label htmlFor="zip" className="text-sm mb-1 block">
                    Zip{section.fields.find(f => f.label === 'Zip')?.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input 
                    id="zip" 
                    placeholder="Zip" 
                    type="text"
                    className={`h-[48px] w-[145px] ${showValidation && !formData['billingZip'] && section.fields.find(f => f.label === 'Zip')?.required ? 'border-red-500' : ''}`}
                    required={section.fields.find(f => f.label === 'Zip')?.required}
                    pattern={section.fields.find(f => f.label === 'Zip')?.pattern || undefined}
                    value={formData['billingZip'] || ''}
                    onChange={(e) => {
                      const zipField = section.fields.find(f => f.label === 'Zip');
                      if (zipField) {
                        console.log(`Zip field found with name: ${zipField.name}`);
                        // Use the field's name property directly
                        handleCustomInputChange(e, zipField);
                      }
                    }}
                  />
                  {showValidation && !formData['billingZip'] && section.fields.find(f => f.label === 'Zip')?.required && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                  {formErrors['billingZip'] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors['billingZip']}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Then render Phone field */}
            {section.fields.filter(field => field.enabled && field.label === 'Phone').map((field, index) => {
              const fieldKey = field.name;
              const isRequired = field.required;
              const isEmpty = isRequired && fieldValidation[fieldKey] === false;
              const showError = showValidation && isEmpty;
              
              return (
                <div key={`phone-${index}`} className="col-span-2">
                  <div className="md:w-1/2">
                    <Label htmlFor={fieldKey} className="text-sm mb-1 block">
                      {field.label}{isRequired && <span className="text-red-500">*</span>}
                    </Label>
                    <Input 
                      id={fieldKey} 
                      placeholder={field.label} 
                      type="tel"
                      className={`h-[48px] w-[340px] ${showError ? 'border-red-500' : ''}`}
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
                  </div>
                </div>
              );
            })}
            
            {/* Email field */}
            {section.fields.filter(field => field.enabled && field.label === 'Email').map((field, index) => {
              const fieldKey = field.name;
              const isRequired = field.required;
              const isEmpty = isRequired && fieldValidation[fieldKey] === false;
              const showError = showValidation && isEmpty;
              
              return (
                <div key={`email-${index}`} className="col-span-2">
                  <div className="md:w-1/2">
                    <Label htmlFor={fieldKey} className="text-sm mb-1 block">
                      {field.label}{isRequired && <span className="text-red-500">*</span>}
                    </Label>
                    <Input 
                      id={fieldKey} 
                      placeholder={field.label} 
                      type="email"
                      className={`h-[48px] w-[340px] ${showError ? 'border-red-500' : ''}`}
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
                  </div>
                </div>
              );
            })}
          </div>
          
          {formErrors['section_error'] && expandedSection === 'billing_info' && (
            <div className="mt-4 mb-2">
              <p className="text-red-500 text-sm font-medium">
                {formErrors['section_error']}
              </p>
            </div>
          )}
          
          <div className="flex justify-end mb-4 gap-4">
            <span 
              className="text-[#1E2A5A] cursor-pointer flex items-center" 
              onClick={() => handleSectionExpand('traveler_info')}
            >
              Edit Traveler Info
            </span>
            
            <Button 
              onClick={handleCustomNextStep}
              className="bg-[#1E2A5A] hover:bg-[#2A3A7A]"
            >
              NEXT: PAYMENT INFO
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingInfoSection; 