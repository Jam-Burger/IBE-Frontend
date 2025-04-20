import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface StepperState {
    currentStep: number;
}

const initialState: StepperState = {
    currentStep: 0
};

const stepperSlice = createSlice({
    name: 'stepper',
    initialState,
    reducers: {
        setCurrentStep: (state, action: PayloadAction<number>) => {
            state.currentStep = action.payload;
        }
    }
});

export const {setCurrentStep} = stepperSlice.actions;
export default stepperSlice.reducer;