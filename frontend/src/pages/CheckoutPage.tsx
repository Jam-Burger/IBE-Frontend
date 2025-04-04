import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchConfig } from '../redux/configSlice';
import { fetchCheckoutConfig } from '../redux/checkoutSlice';
import { ConfigType } from '../types/ConfigType';
import { Stepper } from '../components';
import { PulseLoader } from 'react-spinners';
import TripItinerary from '../components/TripItinerary';
import { LocationService, Country, State, City } from '../services/LocationService';
import { StateStatus } from '../types';
import { adaptCheckoutSection, Section, CheckoutSection } from '../components/checkout/types';
import { validateField } from '../utils/validation';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

// Import the section components
import TravelerInfoSection from '../components/checkout/TravelerInfoSection';
import BillingInfoSection from '../components/checkout/BillingInfoSection';
import PaymentInfoSection from '../components/checkout/PaymentInfoSection';

// Import GenericField type
import { GenericField } from '../types/GenericField';

const CheckoutPage: React.FC = () => {
    const { tenantId } = useParams<{ tenantId: string }>();
    const dispatch = useAppDispatch();
    const { roomsListConfig } = useAppSelector(state => state.config);
    const { selectedCurrency } = useAppSelector(state => state.currency);
    const { config: checkoutConfig, status: checkoutStatus } = useAppSelector(state => state.checkout);
    
    // Set to 2 for checkout step (assuming 0-indexed steps: 0=search, 1=select room, 2=checkout)
    const [currentStep] = useState(2);
    
    // Form validation state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    
    // Location data state
    const [countries, setCountries] = useState<Country[]>([]);
    const [countryStates, setCountryStates] = useState<Record<string, State[]>>({});
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');
    const [availableStates, setAvailableStates] = useState<State[]>([]);
    const [citiesByState, setCitiesByState] = useState<Record<string, City[]>>({});
    const [availableCities, setAvailableCities] = useState<City[]>([]);

    // Section state
    const [completedSections, setCompletedSections] = useState<string[]>([]);
    const [expandedSection, setExpandedSection] = useState<string>('traveler_info');

    // Get formData from Redux store
    const formData = useSelector((state: RootState) => state.checkout.formData);

    // Fetch countries on component mount
    useEffect(() => {
        const fetchCountriesData = async () => {
            try {
                const countriesData = await LocationService.getCountries();
                setCountries(countriesData);
            } catch (error) {
                console.error('Failed to fetch countries:', error);
            }
        };
        
        fetchCountriesData();
    }, []);

    // Fetch config data
    useEffect(() => {
        if (!tenantId) {
            console.error("Tenant ID is not available");
            return;
        }
        
        // Fetch the rooms list config if not already loaded
        if (!roomsListConfig) {
            dispatch(fetchConfig({ tenantId, configType: ConfigType.ROOMS_LIST }));
        }
        
        // Fetch checkout config
        dispatch(fetchCheckoutConfig(tenantId));
    }, [tenantId, dispatch, roomsListConfig]);
    
    // Initialize country and states when countries are loaded
    useEffect(() => {
        // If there's a billing section with country and state fields, initialize them
        const billingSection = checkoutConfig?.sections.find(section => section.id === 'billing_info');
        
        if (billingSection && countries.length > 0) {
            const countryField = billingSection.fields.find(f => f.label === 'Country' && f.enabled);
            if (countryField) {
                // Set the default country to the first country
                const defaultCountry = countries[0].name;
                setSelectedCountryCode(defaultCountry);
                
                // Fetch states for the default country
                const fetchDefaultStates = async () => {
                    try {
                        const states = await LocationService.getStates(countries[0].iso2);
                        setCountryStates(prev => ({
                            ...prev,
                            [defaultCountry]: states
                        }));
                        setAvailableStates(states);
                        
                        // Set the country value in the DOM element
                        setTimeout(() => {
                            const countryElement = document.getElementById('billing_country') as HTMLElement;
                            if (countryElement) {
                                countryElement.setAttribute('data-value', defaultCountry);
                            }
                        }, 100);
                    } catch (error) {
                        console.error(`Failed to fetch states for default country:`, error);
                    }
                };
                
                fetchDefaultStates();
            }
        }
    }, [checkoutConfig, countries]);
    
    // Get step labels from config or use defaults
    const stepLabels = roomsListConfig?.configData.steps?.labels || ['Search', 'Select Room', 'Checkout'];
    const stepsEnabled = roomsListConfig?.configData.steps?.enabled !== false;
    
    // Configure steps for the stepper
    const configuredSteps = stepLabels.map((label, index) => ({
        id: index,
        label,
        completed: currentStep > index,
    }));
    
    // Handle country change
    const handleCountryChange = async (countryName: string, sectionId: string) => {
        try {
            // Find the country object from the countries array
            const country = countries.find(c => c.name === countryName);
            if (!country) {
                console.error(`Country ${countryName} not found in countries list`);
                return;
            }
            
            // Set the selected country code
            setSelectedCountryCode(countryName);
            
            // Fetch states for the selected country
            const states = await LocationService.getStates(country.iso2);
            setCountryStates(prev => ({
                ...prev,
                [countryName]: states
            }));
            setAvailableStates(states);
            
            // Set the country value in the DOM element
            const countryFieldId = `${sectionId.split('_')[0]}_country`;
            const countryElement = document.getElementById(countryFieldId) as HTMLElement;
            if (countryElement) {
                countryElement.setAttribute('data-value', countryName);
            }
            
            // Clear any state selection if country changes
            const stateFieldId = `${sectionId.split('_')[0]}_state`;
            const stateElement = document.getElementById(stateFieldId) as HTMLSelectElement;
            if (stateElement) {
                stateElement.value = '';
                stateElement.removeAttribute('data-value');
            }
            
            // Clear any state validation errors
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[stateFieldId];
                return newErrors;
            });
        } catch (error) {
            console.error(`Error handling country change to ${countryName}:`, error);
            setAvailableStates([]);
        }
    };
    
    // Handle state change
    const handleStateChange = async (stateName: string, sectionId: string) => {
        try {
            // Store the selected state in a data attribute for more reliable retrieval
            const stateFieldId = `${sectionId.split('_')[0]}_state`;
            const stateElement = document.getElementById(stateFieldId) as HTMLElement;
            if (stateElement) {
                stateElement.setAttribute('data-value', stateName);
            }
            
            // Validate the state against the selected country
            const validStates = countryStates[selectedCountryCode] || [];
            const isValid = validStates.some(s => s.name === stateName);
            
            // Clear any state validation errors if a valid state is selected
            if (isValid) {
                setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[stateFieldId];
                    return newErrors;
                });
                
                // Find the country and state codes for the API
                const country = countries.find(c => c.name === selectedCountryCode);
                const state = validStates.find(s => s.name === stateName);
                
                if (country && state) {
                    // Check if we already have cities for this state
                    const stateKey = `${country.iso2}-${state.iso2}`;
                    if (!citiesByState[stateKey]) {
                        const cities = await LocationService.getCities(country.iso2, state.iso2);
                        setCitiesByState(prev => ({
                            ...prev,
                            [stateKey]: cities
                        }));
                        setAvailableCities(cities);
                    } else {
                        setAvailableCities(citiesByState[stateKey]);
                    }
                    
                    // Clear any city selection when state changes
                    const cityFieldId = `${sectionId.split('_')[0]}_city`;
                    const cityElement = document.getElementById(cityFieldId) as HTMLSelectElement;
                    if (cityElement) {
                        cityElement.value = '';
                        cityElement.removeAttribute('data-value');
                    }
                    
                    // Clear any city validation errors
                    setFormErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors[cityFieldId];
                        return newErrors;
                    });
                }
            } else {
                setFormErrors(prev => ({
                    ...prev,
                    [stateFieldId]: `State is not valid for the selected country`
                }));
                
                // Clear available cities if state is invalid
                setAvailableCities([]);
            }
        } catch (error) {
            console.error(`Error handling state change to ${stateName}:`, error);
            setAvailableCities([]);
        }
    };
    
    // Handle city change
    const handleCityChange = (cityName: string, sectionId: string) => {
        try {
            // Store the selected city in a data attribute for more reliable retrieval
            const cityFieldId = `${sectionId.split('_')[0]}_city`;
            const cityElement = document.getElementById(cityFieldId) as HTMLElement;
            if (cityElement) {
                cityElement.setAttribute('data-value', cityName);
            }
            
            // Clear any city validation errors
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[cityFieldId];
                return newErrors;
            });
        } catch (error) {
            console.error(`Error handling city change to ${cityName}:`, error);
        }
    };
    
    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: GenericField) => {
        console.log(`Field changed: ${field.label}, value: ${e.target.value}`);
        
        // Validate the field
        const error = validateField(field, e.target.value);
        if (error) {
            setFormErrors(prev => ({
                ...prev,
                [`${expandedSection.split('_')[0]}_${field.label.toLowerCase().replace(/\s/g, '_')}`]: error
            }));
        } else {
            // Clear error if it exists
            setFormErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[`${expandedSection.split('_')[0]}_${field.label.toLowerCase().replace(/\s/g, '_')}`];
                return newErrors;
            });
        }
    };

    // Enhance the isSectionComplete function to be more thorough
    const isSectionComplete = (sectionId: string): boolean => {
        // Get the fields for this section
        const sectionConfig = checkoutConfig?.sections.find(s => s.id === sectionId);
        if (!sectionConfig) return false;
        
        // Get required fields
        const requiredFields = sectionConfig.fields.filter(f => f.enabled && f.required);
        
        // If no required fields, section is complete
        if (requiredFields.length === 0) return true;
        
        // Debug logging
        console.log(`Checking ${requiredFields.length} required fields for section ${sectionId}`);
        
        // Check if all required fields have values in formData
        const isComplete = requiredFields.every(field => {
            const fieldKey = `${sectionId.replace('_info', '')}_${field.label.toLowerCase().replace(/\s/g, '_')}`;
            const hasValue = !!formData[fieldKey];
            
            // Debug logging
            console.log(`Field ${fieldKey}: ${hasValue ? 'has value' : 'missing'}`);
            
            return hasValue;
        });
        
        console.log(`Section ${sectionId} complete: ${isComplete}`);
        return isComplete;
    };

    // Modify handleSectionExpand to be more strict
    const handleSectionExpand = (sectionId: string) => {
        console.log(`Attempting to expand section: ${sectionId}`);
        
        // Only allow expanding the current section or a completed section
        if (sectionId !== expandedSection) {
            // If trying to move forward, validate current section
            if (expandedSection === 'traveler_info' && sectionId === 'billing_info') {
                if (!isSectionComplete('traveler_info')) {
                    console.log('Traveler section incomplete, preventing navigation');
                    // Show error message
                    setFormErrors(prev => ({
                        ...prev,
                        section_error: 'Please fill all required fields in Traveler Information'
                    }));
                    return;
                }
            }
            
            if (expandedSection === 'billing_info' && sectionId === 'payment_info') {
                if (!isSectionComplete('billing_info')) {
                    console.log('Billing section incomplete, preventing navigation');
                    // Show error message
                    setFormErrors(prev => ({
                        ...prev,
                        section_error: 'Please fill all required fields in Billing Information'
                    }));
                    return;
                }
            }
            
            // If trying to move backward, always allow
            if (
                (expandedSection === 'billing_info' && sectionId === 'traveler_info') ||
                (expandedSection === 'payment_info' && (sectionId === 'traveler_info' || sectionId === 'billing_info'))
            ) {
                console.log('Moving backward, allowing navigation');
                setExpandedSection(sectionId);
                setFormErrors(prev => ({...prev, section_error: ''}));
                return;
            }
            
            // If section is already completed, allow expanding it
            if (completedSections.includes(sectionId)) {
                console.log('Section already completed, allowing navigation');
                setExpandedSection(sectionId);
                setFormErrors(prev => ({...prev, section_error: ''}));
                return;
            }
            
            // If we get here and we're not expanding the current section,
            // it means we're trying to skip ahead, which we should prevent
            if (sectionId !== expandedSection) {
                console.log('Attempting to skip ahead, preventing navigation');
                return;
            }
        }
        
        // If validation passes or it's the current section, expand it
        console.log('Expanding section');
        setExpandedSection(sectionId);
        setFormErrors(prev => ({...prev, section_error: ''}));
    };

    // Also update handleNextStep to be more robust
    const handleNextStep = () => {
        if (expandedSection === 'traveler_info') {
            if (isSectionComplete('traveler_info')) {
                console.log('Traveler section complete, moving to billing');
                setExpandedSection('billing_info');
                setCompletedSections(prev => {
                    if (!prev.includes('traveler_info')) {
                        return [...prev, 'traveler_info'];
                    }
                    return prev;
                });
                setFormErrors(prev => ({...prev, section_error: ''}));
            } else {
                console.log('Traveler section incomplete, showing error');
                // Show error message
                setFormErrors(prev => ({
                    ...prev,
                    section_error: 'Please fill all required fields in Traveler Information'
                }));
            }
        } else if (expandedSection === 'billing_info') {
            if (isSectionComplete('billing_info')) {
                console.log('Billing section complete, moving to payment');
                setExpandedSection('payment_info');
                setCompletedSections(prev => {
                    if (!prev.includes('billing_info')) {
                        return [...prev, 'billing_info'];
                    }
                    return prev;
                });
                setFormErrors(prev => ({...prev, section_error: ''}));
            } else {
                console.log('Billing section incomplete, showing error');
                // Show error message
                setFormErrors(prev => ({
                    ...prev,
                    section_error: 'Please fill all required fields in Billing Information'
                }));
            }
        }
    };

    // Loading state
    if (checkoutStatus === StateStatus.LOADING) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <PulseLoader color="var(--primary-color)" size={15}/>
                <p className="mt-4 text-gray-600">
                    Loading checkout configuration...
                </p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-white">
            <div className="w-full">
                {/* Use the reusable Stepper component */}
                {stepsEnabled && (
                    <Stepper 
                        steps={configuredSteps}
                        currentStep={currentStep}
                    />
                )}
                
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 px-6 py-8">
                    {/* Left column - Payment form */}
                    <div className="w-full lg:w-7/12">
                        <div className="rounded-lg">
                            <h1 className="text-xl font-bold mb-6 text-[#333]">Payment Info</h1>
                            
                            {/* Traveler Info Section */}
                            {checkoutConfig?.sections.find(section => section.id === 'traveler_info') && (
                                <TravelerInfoSection
                                    section={adaptCheckoutSection(checkoutConfig.sections.find(section => section.id === 'traveler_info')!) as CheckoutSection}
                                    expandedSection={expandedSection}
                                    completedSections={completedSections}
                                    formErrors={formErrors}
                                    handleInputChange={handleInputChange}
                                    handleNextStep={handleNextStep}
                                    handleSectionExpand={handleSectionExpand}
                                />
                            )}
                            
                            {/* Billing Info Section */}
                            {checkoutConfig?.sections.find(section => section.id === 'billing_info') && (
                                <BillingInfoSection
                                    section={adaptCheckoutSection(checkoutConfig.sections.find(section => section.id === 'billing_info')!) as Section}
                                    expandedSection={expandedSection}
                                    completedSections={completedSections}
                                    formErrors={formErrors}
                                    handleInputChange={handleInputChange}
                                    handleNextStep={handleNextStep}
                                    handleSectionExpand={handleSectionExpand}
                                    countries={countries}
                                    selectedCountryCode={selectedCountryCode}
                                    availableStates={availableStates}
                                    availableCities={availableCities}
                                    handleCountryChange={handleCountryChange}
                                    handleStateChange={handleStateChange}
                                    handleCityChange={handleCityChange}
                                />
                            )}
                            
                            {/* Payment Info Section */}
                            {checkoutConfig?.sections.find(section => section.id === 'payment_info') && (
                                <PaymentInfoSection
                                    section={adaptCheckoutSection(checkoutConfig.sections.find(section => section.id === 'payment_info')!) as Section}
                                    expandedSection={expandedSection}
                                    completedSections={completedSections}
                                    formErrors={formErrors}
                                    handleInputChange={handleInputChange}
                                    handleNextStep={handleNextStep}
                                    handleSectionExpand={handleSectionExpand}
                                    handleSubmit={() => {
                                        console.log('Booking submitted!');
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    
                    {/* Right column - Order summary and Help */}
                    <div className="w-full lg:w-5/12 lg:pl-12">
                        <TripItinerary 
                            currency={selectedCurrency?.symbol || 'USD'} 
                            onRemove={() => console.log('Remove itinerary')}
                        />
                        
                        {/* Help section */}
                        <div className="w-[400px] h-[150px] bg-gray-100 p-6 rounded-lg mt-6">
                            <h2 className="text-xl font-bold mb-3">Need help?</h2>
                            <p className="font-bold">Call 1-800-555-5555</p>
                            <p className="text-sm text-gray-600">Mon-Fri 8a-5p EST</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage; 