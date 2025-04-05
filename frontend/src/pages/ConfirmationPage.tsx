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

  

    // const printRef = useRef<HTMLDivElement>(null);


    return (
        <div className="mt-25 mb-4">
            {/* Header: Print and Email buttons (not part of the printable content) */}
            <div className="flex justify-between items-center mb-4 w-[69.625rem] center mx-auto">
                <h1 className="text-[#2F2F2F] font-lato font-bold text-xl">
                    Upcoming reservation #XXXXXXXXX
                </h1>
                <div className="flex gap-4">
                    <button onClick={() => print()} className="text-[#006EFF] font-lato">
                        Print
                    </button>
                    <button className="text-[#006EFF] font-lato">
                        Email
                    </button>
                </div>
            </div>

            {/* Printable Content */}
            <div >
                <div className="w-[69.625rem] max-h-fit shadow-md mx-auto border border-[#C1C2C2] rounded-lg bg-white">
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start">
                                <h1 className="font-lato font-bold text-2xl leading-[140%] tracking-normal align-middle">
                                    {roomName}
                                </h1>
                                <div className="flex items-center text-[#5D5D5D] ml-3 mt-2">
                                    <LuUserRound className="w-4 h-4 mr-1" />
                                    <span className="font-lato text-sm leading-[140%]">
                                        {guests}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOTPModalOpen(true)}
                                className="cursor-pointer text-[#006EFF] w-[5.9375rem] h-[1.5625rem] font-lato font-normal text-base leading-[100%] tracking-normal align-middle"
                            >
                                Cancel Room
                            </button>
                        </div>

                        <OTPModal 
                            isOpen={isOTPModalOpen}
                            onClose={() => setIsOTPModalOpen(false)}
                        />

                        <div className="mt-6 flex">
                            <div className="w-[20.5rem] h-[14rem] overflow-hidden rounded-sm mr-6 border border-gray-200">
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
                                <div className="flex gap-6 mb-4">
                                    <div className="rounded-[5px] border-[1px] border-[#858685] p-4 w-[6.5625rem] h-[6.625rem] text-center">
                                        <div className="text-[#858685] font-lato font-normal text-sm leading-[140%] tracking-normal align-middle">
                                            Check in
                                        </div>
                                        <div className="text-[#2F2F2F] font-lato font-bold text-base leading-[150%] tracking-normal align-middle">
                                            {checkInDate.day}
                                        </div>
                                        <div className="text-[#2F2F2F] font-lato font-normal text-base leading-[140%] tracking-normal align-middle">
                                            {checkInDate.month} {checkInDate.year}
                                        </div>
                                    </div>
                                    <div className="rounded-[5px] border-[1px] border-[#858685] p-4 w-[6.5625rem] h-[6.625rem] text-center">
                                        <div className="text-[#858685] font-lato font-normal text-sm leading-[140%] tracking-normal align-middle">
                                            Check Out
                                        </div>
                                        <div className="text-[#2F2F2F] font-lato font-bold text-base leading-[150%] tracking-normal align-middle">
                                            {checkOutDate.day}
                                        </div>
                                        <div className="text-[#2F2F2F] font-lato font-normal text-base leading-[140%] tracking-normal align-middle">
                                            {checkOutDate.month} {checkOutDate.year}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="mt-2 w-[27.5625rem] h-[8.25rem]">
                                        <h3 className="text-[#2F2F2F] w-[19.5625rem] h-[2.3125rem] font-lato font-bold text-xl leading-[130%] tracking-normal align-middle">
                                            ${diningCredit} Dining Credit Package
                                        </h3>
                                        <p className="text-[#5D5D5D] font-lato font-normal text-base leading-[140%] tracking-normal align-middle">
                                            {diningCreditDescription}
                                        </p>

                                        <p className="text-[#5D5D5D] font-lato font-normal text-base leading-[140%] tracking-normal align-middle mt-5 ">
                                            {cancellationPolicy}
                                        </p>
                                    </div>
                                    <p className="text-[#000000] font-lato font-normal text-xl leading-[140%] tracking-normal align-middle mt-25">
                                        {totalPerNight}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Separator className="w-[66.8125rem] h-[0.0625rem] bg-[#C1C2C2]" />
                    </div>

                    <div className="px-6">
                        <button
                            className="w-full py-4 flex fex-start items-center"
                            onClick={() => setIsRoomSummaryOpen(!isRoomSummaryOpen)}
                        >
                            {isRoomSummaryOpen ? (
                                <HiChevronUp size={20} className="w-[1.5rem] h-[1.5rem] mr-2 mb-1" />
                            ) : (
                                <HiChevronDown size={24} className="w-[1.5rem] h-[1.5rem] mr-2 mb-1" />
                            )}
                            <span className=" text-[#2F2F2F] w-[15.9375rem] h-[2rem] flex flex-left font-lato font-bold text-base leading-[150%] tracking-normal">
                                Room total summary
                            </span>
                        </button>

                        {isRoomSummaryOpen && (
                            <div className="ml-8.5">
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Nightly rate
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        {nightlyRate}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Subtotal
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        {subtotal}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Taxes, Surcharges, Fees
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        {taxes}
                                    </span>
                                </div>

                                <div className="flex justify-between py-3">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Total for stay
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        {totalStay}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <Separator className="w-[66.8125rem] h-[0.0625rem] bg-[#C1C2C2]" />
                    </div>

                    <div className="px-6">
                        <button
                            className="w-full py-4 flex flex-start items-center"
                            onClick={() => setIsGuestInfoOpen(!isGuestInfoOpen)}
                        >
                            {isGuestInfoOpen ? (
                                <HiChevronUp size={20} className="w-[1.5rem] h-[1.5rem] mr-2 mb-1" />
                            ) : (
                                <HiChevronDown size={20} className="w-[1.5rem] h-[1.5rem] mr-2 mb-1" />
                            )}
                            <span className=" text-[#2F2F2F] w-[15.9375rem] h-[2rem] flex flex-left font-lato font-bold text-base leading-[150%] tracking-normal">
                                Guest Information
                            </span>
                        </button>
                        {isGuestInfoOpen && (
                            <div className="ml-8.5">
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        First Name
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        Jay
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Last Name
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        Malaviya
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Phone
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                       8780622867
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Email
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        jay.malaviya@example.com
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <Separator className="w-[66.8125rem] h-[0.0625rem] bg-[#C1C2C2]" />
                    </div>

                    <div className="px-6">
                        <button
                            className="w-full py-4 flex items-center"
                            onClick={() => setIsBillingAddressOpen(!isBillingAddressOpen)}
                        >
                            {isBillingAddressOpen ? (
                                <HiChevronUp size={20} className="w-[1.5rem] h-[1.5rem] mr-2 mb-1" />
                            ) : (
                                <HiChevronDown size={20} className="w-[1.5rem] h-[1.5rem] mr-2 mb-1" />
                            )}
                            <span className=" text-[#2F2F2F] w-[15.9375rem] h-[2rem] flex flex-left font-lato font-bold text-base leading-[150%] tracking-normal">
                                Billing Address
                            </span>
                        </button>
                        {isBillingAddressOpen && (
                            <div className="ml-8.5">
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        First Name
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        Jay
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Last Name
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        Malaviya
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Mailing Address 1
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        123 Main St
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Mailing Address 2
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        Apt 4B
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Country
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        United States
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        City
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        New York
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        State
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        Bangalore
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        ZIP
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        10001
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Phone
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        +6392857722
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Email
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        jay.malaviya@example.com
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <Separator className="w-[66.8125rem] h-[0.0625rem] bg-[#C1C2C2]" />
                    </div>

                    <div className="px-6">
                        <button
                            className="w-full py-4 flex items-center"
                            onClick={() => setIsPaymentInfoOpen(!isPaymentInfoOpen)}
                        >
                            {isPaymentInfoOpen ? (
                                <HiChevronUp size={20} className="w-[1.5rem] h-[1.5rem] mr-2 mb-1" />
                            ) : (
                                <HiChevronDown size={20} className="w-[1.5rem] h-[1.5rem] mr-2 mb-1" />
                            )}
                            <span className=" text-[#2F2F2F] w-[15.9375rem] h-[2rem] flex flex-left font-lato font-bold text-base leading-[150%] tracking-normal">
                                Payment Information
                            </span>
                        </button>
                        {isPaymentInfoOpen && (
                            <div className="ml-8.5">
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Card Number
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        XXXX XXXX XXXX 1234
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#5D5D5D] h-[1.4375rem] w-[17.3125rem] font-lato font-normal text-base leading-[140%] tracking-normal">
                                        Expiration
                                    </span>
                                    <span className="text-[#2F2F2F] font-lato font-normal text-xl leading-[140%] tracking-normal">
                                        MM/YY
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;