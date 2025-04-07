import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CheckoutField } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { updateFormData } from '../redux/checkoutSlice';

interface PaymentInfoProps {
  setActiveSection: (section: number) => void;
  fields: CheckoutField[];
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({ setActiveSection, fields }) => {
  const dispatch = useDispatch<AppDispatch>();
  const formValues = useSelector((state: RootState) => state.checkout.formData);
  
  // Find specific fields by name
  const cardNameField = fields.find(field => field.name === 'cardName');
  const expMonthField = fields.find(field => field.name === 'expMonth');
  const expYearField = fields.find(field => field.name === 'expYear');
  const cvvField = fields.find(field => field.name === 'cvv');
  const receiveOffersField = fields.find(field => field.name === 'receiveOffers');
  const agreedToTermsField = fields.find(field => field.name === 'agreedToTerms');

  // Create validation schema based on field patterns
  const validationSchema = Yup.object().shape({
    cardName: cardNameField?.enabled && cardNameField?.required
      ? Yup.string()
          .matches(
            new RegExp(cardNameField.pattern || '.*'),
            'Invalid format'
          )
          .required('Card name is required')
      : Yup.string(),
    expMonth: expMonthField?.enabled && expMonthField?.required
      ? Yup.string()
          .matches(
            new RegExp(expMonthField.pattern || '.*'),
            'Invalid month format (MM)'
          )
          .required('Expiration month is required')
      : Yup.string(),
    expYear: expYearField?.enabled && expYearField?.required
      ? Yup.string()
          .matches(
            new RegExp(expYearField.pattern || '.*'),
            'Invalid year format (YY)'
          )
          .required('Expiration year is required')
      : Yup.string(),
    cvv: cvvField?.enabled && cvvField?.required
      ? Yup.string()
          .matches(
            new RegExp(cvvField.pattern || '.*'),
            'Invalid CVV format'
          )
          .required('CVV is required')
      : Yup.string(),
    receiveOffers: receiveOffersField?.enabled && receiveOffersField?.required
      ? Yup.boolean()
          .oneOf([true], 'You must agree to receive offers')
      : Yup.boolean(),
    agreedToTerms: agreedToTermsField?.enabled && agreedToTermsField?.required
      ? Yup.boolean()
          .oneOf([true], 'You must agree to the terms')
      : Yup.boolean()
  });

  // Create initial values from Redux store or defaults
  const initialValues = {
    cardName: formValues.cardName || '',
    expMonth: formValues.expMonth || '',
    expYear: formValues.expYear || '',
    cvv: formValues.cvv || '',
    receiveOffers: formValues.receiveOffers || false,
    agreedToTerms: formValues.agreedToTerms || false
  };

  return (
    <div className="p-4" >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          console.log('Payment info submitted:', values);
          // Here you would typically send the data to your backend
          alert('Form submitted successfully!');
        }}
      >
        {({ errors, touched, setFieldValue }) => (
          <Form className="space-y-4">
            {/* Card Name, Exp Month and Year in a row on desktop, stacked on mobile */}
            <div className="flex flex-col md:flex-row md:gap-4 gap-4">
              {/* Card Name */}
              {cardNameField?.enabled && (
                <div className="w-full">
                  <label className="block text-[#5D5D5D] text-sm mb-1">
                    Card Name
                    {cardNameField?.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Field
                    type={cardNameField.type}
                    name="cardName"
                    placeholder={cardNameField.label}
                    className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[340px] h-[48px] ${errors.cardName && touched.cardName ? 'border-red-500' : ''}`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      setFieldValue('cardName', value);
                      dispatch(updateFormData({ name: 'cardName', value }));
                    }}
                  />
                  <ErrorMessage name="cardName" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              )}

              {/* Expiration Month and Year in a row on both mobile and desktop */}
              <div className="flex gap-4 w-full">
                {/* Expiration Month */}
                {expMonthField?.enabled && (
                  <div className="w-1/2 md:w-auto">
                    <label className="block text-[#5D5D5D] text-sm mb-1">
                      Exp Month
                      {expMonthField?.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <Field
                      type={expMonthField.type}
                      name="expMonth"
                      placeholder={expMonthField.label}
                      className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[164px] h-[48px] ${errors.expMonth && touched.expMonth ? 'border-red-500' : ''}`}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        setFieldValue('expMonth', value);
                        dispatch(updateFormData({ name: 'expMonth', value }));
                      }}
                    />
                    <ErrorMessage name="expMonth" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                )}
                
                {/* Expiration Year */}
                {expYearField?.enabled && (
                  <div className="w-1/2 md:w-auto">
                    <label className="block text-[#5D5D5D] text-sm mb-1">
                      Exp Year
                      {expYearField?.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <Field
                      type={expYearField.type}
                      name="expYear"
                      placeholder={expYearField.label}
                      className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[164px] h-[48px] ${errors.expYear && touched.expYear ? 'border-red-500' : ''}`}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        setFieldValue('expYear', value);
                        dispatch(updateFormData({ name: 'expYear', value }));
                      }}
                    />
                    <ErrorMessage name="expYear" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                )}
              </div>
            </div>
            
            {/* CVV */}
            {cvvField?.enabled && (
              <div>
                <label className="block text-[#5D5D5D] text-sm mb-1">
                  CVV
                  {cvvField?.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <Field
                  type={cvvField.type}
                  name="cvv"
                  placeholder={cvvField.label}
                  className={`border border-[#CCCCCC] p-2 rounded w-full md:w-[164px] h-[48px] ${errors.cvv && touched.cvv ? 'border-red-500' : ''}`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    setFieldValue('cvv', value);
                    dispatch(updateFormData({ name: 'cvv', value }));
                  }}
                />
                <ErrorMessage name="cvv" component="div" className="text-red-500 text-xs mt-1" />
              </div>
            )}
            
            {/* Checkboxes */}
            <div className="space-y-2">
              {receiveOffersField?.enabled && (
                <div className="flex items-center">
                  <Field
                    type="checkbox"
                    name="receiveOffers"
                    id="receiveOffers"
                    className="mr-2"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.checked;
                      setFieldValue('receiveOffers', value);
                      dispatch(updateFormData({ name: 'receiveOffers', value }));
                    }}
                  />
                  <label htmlFor="receiveOffers" className="text-sm">
                    {receiveOffersField.label}
                    {receiveOffersField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {errors.receiveOffers && touched.receiveOffers && (
                    <div className="text-red-500 text-xs ml-2">
                      {errors.receiveOffers as string}
                    </div>
                  )}
                </div>
              )}
              
              {agreedToTermsField?.enabled && (
                <div className="flex items-center">
                  <Field
                    type="checkbox"
                    name="agreedToTerms"
                    id="agreedToTerms"
                    className="mr-2"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.checked;
                      setFieldValue('agreedToTerms', value);
                      dispatch(updateFormData({ name: 'agreedToTerms', value }));
                    }}
                  />
                  <label htmlFor="agreedToTerms" className="text-sm">
                    {agreedToTermsField.label}
                    {agreedToTermsField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {errors.agreedToTerms && touched.agreedToTerms && (
                    <div className="text-red-500 text-xs ml-2">
                      {errors.agreedToTerms as string}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className='flex flex-col md:flex-row md:justify-end items-center gap-4 pt-4'>
              <button 
                type="button"
                className='text-blue-600 w-full md:w-auto'
                onClick={() => setActiveSection(2)}
              >
                Edit Billing Info
              </button>
              <button 
                type="submit"
                className='bg-indigo-900 text-white px-6 py-2 rounded w-full md:w-auto'
              >
                SUBMIT PAYMENT
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PaymentInfo;