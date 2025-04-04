import React from 'react';
import { cn } from "../lib/utils";
import { FaCheck } from "react-icons/fa";

export interface StepperProps {
    steps: Array<{
        id: number;
        label: string;
        completed: boolean;
    }>;
    currentStep: number;
    onStepClick?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({
    steps,
    currentStep,
    onStepClick
}) => {
    return (
        <div className="h-[92px] flex-shrink-0 bg-[#E4E4E4] flex items-center justify-center mb-8">
            <div className="flex items-center justify-center h-[92px] flex-shrink-0">
                <div className="w-[300px] md:w-[417px] relative">
                    <div className="flex items-center justify-between relative">
                        <div
                            className={`absolute top-[14px] h-[2px] left-[32px] right-[50%] z-[1] ${
                                currentStep > 0
                                    ? "bg-primary"
                                    : "bg-gray-300"
                            }`}
                        ></div>

                        <div
                            className={`absolute top-[14px] h-[2px] left-[50%] right-[32px] z-[1] ${
                                currentStep > 1
                                    ? "bg-primary"
                                    : "bg-gray-300"
                            }`}
                        ></div>

                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center z-10"
                                onClick={() => onStepClick && onStepClick(step.id)}
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm cursor-pointer",
                                        index === currentStep
                                            ? "bg-[#D0182B]"
                                            : step.completed ||
                                            index < currentStep
                                                ? "bg-[#26266D]"
                                                : "bg-gray-300"
                                    )}
                                >
                                    {step.completed ||
                                    index <= currentStep ? (
                                        <FaCheck size={16}/>
                                    ) : (
                                        ""
                                    )}
                                </div>

                                <span
                                    className={cn(
                                        "text-xs mt-1",
                                        index === currentStep
                                            ? "text-primary font-medium"
                                            : "text-gray-500"
                                    )}
                                >
                                    {index + 1}. {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stepper; 