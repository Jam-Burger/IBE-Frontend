import {useDispatch} from 'react-redux';
import {updateFormData} from '../redux/checkoutSlice';
import {GenericField} from "../types";

export const useCheckoutForm = () => {
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
        dispatch(updateFormData({[fieldKey]: e.target.value}));
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
        dispatch(updateFormData({[fieldName]: value}));
    };

    return {
        handleInputChange,
        handleSelectChange
    };
}; 