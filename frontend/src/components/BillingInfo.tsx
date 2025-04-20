import React, {useEffect, useMemo, useState} from 'react';
import {ErrorMessage, Field, Form, Formik} from 'formik';
import * as Yup from 'yup';
import {CheckoutField} from '../types';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../redux/store';
import {updateFormData} from '../redux/checkoutSlice';
import {api} from '../lib/api-client';
import {Button} from "./ui";
import {useAuth} from "react-oidc-context";

interface BillingInfoProps {
    onNext: (section: number) => void;
    setActiveSection: (section: number) => void;
    fields: CheckoutField[];
}

interface BillingFormValues {
    billingFirstName: string;
    billingLastName: string;
    billingAddress1: string;
    billingAddress2: string;
    billingCountry: string;
    billingState: string;
    billingZip: string;
    billingPhone: string;
    billingEmail: string;
    billingCity: string;
}

interface Country {
    iso2: string;
    name: string;
}

interface State {
    iso2: string;
    name: string;
}

interface City {
    name: string;
}

const BillingInfo: React.FC<BillingInfoProps> = ({onNext, setActiveSection, fields}) => {
    const dispatch = useDispatch<AppDispatch>();
    const auth = useAuth();
    const formValues = useSelector((state: RootState) => state.checkout.formData);

    // State for countries and states
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(false);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    // Find specific fields by name
    const firstNameField = fields.find(field => field.name === 'billingFirstName');
    const lastNameField = fields.find(field => field.name === 'billingLastName');
    const address1Field = fields.find(field => field.name === 'billingAddress1');
    const address2Field = fields.find(field => field.name === 'billingAddress2');
    const countryField = fields.find(field => field.name === 'billingCountry');
    const stateField = fields.find(field => field.name === 'billingState');
    const zipField = fields.find(field => field.name === 'billingZip');
    const phoneField = fields.find(field => field.name === 'billingPhone');
    const emailField = fields.find(field => field.name === 'billingEmail');
    const cityField = fields.find(field => field.name === 'billingCity');

    // Function to fetch states when a country is selected
    const fetchStates = async (countryCode: string) => {
        setIsLoadingStates(true);
        try {
            const response = await api.getStates(countryCode);
            if (response.status !== 200) {
                throw new Error('Failed to fetch states');
            }

            setStates(response.data);
        } catch (error) {
            console.error('Error fetching states:', error);
        } finally {
            setIsLoadingStates(false);
        }
    };

    // Function to fetch cities when a state is selected
    const fetchCities = async (countryCode: string, stateCode: string) => {
        if (!countryCode || !stateCode) {
            setCities([]);
            return;
        }

        setIsLoadingCities(true);
        try {
            const response = await api.getCities(countryCode, stateCode);

            if (response.status !== 200) {
                throw new Error('Failed to fetch cities');
            }

            setCities(response.data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setIsLoadingCities(false);
        }
    };

    // Fetch countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            setIsLoadingCountries(true);
            try {
                const response = await api.getCountries();

                if (response.status !== 200) {
                    throw new Error('Failed to fetch countries');
                }

                setCountries(response.data);
            } catch (error) {
                console.error('Error fetching countries:', error);
            } finally {
                setIsLoadingCountries(false);
            }
        };

        fetchCountries();
    }, []);

    // Set billing email from authenticated user's profile when logged in
    useEffect(() => {
        if (auth.user?.profile.email) {
            dispatch(updateFormData({name: 'billingEmail', value: auth.user.profile.email}));
        }
    }, [auth.user, dispatch]);

    useEffect(() => {
        if (formValues.billingCountry) {
            fetchStates(formValues.billingCountry as string);
        } else {
            setStates([]);
            setCities([]);
        }
    }, [formValues.billingCountry]);

    useEffect(() => {
        if (formValues.billingCountry && formValues.billingState) {
            fetchCities(formValues.billingCountry as string, formValues.billingState as string);
        } else {
            setCities([]);
        }
    }, [formValues.billingCountry, formValues.billingState]);

    // Create validation schema based on field patterns
    const validationSchema = Yup.object().shape({
        billingFirstName: firstNameField?.enabled && firstNameField?.required
            ? Yup.string()
                .matches(
                    new RegExp(firstNameField.pattern || '.*'),
                    'Invalid format'
                )
                .required('First name is required')
            : Yup.string(),
        billingLastName: lastNameField?.enabled && lastNameField?.required
            ? Yup.string()
                .matches(
                    new RegExp(lastNameField.pattern || '.*'),
                    'Invalid format'
                )
                .required('Last name is required')
            : Yup.string(),
        billingAddress1: address1Field?.enabled && address1Field?.required
            ? Yup.string()
                .required('Address is required')
            : Yup.string(),
        billingAddress2: Yup.string(),
        billingCountry: countryField?.enabled && countryField?.required
            ? Yup.string()
                .required('Country is required')
            : Yup.string(),
        billingState: stateField?.enabled && stateField?.required
            ? Yup.string()
                .required('State is required')
            : Yup.string(),
        billingZip: zipField?.enabled && zipField?.required
            ? Yup.string()
                .matches(
                    new RegExp(zipField.pattern || '.*'),
                    'Invalid zip code format'
                )
                .required('Zip code is required')
            : Yup.string(),
        billingPhone: phoneField?.enabled && phoneField?.required
            ? Yup.string()
                .matches(
                    new RegExp(phoneField.pattern || '.*'),
                    'Invalid phone format'
                )
                .required('Phone is required')
            : Yup.string(),
        billingEmail: emailField?.enabled && emailField?.required
            ? Yup.string()
                .email('Invalid email format')
                .required('Email is required')
            : Yup.string(),
        billingCity: cityField?.enabled && cityField?.required
            ? Yup.string()
                .required('City is required')
            : Yup.string(),
    });


    const initialValues: BillingFormValues = useMemo(() => {
        // For authenticated users, always use their profile email
        const emailValue = auth.user?.profile.email || formValues.billingEmail?.toString() || '';
        
        return {
            billingFirstName: formValues.billingFirstName?.toString() || '',
            billingLastName: formValues.billingLastName?.toString() || '',
            billingAddress1: formValues.billingAddress1?.toString() || '',
            billingAddress2: formValues.billingAddress2?.toString() || '',
            billingCountry: formValues.billingCountry?.toString() || '',
            billingState: formValues.billingState?.toString() || '',
            billingZip: formValues.billingZip?.toString() || '',
            billingPhone: formValues.billingPhone?.toString() || '',
            billingEmail: emailValue,
            billingCity: formValues.billingCity?.toString() || '',
        }
    }, [formValues, auth.user]);

    return (
        <div className="min-w-[680px] py-4">
            <Formik<BillingFormValues>
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnBlur={true}
                validateOnChange={true}
                onSubmit={(values: BillingFormValues, {setSubmitting}) => {
                    try {
                        // Update all form values in Redux store
                        Object.entries(values).forEach(([key, value]) => {
                            dispatch(updateFormData({name: key, value}));
                        });

                        // Check if all required fields are filled
                        const requiredFields = [
                            'billingFirstName',
                            'billingLastName',
                            'billingAddress1',
                            'billingCountry',
                            'billingCity',
                            'billingState',
                            'billingZip',
                            'billingPhone',
                            'billingEmail'
                        ] as const;

                        const allFieldsFilled = requiredFields.every(field => Boolean(values[field]));

                        // Validate the form values against the schema
                        validationSchema.validateSync(values, {abortEarly: false});

                        if (allFieldsFilled) {
                            onNext(3);
                        } else {
                            console.error('Please fill in all required fields correctly');
                        }
                    } catch (error) {
                        console.error('Validation error:', error);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({errors, touched, setFieldValue, values, isSubmitting}) => (
                    <Form className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* First Name */}
                            <div className="flex-1">
                                <label className="block text-[#5D5D5D] text-sm mb-1">
                                    First Name
                                    {firstNameField?.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {firstNameField?.enabled && (
                                    <div>
                                        <Field
                                            type={firstNameField.type}
                                            name="billingFirstName"
                                            value={values.billingFirstName}
                                            className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[340px] h-[48px] ${errors.billingFirstName && touched.billingFirstName ? 'border-red-500' : ''}`}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                setFieldValue('billingFirstName', value);
                                                dispatch(updateFormData({name: 'billingFirstName', value}));
                                            }}
                                        />
                                        <ErrorMessage name="billingFirstName" component="div"
                                                      className="text-red-500 text-xs mt-1"/>
                                    </div>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="flex-1">
                                <label className="block text-[#5D5D5D] text-sm mb-1">
                                    Last Name
                                    {lastNameField?.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {lastNameField?.enabled && (
                                    <div>
                                        <Field
                                            type={lastNameField.type}
                                            name="billingLastName"
                                            value={values.billingLastName}
                                            className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[340px] h-[48px] ${errors.billingLastName && touched.billingLastName ? 'border-red-500' : ''}`}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                setFieldValue('billingLastName', value);
                                                dispatch(updateFormData({name: 'billingLastName', value}));
                                            }}
                                        />
                                        <ErrorMessage name="billingLastName" component="div"
                                                      className="text-red-500 text-xs mt-1"/>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mailing Address 1 and 2 in a row */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Mailing Address 1 */}
                            <div className="flex-1">
                                <label className="block text-[#5D5D5D] text-sm mb-1">
                                    Mailing Address1
                                    {address1Field?.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {address1Field?.enabled && (
                                    <div>
                                        <Field
                                            type={address1Field.type}
                                            name="billingAddress1"
                                            value={values.billingAddress1}
                                            className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[340px] h-[48px] ${errors.billingAddress1 && touched.billingAddress1 ? 'border-red-500' : ''}`}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                setFieldValue('billingAddress1', value);
                                                dispatch(updateFormData({name: 'billingAddress1', value}));
                                            }}
                                        />
                                        <ErrorMessage name="billingAddress1" component="div"
                                                      className="text-red-500 text-xs mt-1"/>
                                    </div>
                                )}
                            </div>

                            {/* Mailing Address 2 */}
                            <div className="flex-1">
                                <label className="block text-[#5D5D5D] text-sm mb-1">
                                    Mailing Address2
                                    {address2Field?.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {address2Field?.enabled && (
                                    <div>
                                        <Field
                                            type={address2Field.type}
                                            name="billingAddress2"
                                            value={values.billingAddress2}
                                            className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[340px] h-[48px] ${errors.billingAddress2 && touched.billingAddress2 ? 'border-red-500' : ''}`}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                setFieldValue('billingAddress2', value);
                                                dispatch(updateFormData({name: 'billingAddress2', value}));
                                            }}
                                        />
                                        <ErrorMessage name="billingAddress2" component="div"
                                                      className="text-red-500 text-xs mt-1"/>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-[#5D5D5D] text-sm mb-1">
                                Country
                                {countryField?.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {countryField?.enabled && (
                                <div>
                                    <Field
                                        as="select"
                                        name="billingCountry"
                                        value={values.billingCountry}
                                        className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[340px] h-[48px] ${errors.billingCountry && touched.billingCountry ? 'border-red-500' : ''}`}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            const value = e.target.value;
                                            setFieldValue('billingCountry', value);
                                            setFieldValue('billingState', ''); // Reset state when country changes
                                            setFieldValue('billingCity', ''); // Reset city when country changes
                                            dispatch(updateFormData({name: 'billingCountry', value}));
                                            dispatch(updateFormData({name: 'billingState', value: ''}));
                                            dispatch(updateFormData({name: 'billingCity', value: ''}));

                                            // Fetch states for the selected country
                                            if (value) {
                                                fetchStates(value);
                                            } else {
                                                setStates([]);
                                                setCities([]);
                                            }
                                        }}
                                    >
                                        <option value="">Choose Country</option>
                                        {isLoadingCountries ? (
                                            <option value="" disabled>Loading countries...</option>
                                        ) : (
                                            countries.map((country) => (
                                                <option key={country.iso2} value={country.iso2}>
                                                    {country.name}
                                                </option>
                                            ))
                                        )}
                                    </Field>
                                    <ErrorMessage name="billingCountry" component="div"
                                                  className="text-red-500 text-xs mt-1"/>
                                </div>
                            )}
                        </div>

                        {/* City, State, Zip in a row */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* City */}
                            <div>
                                <label className="block text-[#5D5D5D] text-sm mb-1">
                                    City
                                    {cityField?.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {cityField?.enabled && (
                                    <div>
                                        <Field
                                            as="select"
                                            name="billingCity"
                                            value={values.billingCity}
                                            className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[340px] h-[48px] ${errors.billingCity && touched.billingCity ? 'border-red-500' : ''}`}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                const value = e.target.value;
                                                setFieldValue('billingCity', value);
                                                dispatch(updateFormData({name: 'billingCity', value}));
                                            }}
                                            disabled={!values.billingState || isLoadingCities}
                                        >
                                            <option value="">Choose City</option>
                                            {isLoadingCities ? (
                                                <option value="" disabled>Loading cities...</option>
                                            ) : (
                                                cities.map((city, index) => (
                                                    <option key={index} value={city.name}>
                                                        {city.name}
                                                    </option>
                                                ))
                                            )}
                                        </Field>
                                        <ErrorMessage name="billingCity" component="div"
                                                      className="text-red-500 text-xs mt-1"/>
                                    </div>
                                )}
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-[#5D5D5D] text-sm mb-1">
                                    State
                                    {stateField?.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {stateField?.enabled && (
                                    <div>
                                        <Field
                                            as="select"
                                            name="billingState"
                                            initialValue={values.billingState}
                                            className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[184px] h-[48px] ${errors.billingState && touched.billingState ? 'border-red-500' : ''}`}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                const value = e.target.value;
                                                setFieldValue('billingState', value);
                                                setFieldValue('billingCity', ''); // Reset city when state changes
                                                dispatch(updateFormData({name: 'billingState', value}));
                                                dispatch(updateFormData({name: 'billingCity', value: ''}));
                                            }}
                                            disabled={!values.billingCountry || isLoadingStates}
                                        >
                                            <option value="">Choose State</option>
                                            {isLoadingStates ? (
                                                <option value="" disabled>Loading states...</option>
                                            ) : (
                                                states.map((state) => (
                                                    <option key={state.iso2} value={state.iso2}>
                                                        {state.name}
                                                    </option>
                                                ))
                                            )}
                                        </Field>
                                        <ErrorMessage name="billingState" component="div"
                                                      className="text-red-500 text-xs mt-1"/>
                                    </div>
                                )}
                            </div>

                            {/* Zip */}
                            <div>
                                <label className="block text-[#5D5D5D] text-sm mb-1">
                                    Zip
                                    {zipField?.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {zipField?.enabled && (
                                    <div>
                                        <Field
                                            type={zipField.type}
                                            name="billingZip"
                                            value={values.billingZip}
                                            className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[145px] h-[48px] ${errors.billingZip && touched.billingZip ? 'border-red-500' : ''}`}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                setFieldValue('billingZip', value);
                                                dispatch(updateFormData({name: 'billingZip', value}));
                                            }}
                                        />
                                        <ErrorMessage name="billingZip" component="div"
                                                      className="text-red-500 text-xs mt-1"/>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-[#5D5D5D] text-sm mb-1">
                                Phone
                                {phoneField?.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {phoneField?.enabled && (
                                <div>
                                    <Field
                                        type={phoneField.type}
                                        name="billingPhone"
                                        value={values.billingPhone}
                                        className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[340px] h-[48px] ${errors.billingPhone && touched.billingPhone ? 'border-red-500' : ''}`}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const value = e.target.value;
                                            setFieldValue('billingPhone', value);
                                            dispatch(updateFormData({name: 'billingPhone', value}));
                                        }}
                                    />
                                    <ErrorMessage name="billingPhone" component="div"
                                                  className="text-red-500 text-xs mt-1"/>
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[#5D5D5D] text-sm mb-1">
                                Email
                                {emailField?.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {emailField?.enabled && (
                                <div>
                                    <Field
                                        type={emailField.type}
                                        name="billingEmail"
                                        value={values.billingEmail}
                                        disabled={!!auth.user?.profile.email}
                                        className={`border border-[#CCCCCC] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed p-2 rounded w-full md:w-[340px] h-[48px] ${errors.billingEmail && touched.billingEmail ? 'border-red-500' : ''}`}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const value = e.target.value;
                                            setFieldValue('billingEmail', value);
                                            dispatch(updateFormData({name: 'billingEmail', value}));
                                        }}
                                    />
                                    <ErrorMessage name="billingEmail" component="div"
                                                  className="text-red-500 text-xs mt-1"/>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end items-center mt-8 gap-4">
                            <button
                                type="button"
                                className="text-primary text-sm cursor-pointer"
                                onClick={() => setActiveSection(1)}
                            >
                                Edit Traveler Info
                            </button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                NEXT: PAYMENT INFO
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default BillingInfo;