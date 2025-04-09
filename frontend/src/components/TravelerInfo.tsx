import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Field, Formik} from 'formik';
import * as Yup from 'yup';
import {CheckoutField} from '../types';
import {AppDispatch, RootState} from '../redux/store';
import {updateFormData} from '../redux/checkoutSlice';
import {Button} from "./ui";

interface TravelerInfoProps {
    fields: CheckoutField[];
    onNext?: () => void;
}

const TravelerInfo: React.FC<TravelerInfoProps> = ({
                                                       fields,
                                                       onNext
                                                   }) => {
    const dispatch = useDispatch<AppDispatch>();
    const formValues = useSelector((state: RootState) => state.checkout.formData);

    // Create validation schema based on fields
    const validationSchema = Yup.object().shape(
        fields.reduce((acc, field) => {
            if (field.enabled) {
                let fieldSchema;

                // Handle different field types
                if (field.type === 'email') {
                    fieldSchema = Yup.string()
                        .email('Invalid email format')
                        .required(`${field.label} is required`);
                } else if (field.type === 'checkbox') {
                    fieldSchema = Yup.boolean()
                        .oneOf([true], `${field.label} is required`);
                } else {
                    fieldSchema = Yup.string().required(`${field.label} is required`);

                    // Add pattern validation if provided
                    if (field.pattern) {
                        fieldSchema = fieldSchema.matches(
                            new RegExp(field.pattern),
                            `${field.label} is invalid`
                        );
                    }
                }

                acc[field.name] = fieldSchema;
            }
            return acc;
        }, {} as Record<string, Yup.StringSchema | Yup.BooleanSchema>)
    );

    // Create initial values from Redux store or defaults
    const initialValues = fields.reduce((acc, field) => {
        if (field.enabled) {
            acc[field.name] = formValues[field.name] || '';
        }
        return acc;
    }, {} as Record<string, string | boolean>);

    return (
        <div className="py-4">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnMount={true}
                validateOnChange={true}
                validateOnBlur={true}
                onSubmit={(values, {setSubmitting}) => {
                    try {
                        Object.entries(values).forEach(([name, value]) => {
                            dispatch(updateFormData({name, value}));
                        });

                        // Check if all required fields are filled
                        const requiredFields = fields
                            .filter(field => field.enabled && field.required)
                            .map(field => field.name);

                        const allFieldsFilled = requiredFields.every(field => {
                            const value = values[field];
                            return value !== undefined && value !== null && value !== '';
                        });

                        if (allFieldsFilled) {
                            if (onNext) {
                                onNext();
                            }
                        } else {
                            console.error('Please fill in all required fields');
                        }
                    } catch (error) {
                        console.error('Form submission error:', error);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({errors, touched, handleSubmit, setFieldValue, values}) => {
                    // Group fields by their position
                    const firstNameField = fields.find(f => f.name === 'travelerFirstName');
                    const lastNameField = fields.find(f => f.name === 'travelerLastName');
                    const phoneField = fields.find(f => f.name === 'travelerPhone');
                    const emailField = fields.find(f => f.name === 'travelerEmail');
                    const otherFields = fields.filter(f =>
                        !['travelerFirstName', 'travelerLastName', 'travelerPhone', 'travelerEmail'].includes(f.name)
                    );

                    const renderField = (field: CheckoutField) => {
                        if (!field?.enabled) return null;

                        return (
                            <div key={field.name} className="w-full">
                                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>

                                <Field
                                    type={field.type}
                                    name={field.name}
                                    id={field.name}
                                    value={values[field.name]}
                                    className={`block p-3 w-full md:w-[346px] h-[48px] rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        errors[field.name] && touched[field.name] ? 'border-red-500' : ''
                                    }`}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const value = field.type === 'checkbox' ? e.target.checked : e.target.value;
                                        setFieldValue(field.name, value);
                                        dispatch(updateFormData({name: field.name, value}));
                                    }}
                                />

                                {errors[field.name] && touched[field.name] && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors[field.name] as string}
                                    </div>
                                )}
                            </div>
                        );
                    };

                    return (
                        <div className="space-y-4">
                            {/* First Name and Last Name row - stacked on mobile, side by side on desktop */}
                            <div className="flex flex-col md:flex-row md:gap-4 gap-4">
                                {firstNameField && renderField(firstNameField)}
                                {lastNameField && renderField(lastNameField)}
                            </div>

                            {/* Phone field row */}
                            <div>
                                {phoneField && renderField(phoneField)}
                            </div>

                            {/* Email field row */}
                            <div>
                                {emailField && renderField(emailField)}
                            </div>

                            {/* Other fields */}
                            {otherFields.map(field => (
                                <div key={field.name}>
                                    {renderField(field)}
                                </div>
                            ))}

                            {onNext && (
                                <div className="flex justify-end mt-6">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        NEXT: BILLING INFO
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                }}
            </Formik>
        </div>
    );
};

export default TravelerInfo;