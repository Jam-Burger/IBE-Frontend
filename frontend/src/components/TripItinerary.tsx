import React, { useState } from 'react';
import { Button } from './ui';
import { CiCircleInfo } from "react-icons/ci";
import PromoModal from './ui/PromoModal';
import RateBreakdownModal from './ui/RateBreakdownModal';

interface RoomDetails {
  name: string;
  rate: number;
  count: number;
  promoName?: string;
  promoRate?: number;
}

interface BookingDetails {
  resortName: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: {
    adults: number;
    children: number;
  };
  subtotal: number;
  taxes: number;
  vat: number;
  dueNow: number;
  dueAtResort: number;
}

interface TripItineraryProps {
  currency?: string;
  roomDetails?: RoomDetails;
  bookingDetails?: BookingDetails;
  onRemove?: () => void;
  onContinueShopping?: () => void;
}

const TripItinerary: React.FC<TripItineraryProps> = ({ 
  currency = 'USD',
  roomDetails = {
    name: 'Executive Rooms',
    rate: 132,
    count: 1,
    promoName: 'Special Promoname',
    promoRate: 132
  }, 
  bookingDetails = {
    resortName: 'Long Beautiful Resort Name',
    checkInDate: new Date('2022-05-09'),
    checkOutDate: new Date('2022-05-16'),
    guests: {
      adults: 1,
      children: 1
    },
    subtotal: 924,
    taxes: 92.40,
    vat: 46.20,
    dueNow: 1062.60,
    dueAtResort: 0
  },
  onRemove,
  onContinueShopping
}) => {
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isRateBreakdownOpen, setIsRateBreakdownOpen] = useState(false);
  
  // Format date to "May 9" format
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate number of nights
  const nights = Math.floor((bookingDetails.checkOutDate.getTime() - bookingDetails.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2);
  };

  return (
    <div className="bg-[#F5F5F5] p-6 w-[400px] h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#333]">Your Trip Itinerary</h2>
        <Button variant="link" className="text-blue-500 p-0 h-auto" onClick={onRemove}>Remove</Button>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-1">{bookingDetails.resortName}</h3>
        <p className="text-sm text-gray-600 mb-1">
          {formatDate(bookingDetails.checkInDate)} - {formatDate(bookingDetails.checkOutDate)} | {bookingDetails.guests.adults} adult{bookingDetails.guests.adults !== 1 ? 's' : ''} {bookingDetails.guests.children > 0 ? `${bookingDetails.guests.children} child${bookingDetails.guests.children !== 1 ? 'ren' : ''}` : ''}
        </p>
        <p className="text-sm text-gray-600 mb-1">{roomDetails.name}</p>
        <p className="text-sm text-gray-600 mb-1">${formatCurrency(roomDetails.rate)}/night × {nights} nights</p>
        <p className="text-sm text-gray-600 mb-1">{roomDetails.count} room{roomDetails.count !== 1 ? 's' : ''}</p>
        
        {roomDetails.promoName && roomDetails.promoRate && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <span>{roomDetails.promoName}, ${formatCurrency(roomDetails.promoRate)}/night</span>
            <button 
              onClick={() => setIsPromoModalOpen(true)}
              className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <CiCircleInfo className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-300 pt-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-sm font-medium">${formatCurrency(bookingDetails.subtotal)}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <div className="flex items-center">
            <span className="text-sm text-gray-600">Taxes, Surcharges, Fees</span>
            <button
              onClick={() => setIsRateBreakdownOpen(true)}
              className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <CiCircleInfo className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-medium">${formatCurrency(bookingDetails.taxes)}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-300 pt-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600 font-medium">Due Now</span>
          <span className="text-sm font-medium">${formatCurrency(bookingDetails.dueNow)}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600 font-medium">Due at Resort</span>
          <span className="text-sm font-medium">${formatCurrency(bookingDetails.dueAtResort)}</span>
        </div>
      </div>
      
      <div className="flex justify-center mt-6">
        <Button 
          className="w-[193px] h-[44px] border-[3px] border-primary text-primary bg-gray hover:bg-blue-50"
          onClick={onContinueShopping}
        >
          CONTINUE SHOPPING
        </Button>
      </div>
      
      <PromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
      />

      <RateBreakdownModal
        isOpen={isRateBreakdownOpen}
        onClose={() => setIsRateBreakdownOpen(false)}
      />
    </div>
  );
};

export default TripItinerary; 