import React from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { LuUserRound } from "react-icons/lu";
import { Separator } from "./../components/ui/Separator";
import OTPModal from './../components/ui/OTPModal';

const ConfirmationPage = () => {
    const bookingData = {
        "roomName": "Room 1: Executive Room",
        "guests": "2 adults, 1 child",
        "checkInDate": {
          "day": 9,
          "month": "May",
          "year": 2022
        },
        "checkOutDate": {
          "day": 16,
          "month": "May",
          "year": 2022
        },
        "diningCredit": 150,
        "diningCreditDescription": "Spend $10 every night you stay and earn $150 om doining credit at the resort.",
        "cancellationPolicy": "Copy explaining the cancellation policy, if applicable",
        "totalPerNight": "$XXX/night total",
        "roomImage": "https://plus.unsplash.com/premium_photo-1661962493427-910e3333cf5a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmVhdXRpZnVsJTIwcm9vbXxlbnwwfHwwfHx8MA%3D%3D",
        "nightlyRate": "$XXX.xx",
        "subtotal": "$XXX.xx",
        "taxes": "$XXX.xx",
        "totalStay": "$XXX.xx"
    }

    const {
        roomName,
        guests,
        checkInDate,
        checkOutDate,
        diningCredit,
        diningCreditDescription,
        cancellationPolicy,
        totalPerNight,
        roomImage,
        nightlyRate,
        subtotal,
        taxes,
        totalStay
    } = bookingData;

    const [isRoomSummaryOpen, setIsRoomSummaryOpen] = React.useState(true);
    const [isGuestInfoOpen, setIsGuestInfoOpen] = React.useState(false);
    const [isBillingAddressOpen, setIsBillingAddressOpen] = React.useState(false);
    const [isPaymentInfoOpen, setIsPaymentInfoOpen] = React.useState(false);
    const [isOTPModalOpen, setIsOTPModalOpen] = React.useState(false);

    return (
        <div className="mt-4 md:mt-6 lg:mt-8 mb-4 px-4 md:px-6 lg:px-0">
            {/* Header: Print and Email buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 w-full max-w-[69.625rem] mx-auto">
                <h1 className="text-[#2F2F2F] font-lato font-bold text-lg md:text-xl mb-2 sm:mb-0">
                    Upcoming reservation #XXXXXXXXX
                </h1>
                <div className="flex gap-4">
                    <button onClick={() => print()} className="text-[#006EFF] font-lato text-sm md:text-base">
                        Print
                    </button>
                    <button className="text-[#006EFF] font-lato text-sm md:text-base">
                        Email
                    </button>
                </div>
            </div>

            {/* Printable Content */}
            <div className="w-full max-w-[69.625rem] mx-auto shadow-md border border-[#C1C2C2] rounded-lg bg-white">
                <div className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="flex flex-col sm:flex-row items-start mb-2 sm:mb-0">
                            <h1 className="font-lato font-bold text-xl md:text-2xl leading-[140%]">
                                {roomName}
                            </h1>
                            <div className="flex items-center text-[#5D5D5D] mt-1 sm:ml-3 sm:mt-2">
                                <LuUserRound className="w-4 h-4 mr-1" />
                                <span className="font-lato text-sm leading-[140%]">
                                    {guests}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOTPModalOpen(true)}
                            className="cursor-pointer text-[#006EFF] font-lato font-normal text-sm md:text-base leading-[100%] mt-2 sm:mt-0"
                        >
                            Cancel Room
                        </button>
                    </div>

                    <OTPModal 
                        isOpen={isOTPModalOpen}
                        onClose={() => setIsOTPModalOpen(false)}
                    />

                    <div className="mt-4 md:mt-6 flex flex-col md:flex-row">
                        <div className="w-full md:w-[20.5rem] h-[12rem] md:h-[14rem] overflow-hidden rounded-sm md:mr-6 border border-gray-200 mb-4 md:mb-0">
                            <img
                                src={roomImage}
                                alt={roomName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                }}
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap gap-3 md:gap-6 mb-4">
                                <div className="rounded-[5px] border-[1px] border-[#858685] p-3 md:p-4 w-[calc(50%-0.375rem)] sm:w-auto sm:min-w-[6.5625rem] text-center">
                                    <div className="text-[#858685] font-lato font-normal text-xs md:text-sm leading-[140%]">
                                        Check in
                                    </div>
                                    <div className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                                        {checkInDate.day}
                                    </div>
                                    <div className="text-[#2F2F2F] font-lato font-normal text-sm md:text-base leading-[140%]">
                                        {checkInDate.month} {checkInDate.year}
                                    </div>
                                </div>
                                <div className="rounded-[5px] border-[1px] border-[#858685] p-3 md:p-4 w-[calc(50%-0.375rem)] sm:w-auto sm:min-w-[6.5625rem] text-center">
                                    <div className="text-[#858685] font-lato font-normal text-xs md:text-sm leading-[140%]">
                                        Check Out
                                    </div>
                                    <div className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                                        {checkOutDate.day}
                                    </div>
                                    <div className="text-[#2F2F2F] font-lato font-normal text-sm md:text-base leading-[140%]">
                                        {checkOutDate.month} {checkOutDate.year}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-2 md:mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="w-full sm:w-auto mb-3 sm:mb-0">
                                    <h3 className="text-[#2F2F2F] font-lato font-bold text-lg md:text-xl leading-[130%]">
                                        ${diningCredit} Dining Credit Package
                                    </h3>
                                    <p className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%] mt-1">
                                        {diningCreditDescription}
                                    </p>

                                    <p className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%] mt-3 md:mt-5">
                                        {cancellationPolicy}
                                    </p>
                                </div>
                                <p className="text-[#000000] font-lato font-normal text-lg md:text-xl leading-[140%]">
                                    {totalPerNight}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Separator className="w-[95%] h-[0.0625rem] bg-[#C1C2C2]" />
                </div>

                {/* Room Summary Section */}
                <div className="px-4 md:px-6">
                    <button
                        className="w-full py-3 md:py-4 flex items-center"
                        onClick={() => setIsRoomSummaryOpen(!isRoomSummaryOpen)}
                    >
                        {isRoomSummaryOpen ? (
                            <HiChevronUp size={20} className="w-5 h-5 mr-2" />
                        ) : (
                            <HiChevronDown size={20} className="w-5 h-5 mr-2" />
                        )}
                        <span className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                            Room total summary
                        </span>
                    </button>

                    {isRoomSummaryOpen && (
                        <div className="ml-7 md:ml-8">
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Nightly rate
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {nightlyRate}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Subtotal
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {subtotal}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Taxes, Surcharges, Fees
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {taxes}
                                </span>
                            </div>

                            <div className="flex justify-between py-2 md:py-3">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Total for stay
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    {totalStay}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Separator className="w-[95%] h-[0.0625rem] bg-[#C1C2C2]" />
                </div>

                {/* Guest Information Section */}
                <div className="px-4 md:px-6">
                    <button
                        className="w-full py-3 md:py-4 flex items-center"
                        onClick={() => setIsGuestInfoOpen(!isGuestInfoOpen)}
                    >
                        {isGuestInfoOpen ? (
                            <HiChevronUp size={20} className="w-5 h-5 mr-2" />
                        ) : (
                            <HiChevronDown size={20} className="w-5 h-5 mr-2" />
                        )}
                        <span className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                            Guest Information
                        </span>
                    </button>
                    {isGuestInfoOpen && (
                        <div className="ml-7 md:ml-8">
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    First Name
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    Jay
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Last Name
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    Malaviya
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Phone
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                   8780622867
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Email
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%] break-all">
                                    jay.malaviya@example.com
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Separator className="w-[95%] h-[0.0625rem] bg-[#C1C2C2]" />
                </div>

                {/* Billing Address Section */}
                <div className="px-4 md:px-6">
                    <button
                        className="w-full py-3 md:py-4 flex items-center"
                        onClick={() => setIsBillingAddressOpen(!isBillingAddressOpen)}
                    >
                        {isBillingAddressOpen ? (
                            <HiChevronUp size={20} className="w-5 h-5 mr-2" />
                        ) : (
                            <HiChevronDown size={20} className="w-5 h-5 mr-2" />
                        )}
                        <span className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                            Billing Address
                        </span>
                    </button>
                    {isBillingAddressOpen && (
                        <div className="ml-7 md:ml-8">
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    First Name
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    Jay
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Last Name
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    Malaviya
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Mailing Address 1
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    123 Main St
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Mailing Address 2
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    Apt 4B
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Country
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    United States
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    City
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    New York
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    State
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    Bangalore
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    ZIP
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    10001
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Phone
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    +6392857722
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Email
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%] break-all">
                                    jay.malaviya@example.com
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Separator className="w-[95%] h-[0.0625rem] bg-[#C1C2C2]" />
                </div>

                {/* Payment Information Section */}
                <div className="px-4 md:px-6">
                    <button
                        className="w-full py-3 md:py-4 flex items-center"
                        onClick={() => setIsPaymentInfoOpen(!isPaymentInfoOpen)}
                    >
                        {isPaymentInfoOpen ? (
                            <HiChevronUp size={20} className="w-5 h-5 mr-2" />
                        ) : (
                            <HiChevronDown size={20} className="w-5 h-5 mr-2" />
                        )}
                        <span className="text-[#2F2F2F] font-lato font-bold text-sm md:text-base leading-[150%]">
                            Payment Information
                        </span>
                    </button>
                    {isPaymentInfoOpen && (
                        <div className="ml-7 md:ml-8 mb-2">
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Card Number
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    XXXX XXXX XXXX 1234
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#5D5D5D] font-lato font-normal text-sm md:text-base leading-[140%]">
                                    Expiration
                                </span>
                                <span className="text-[#2F2F2F] font-lato font-normal text-base md:text-xl leading-[140%]">
                                    MM/YY
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;