import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {Formik} from "formik";
import TravelerInfo from "../components/TravelerInfo";
import BillingInfo from "../components/BillingInfo";
import PaymentInfo from "../components/PaymentInfo";
import TripItinerary from "../components/TripItinerary";
import {AppDispatch} from "../redux/store";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "../components/ui";
import {useNavigate, useParams} from "react-router-dom";
import {ConfigType, PromoOffer, SpecialDiscount, StandardPackage, StateStatus, Booking} from "../types";
import {useAppSelector} from "../redux/hooks.ts";
import {fetchConfig} from "../redux/configSlice.ts";
import {clearBookingStatus, clearFormData, fetchPropertyDetails, submitBooking,} from "../redux/checkoutSlice.ts";
import toast from "react-hot-toast";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import ErrorDialog from "../components/ui/ErrorDialog";
import {computeDiscountedPrice} from "../lib/utils.ts";

const CheckoutPage: React.FC = () => {
    const {tenantId} = useParams<{ tenantId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const {checkoutConfig} = useAppSelector((state) => state.config);
    const {
        formData,
        bookingStatus,
        propertyStatus,
        room,
        promotionApplied,
        propertyDetails,
        bookingId
    } = useAppSelector((state) => state.checkout);
    const {filter} = useAppSelector((state) => state.roomFilters);
    const [activeSection, setActiveSection] = useState<string>("traveler_info");
    const [isValid, setIsValid] = useState<Record<string, boolean>>({
        traveler_info: false,
        billing_info: false,
        payment_info: false,
    });
    const [formErrors, setFormErrors] = useState<Record<string, unknown>>({});
    const sections = checkoutConfig?.configData.sections;

    useEffect(() => {
        if (bookingStatus.status === StateStatus.ERROR) {
            toast.error(
                bookingStatus.error || "Booking failed. Please try again."
            );
        }
    }, [bookingStatus]);

    useEffect(() => {
        if (!tenantId) {
            console.error("Tenant ID is not available");
            return;
        }
        dispatch(fetchConfig({tenantId, configType: ConfigType.CHECKOUT}));
    }, [dispatch, tenantId]);

    useEffect(() => {
        if (!tenantId || !room?.propertyId) return;
        dispatch(
            fetchPropertyDetails({tenantId, propertyId: room.propertyId})
        );
    }, [dispatch, tenantId, room?.propertyId]);

    const getSectionFields = useCallback(
        (sectionId: string): string[] => {
            if (!sections) return [];

            const section = sections.find((s) => s.id === sectionId);
            if (!section) return [];

            const requiredFields = section.fields
                .filter((field) => field.enabled && field.required)
                .map((field) => field.name);

            console.log(
                `Required fields for section ${sectionId}:`,
                requiredFields
            );

            return requiredFields;
        },
        [sections]
    );

    useEffect(() => {
        if (!sections) return;

        const currentSection = activeSection;
        const sectionFields = getSectionFields(currentSection);
        const hasErrors = Object.keys(formErrors).some((key) =>
            sectionFields.includes(key)
        );

        const allFieldsFilled = sectionFields.every((field) => {
            const value = formData[field];
            return value !== undefined && value !== null && value !== "";
        });

        const isCurrentSectionValid = !hasErrors && allFieldsFilled;
        console.log(`Section ${currentSection} validation:`, {
            hasErrors,
            allFieldsFilled,
            isCurrentSectionValid,
            sectionFields,
            fieldValues: sectionFields.map((field) => ({
                field,
                value: formData[field],
            })),
        });

        setIsValid((prev) => ({
            ...prev,
            [currentSection]: isCurrentSectionValid,
        }));
    }, [formData, formErrors, activeSection, sections, getSectionFields]);

    const validateSection = (
        sectionId: string,
        values: Record<string, unknown>,
        errors: Record<string, unknown>
    ): boolean => {
        if (!sections) return false;
        const sectionFields = getSectionFields(sectionId);
        console.log(`Validating section ${sectionId}:`, {
            sectionFields,
            allValues: values,
            allErrors: errors,
            fieldValues: sectionFields.map((field) => ({
                field,
                value: values[field],
                hasError: !!errors[field],
            })),
        });

        // Check if there are any errors for the section's fields
        const hasErrors = Object.keys(errors).some((key) =>
            sectionFields.includes(key)
        );

        const allFieldsFilled = sectionFields.every((field) => {
            const value = values[field];
            if (typeof value === "string") {
                return value.trim() !== "";
            }
            if (typeof value === "boolean") {
                return true;
            }
            return value !== undefined && value !== null;
        });

        const isSectionValid = !hasErrors && allFieldsFilled;
        console.log(`Force validation for section ${sectionId}:`, {
            hasErrors,
            allFieldsFilled,
            isSectionValid,
            sectionFields,
            fieldValues: sectionFields.map((field) => ({
                field,
                value: values[field],
            })),
        });

        return isSectionValid;
    };

    const handleSectionChange = (sectionId: string) => {
        console.log(`Attempting to change to section: ${sectionId}`);
        console.log("Current validation state:", isValid);

        if (sectionId === "billing_info" && !isValid.traveler_info) {
            console.log(
                "Cannot move to billing info - traveler info not valid"
            );
            return;
        }
        if (sectionId === "payment_info" && !isValid.billing_info) {
            console.log("Cannot move to payment info - billing info not valid");
            return;
        }

        console.log(`Changing to section: ${sectionId}`);
        setActiveSection(sectionId);
    };

    const handleAccordionValueChange = (value: string) => {
        console.log(
            "Accordion header clicked, but navigation prevented: " + value
        );
    };

    if (propertyStatus.status === StateStatus.ERROR) {
        console.error("Rendering error state:", propertyStatus.error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <ErrorDialog
                    onClose={() => window.history.back()}
                    title="Error Loading Property"
                    message={
                        propertyStatus.error ||
                        "Failed to load property details. Please try again."
                    }
                />
            </div>
        );
    }

    if (
        !sections ||
        propertyStatus.status === StateStatus.LOADING ||
        bookingStatus.status === StateStatus.LOADING
    )
        return <LoadingOverlay/>;
    if (bookingStatus.status === StateStatus.ERROR) {
        return (
            <ErrorDialog
                onClose={() => dispatch(clearBookingStatus())}
                title="Booking Failed"
                message={
                    bookingStatus.error ||
                    "Failed to process your booking. Please try again."
                }
            />
        );
    }

    // Find the sections by ID
    const travelerInfoSection = sections.find(
        (section) => section.id === "traveler_info"
    );
    const billingInfoSection = sections.find(
        (section) => section.id === "billing_info"
    );
    const paymentInfoSection = sections.find(
        (section) => section.id === "payment_info"
    );

    const getPromotionId = (
        promotion: SpecialDiscount | PromoOffer | StandardPackage | null
    ) => {
        if (!promotion || !("id" in promotion)) {
            return null;
        }
        if ("start_date" in promotion) {
            return "R_" + promotion.id;
        } else {
            return "G_" + promotion.id;
        }
    };

    const handleSubmitBooking = () => {
        if (!tenantId || !room?.roomTypeId || !propertyDetails) {
            console.log("tenant id or room id missing");
            toast.error("Missing required information for booking");
            return;
        }

        const roomAverageRate =
            room.roomRates.reduce((acc, rate) => acc + rate.price, 0) /
            room.roomRates.length;

        let promoAverageRate = roomAverageRate;
        if (promotionApplied) {
            promoAverageRate =
                "discount_percentage" in promotionApplied
                    ? computeDiscountedPrice(promotionApplied, room.roomRates)
                    : roomAverageRate;
        }

        const occupancyTaxRate = 0;
        const resortFeeRate = propertyDetails.surcharge;
        const additionalFeesRate = propertyDetails.fees;

        const totalTaxRate =
            occupancyTaxRate + resortFeeRate + additionalFeesRate;

        // Calculate base amount (before taxes)
        const baseAmount = promoAverageRate * room.roomRates.length;

        // Calculate total taxes and fees
        const totalTaxes = (baseAmount * totalTaxRate) / 100;

        // Calculate total amount (including taxes)
        const totalAmount = baseAmount + totalTaxes;

        const bookingData: Booking = {
            formData,
            propertyId: filter.propertyId,
            dateRange: filter.dateRange,
            roomCount: filter.roomCount,
            guests: filter.guests,
            roomTypeId: room.roomTypeId,
            bedCount: filter.bedCount,
            promotionId: getPromotionId(promotionApplied),
            totalAmount: totalAmount
        };

        const loadingToast = toast.loading("Processing your booking...");
        dispatch(submitBooking({tenantId, bookingData}))
            .unwrap()
            .then(() => {
                toast.success("Booking submitted successfully!");
                if(bookingId !== null) navigate(`/${tenantId}/confirmation/${bookingId}`);
                dispatch(clearFormData());
            })
            .catch(() => {
            })
            .finally(() => {
                toast.dismiss(loadingToast);
            });
    };

    // Create a combined initial values object for all form fields
    const getInitialValues = () => {
        const values: Record<string, string | boolean> = {};
        travelerInfoSection?.fields.forEach((field) => {
            if (field.enabled) {
                values[field.name] = formData[field.name];
            }
        });

        billingInfoSection?.fields.forEach((field) => {
            if (field.enabled) {
                values[field.name] = formData[field.name];
            }
        });

        paymentInfoSection?.fields.forEach((field) => {
            if (field.enabled) {
                values[field.name] = formData[field.name];
            }
        });

        return values;
    };

    const initialValues = getInitialValues();
    return (
        <>
            <div className="min-h-screen p-4 md:p-8 flex flex-col lg:flex-row justify-between gap-4 md:gap-8 lg:px-20">
                {/* Left Column - Form */}
                <div className="w-full lg:w-[736px]">
                    <div className="space-y-4 md:space-y-8">
                        {/* Payment Info Header */}
                        <h1 className="text-xl font-semibold">Payment Info</h1>

                        <Formik
                            initialValues={initialValues}
                            onSubmit={handleSubmitBooking}
                            enableReinitialize
                        >
                            {(formikProps) => {
                                setFormErrors(formikProps.errors);

                                return (
                                    <Accordion
                                        type="single"
                                        collapsible
                                        defaultValue="traveler_info"
                                        value={activeSection}
                                        onValueChange={
                                            handleAccordionValueChange
                                        }
                                        className="w-full [&_[data-slot=accordion-trigger]_svg]:hidden [&_[data-slot=accordion-item]]:border-b-0 [&_[data-slot=accordion-item]]:mb-4"
                                    >
                                        {travelerInfoSection?.enabled && (
                                            <AccordionItem value="traveler_info">
                                                <AccordionTrigger
                                                    className="text-lg font-semibold w-full lg:w-[736px] h-[43px] bg-gray-200 hover:no-underline focus:no-underline flex items-center pl-2">
                                                    1. Traveler Information
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <TravelerInfo
                                                        fields={
                                                            travelerInfoSection.fields
                                                        }
                                                        onNext={() => {
                                                            console.log(
                                                                "TravelerInfo onNext clicked, current validation state:",
                                                                isValid.traveler_info
                                                            );
                                                            console.log(
                                                                "Current form values:",
                                                                formikProps.values
                                                            );
                                                            console.log(
                                                                "Current form errors:",
                                                                formikProps.errors
                                                            );

                                                            // Force validate traveler info section
                                                            const isTravelerInfoValid =
                                                                validateSection(
                                                                    "traveler_info",
                                                                    formikProps.values,
                                                                    formikProps.errors
                                                                );
                                                            console.log(
                                                                "Force validation result for traveler info:",
                                                                isTravelerInfoValid
                                                            );

                                                            if (
                                                                isTravelerInfoValid
                                                            ) {
                                                                // Update validation state
                                                                setIsValid(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        traveler_info:
                                                                            true,
                                                                    })
                                                                );

                                                                // Change to billing info section
                                                                setActiveSection(
                                                                    "billing_info"
                                                                );
                                                            } else {
                                                                console.log(
                                                                    "Traveler info validation failed, cannot proceed"
                                                                );
                                                                // Log the specific fields that are causing validation to fail
                                                                const sectionFields =
                                                                    getSectionFields(
                                                                        "traveler_info"
                                                                    );
                                                                const missingFields =
                                                                    sectionFields.filter(
                                                                        (
                                                                            field
                                                                        ) => {
                                                                            const value =
                                                                                formikProps
                                                                                    .values[
                                                                                    field
                                                                                    ];
                                                                            return (
                                                                                value ===
                                                                                undefined ||
                                                                                value ===
                                                                                null ||
                                                                                (typeof value ===
                                                                                    "string" &&
                                                                                    value.trim() ===
                                                                                    "")
                                                                            );
                                                                        }
                                                                    );
                                                                console.log(
                                                                    "Missing or invalid fields:",
                                                                    missingFields
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        )}

                                        {billingInfoSection?.enabled && (
                                            <AccordionItem value="billing_info">
                                                <AccordionTrigger
                                                    className={`text-lg font-semibold w-full lg:w-[736px] h-[43px] bg-gray-200 hover:no-underline flex items-center pl-2 focus:no-underline ${
                                                        !isValid.traveler_info
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                    disabled={
                                                        !isValid.traveler_info
                                                    }
                                                >
                                                    2. Billing Information
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <BillingInfo
                                                        onNext={() => {
                                                            console.log(
                                                                "BillingInfo onNext clicked, current validation state:",
                                                                isValid.billing_info
                                                            );

                                                            // Force validate billing info section
                                                            const isBillingInfoValid =
                                                                validateSection(
                                                                    "billing_info",
                                                                    formikProps.values,
                                                                    formikProps.errors
                                                                );
                                                            console.log(
                                                                "Force validation result for billing info:",
                                                                isBillingInfoValid
                                                            );

                                                            if (
                                                                isBillingInfoValid
                                                            ) {
                                                                // Update validation state
                                                                setIsValid(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        billing_info:
                                                                            true,
                                                                    })
                                                                );

                                                                // Change to payment info section
                                                                setActiveSection(
                                                                    "payment_info"
                                                                );
                                                            } else {
                                                                console.log(
                                                                    "Billing info validation failed, cannot proceed"
                                                                );
                                                            }
                                                        }}
                                                        setActiveSection={(
                                                            section
                                                        ) =>
                                                            handleSectionChange(
                                                                section === 1
                                                                    ? "traveler_info"
                                                                    : "billing_info"
                                                            )
                                                        }
                                                        fields={
                                                            billingInfoSection.fields
                                                        }
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        )}

                                        {paymentInfoSection?.enabled && (
                                            <AccordionItem value="payment_info">
                                                <AccordionTrigger
                                                    className={`text-lg font-semibold flex items-center pl-2 w-full lg:w-[736px] h-[43px] bg-gray-200 hover:no-underline focus:no-underline ${
                                                        !isValid.billing_info
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                    disabled={
                                                        !isValid.billing_info
                                                    }
                                                >
                                                    3. Payment Information
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <PaymentInfo
                                                        setActiveSection={(
                                                            section
                                                        ) =>
                                                            handleSectionChange(
                                                                section === 1
                                                                    ? "traveler_info"
                                                                    : section ===
                                                                    2
                                                                        ? "billing_info"
                                                                        : "payment_info"
                                                            )
                                                        }
                                                        fields={
                                                            paymentInfoSection.fields
                                                        }
                                                        onSubmit={
                                                            handleSubmitBooking
                                                        }
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
                    <TripItinerary/>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;
