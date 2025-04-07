import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import TravelerInfo from '../components/TravelerInfo';
import BillingInfo from '../components/BillingInfo';
import PaymentInfo from '../components/PaymentInfo';
import TripItinerary from '../components/TripItinerary';
import { fetchCheckoutConfig } from '../redux/checkoutSlice';
import { RootState, AppDispatch } from '../redux/store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui';

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const checkoutState = useSelector((state: RootState) => state.checkout);
  console.log('Checkout State:', checkoutState);
  
  const { config, loading, error, formValues: reduxFormValues } = checkoutState;
  const [activeSection, setActiveSection] = useState<string>('traveler_info');
  const [isValid, setIsValid] = useState<Record<string, boolean>>({
    traveler_info: false,
    billing_info: false,
    payment_info: false
  });
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, unknown>>({});

  useEffect(() => {
    console.log('Dispatching fetchCheckoutConfig');
    dispatch(fetchCheckoutConfig());
  }, [dispatch]);

  // Update validation state when form values or errors change
  useEffect(() => {
    if (!config?.sections) return;
    
    const currentSection = activeSection;
    const sectionFields = getSectionFields(currentSection);
    
    // Check if there are any errors for the current section's fields
    const hasErrors = Object.keys(formErrors).some(key => sectionFields.includes(key));
    
    // Check if all required fields have values
    const allFieldsFilled = sectionFields.every(field => {
      const value = formValues[field];
      return value !== undefined && value !== null && value !== '';
    });
    
    // A section is valid if it has no errors and all required fields are filled
    const isCurrentSectionValid = !hasErrors && allFieldsFilled;
    
    console.log(`Section ${currentSection} validation:`, {
      hasErrors,
      allFieldsFilled,
      isCurrentSectionValid,
      sectionFields,
      fieldValues: sectionFields.map(field => ({ field, value: formValues[field] }))
    });
    
    setIsValid(prev => ({
      ...prev,
      [currentSection]: isCurrentSectionValid
    }));
  }, [formValues, formErrors, activeSection, config]);

  // Force validation check for a specific section
  const validateSection = (sectionId: string, values: Record<string, unknown>, errors: Record<string, unknown>): boolean => {
    if (!config?.sections) return false;
    
    const sectionFields = getSectionFields(sectionId);
    
    // Log all values and errors for debugging
    console.log(`Validating section ${sectionId}:`, {
      sectionFields,
      allValues: values,
      allErrors: errors,
      fieldValues: sectionFields.map(field => ({ 
        field, 
        value: values[field],
        hasError: !!errors[field]
      }))
    });
    
    // Check if there are any errors for the section's fields
    const hasErrors = Object.keys(errors).some(key => sectionFields.includes(key));
    
    // Check if all required fields have values
    const allFieldsFilled = sectionFields.every(field => {
      const value = values[field];
      // For string values, check if they're not empty
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      // For boolean values, just check if they exist
      if (typeof value === 'boolean') {
        return true;
      }
      // For other types, check if they exist
      return value !== undefined && value !== null;
    });
    
    // A section is valid if it has no errors and all required fields are filled
    const isSectionValid = !hasErrors && allFieldsFilled;
    
    console.log(`Force validation for section ${sectionId}:`, {
      hasErrors,
      allFieldsFilled,
      isSectionValid,
      sectionFields,
      fieldValues: sectionFields.map(field => ({ field, value: values[field] }))
    });
    
    return isSectionValid;
  };

  const handleSectionChange = (sectionId: string) => {
    console.log(`Attempting to change to section: ${sectionId}`);
    console.log('Current validation state:', isValid);
    
    // Only allow changing to the next section if current section is valid
    if (sectionId === 'billing_info' && !isValid.traveler_info) {
      console.log('Cannot move to billing info - traveler info not valid');
      return;
    }
    if (sectionId === 'payment_info' && !isValid.billing_info) {
      console.log('Cannot move to payment info - billing info not valid');
      return;
    }
    
    console.log(`Changing to section: ${sectionId}`);
    setActiveSection(sectionId);
  };

  // Prevent accordion from toggling when clicking on headers
  const handleAccordionValueChange = (_value: string) => {
    // Do nothing - this prevents the accordion from toggling when clicking on headers
    // Navigation will only happen through the explicit buttons
    console.log('Accordion header clicked, but navigation prevented');
  };

  const getSectionFields = (sectionId: string): string[] => {
    if (!config?.sections) return [];
    
    const section = config.sections.find(s => s.id === sectionId);
    if (!section) return [];
    
    // Get all enabled and required fields for this section
    const requiredFields = section.fields
      .filter(field => field.enabled && field.required)
      .map(field => field.name);
      
    console.log(`Required fields for section ${sectionId}:`, requiredFields);
    
    return requiredFields;
  };

  if (loading) {
    console.log('Rendering loading state');
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    console.log('Rendering error state:', error);
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!config) {
    console.log('Rendering no config state');
    return <div className="min-h-screen flex items-center justify-center">No configuration available</div>;
  }

  console.log('Config:', config);
  console.log('Config sections:', config.sections);
  
  // Find the sections by ID
  const travelerInfoSection = config.sections?.find(section => section.id === 'traveler_info');
  const billingInfoSection = config.sections?.find(section => section.id === 'billing_info');
  const paymentInfoSection = config.sections?.find(section => section.id === 'payment_info');
  
  console.log('Found sections:', { 
    travelerInfoSection, 
    billingInfoSection, 
    paymentInfoSection 
  });

  // Create a combined initial values object for all form fields
  const getInitialValues = () => {
    const values: Record<string, string | boolean> = {};
    
    // Add traveler info fields
    travelerInfoSection?.fields.forEach(field => {
      if (field.enabled) {
        values[field.name] = field.name in reduxFormValues 
          ? reduxFormValues[field.name] 
          : field.type === 'checkbox' ? false : '';
      }
    });
    
    // Add billing info fields
    billingInfoSection?.fields.forEach(field => {
      if (field.enabled) {
        values[field.name] = field.name in reduxFormValues 
          ? reduxFormValues[field.name] 
          : field.type === 'checkbox' ? false : '';
      }
    });
    
    // Add payment info fields
    paymentInfoSection?.fields.forEach(field => {
      if (field.enabled) {
        values[field.name] = field.name in reduxFormValues 
          ? reduxFormValues[field.name] 
          : field.type === 'checkbox' ? false : '';
      }
    });
    
    return values;
  };

  const initialValues = getInitialValues();
  console.log('Initial form values:', initialValues);

  return (
    <div className='min-h-screen p-4 md:p-8 flex flex-col lg:flex-row justify-between gap-4 md:gap-8 lg:px-20'>
      {/* Left Column - Form */}
      <div className='w-full lg:w-[736px]'>
        <div className='space-y-4 md:space-y-8'>
          {/* Payment Info Header */}
          <h1 className='text-xl font-semibold'>Payment Info</h1>

          <Formik
            initialValues={initialValues}
            onSubmit={(values) => {
              console.log('Final form submission:', values);
              // Here you would typically send the data to your backend
              alert('Form submitted successfully!');
            }}
          >
            {(formikProps) => {
              // Update form state on every render
              setFormValues(formikProps.values);
              setFormErrors(formikProps.errors);
              
              return (
                <Accordion 
                  type="single" 
                  collapsible 
                  defaultValue="traveler_info"
                  value={activeSection}
                  onValueChange={handleAccordionValueChange}
                  className="w-full [&_[data-slot=accordion-trigger]_svg]:hidden [&_[data-slot=accordion-item]]:border-b-0 [&_[data-slot=accordion-item]]:mb-4"
                >
                  {travelerInfoSection?.enabled && (
                    <AccordionItem value="traveler_info">
                      <AccordionTrigger className="text-lg font-semibold w-full lg:w-[736px] h-[43px] bg-gray-200 hover:no-underline focus:no-underline flex items-center pl-2">
                        1. Traveler Information
                      </AccordionTrigger>
                      <AccordionContent>
                        <TravelerInfo 
                          fields={travelerInfoSection.fields}
                          onNext={() => {
                            console.log('TravelerInfo onNext clicked, current validation state:', isValid.traveler_info);
                            console.log('Current form values:', formikProps.values);
                            console.log('Current form errors:', formikProps.errors);
                            
                            // Force validate traveler info section
                            const isTravelerInfoValid = validateSection('traveler_info', formikProps.values, formikProps.errors);
                            console.log('Force validation result for traveler info:', isTravelerInfoValid);
                            
                            if (isTravelerInfoValid) {
                              // Update validation state
                              setIsValid(prev => ({
                                ...prev,
                                traveler_info: true
                              }));
                              
                              // Change to billing info section
                              setActiveSection('billing_info');
                            } else {
                              console.log('Traveler info validation failed, cannot proceed');
                              // Log the specific fields that are causing validation to fail
                              const sectionFields = getSectionFields('traveler_info');
                              const missingFields = sectionFields.filter(field => {
                                const value = formikProps.values[field];
                                return value === undefined || value === null || 
                                      (typeof value === 'string' && value.trim() === '');
                              });
                              console.log('Missing or invalid fields:', missingFields);
                            }
                          }}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {billingInfoSection?.enabled && (
                    <AccordionItem value="billing_info">
                      <AccordionTrigger 
                        className={`text-lg font-semibold w-full lg:w-[736px] h-[43px] bg-gray-200 hover:no-underline flex items-center pl-2 focus:no-underline ${!isValid.traveler_info ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isValid.traveler_info}
                      >
                        2. Billing Information
                      </AccordionTrigger>
                      <AccordionContent>
                        <BillingInfo 
                          onNext={() => {
                            console.log('BillingInfo onNext clicked, current validation state:', isValid.billing_info);
                            
                            // Force validate billing info section
                            const isBillingInfoValid = validateSection('billing_info', formikProps.values, formikProps.errors);
                            console.log('Force validation result for billing info:', isBillingInfoValid);
                            
                            if (isBillingInfoValid) {
                              // Update validation state
                              setIsValid(prev => ({
                                ...prev,
                                billing_info: true
                              }));
                              
                              // Change to payment info section
                              setActiveSection('payment_info');
                            } else {
                              console.log('Billing info validation failed, cannot proceed');
                            }
                          }}
                          setActiveSection={(section) => handleSectionChange(section === 1 ? 'traveler_info' : 'billing_info')}
                          fields={billingInfoSection.fields}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {paymentInfoSection?.enabled && (
                    <AccordionItem value="payment_info">
                      <AccordionTrigger 
                        className={`text-lg font-semibold flex items-center pl-2 w-full lg:w-[736px] h-[43px] bg-gray-200 hover:no-underline focus:no-underline ${!isValid.billing_info ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isValid.billing_info}
                      >
                        3. Payment Information
                      </AccordionTrigger>
                      <AccordionContent>
                        <PaymentInfo 
                          setActiveSection={(section) => handleSectionChange(section === 1 ? 'traveler_info' : section === 2 ? 'billing_info' : 'payment_info')}
                          fields={paymentInfoSection.fields}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              );
            }}
          </Formik>
        </div>
      </div>

     
      <div className="w-full lg:w-auto  lg:mt-0 flex justify-center lg:justify-start px-4 sm:px-0">
  <TripItinerary />
</div>
    </div>
  );
};

export default CheckoutPage; 