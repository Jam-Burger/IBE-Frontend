import React from "react";
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {useNavigate, useParams} from "react-router-dom";
import {FaCheck} from "react-icons/fa";
import {cn} from "../lib/utils";
import {setCurrentStep} from "../redux/stepperSlice.ts";

const Stepper: React.FC = () => {
    const {roomsListConfig} = useAppSelector((state) => state.config);
    const {tenantId} = useParams<{ tenantId: string }>();
    const currentStep = useAppSelector((state) => state.stepper.currentStep);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    if (!roomsListConfig || !roomsListConfig.configData.steps.enabled)
        return null;

    const stepsConfig = roomsListConfig.configData.steps;
    const steps = stepsConfig.labels.map((label, index) => ({
        id: index,
        label,
        completed: false,
    }));

    const handleStepClick = (stepId: number) => {
        if (tenantId && stepId < currentStep) {
            dispatch(setCurrentStep(stepId));
            navigate(`/${tenantId}/rooms-list`);
        }
    };

    return (
        <div className="h-[92px] flex-shrink-0 bg-[#E4E4E4] flex items-center justify-center mb-8">
            <div className="flex items-center justify-center h-[92px] flex-shrink-0">
                <div className="w-[300px] md:w-[417px] relative">
                    <div className="flex items-center justify-between relative">
                        <div
                            className={`absolute top-[14px] h-[2px] left-[32px] right-[50%] z-[1] ${
                                currentStep > 0 ? "bg-primary" : "bg-gray-300"
                            }`}
                        ></div>

                        <div
                            className={`absolute top-[14px] h-[2px] left-[50%] right-[32px] z-[1] ${
                                currentStep > 1 ? "bg-primary" : "bg-gray-300"
                            }`}
                        ></div>

                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center z-10 max-w-[200px] text-center"
                                onClick={() => handleStepClick(step.id)}
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm cursor-pointer",
                                        index === currentStep
                                            ? "bg-destructive"
                                            : step.completed ||
                                            index < currentStep
                                                ? "bg-primary"
                                                : "bg-gray-300"
                                    )}
                                >
                                    {step.completed || index <= currentStep ? (
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
