import React from 'react';
import { Button } from './ui';

import { CiCircleInfo } from "react-icons/ci";
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
}

const TripItinerary: React.FC<TripItineraryProps> = ({ 
  // currency = 'USD', // Commented out to fix linter error
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
    subtotal: 0,
    taxes: 0,
    vat: 0,
    dueNow: 0,
    dueAtResort: 0
  },
  onRemove 
}) => {
  // Format date to "May 9" format
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate number of nights - commented out to fix linter error
  // const nights = Math.floor((bookingDetails.checkOutDate.getTime() - bookingDetails.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-[#F5F5F5] p-6 w-[330px] h-[494px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#333]">Your Trip Itinerary</h2>
        <Button variant="link" className="text-blue-500 p-0 h-auto" onClick={onRemove}>Remove</Button>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-1">{bookingDetails.resortName}</h3>
        <p className="text-sm text-gray-600 mb-1">
          {formatDate(bookingDetails.checkInDate)} - {formatDate(bookingDetails.checkOutDate)} | {bookingDetails.guests.adults} adult {bookingDetails.guests.children} child
        </p>
        <p className="text-sm mb-1">{roomDetails.name}</p>
        <p className="text-sm mb-1">${roomDetails.rate}/night</p>
        <p className="text-sm mb-1">{roomDetails.count} room</p>
        
        {roomDetails.promoName && (
          <div className="flex items-center text-sm mb-4">
            <span>Special Promoname, ${roomDetails.promoRate}/night</span>
            <CiCircleInfo className="w-4 h-4 ml-1 text-gray-500" />
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-300 pt-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm">Subtotal</span>
          <span className="text-sm font-medium">${'XXX.xx'}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <div className="flex items-center">
            <span className="text-sm">Taxes, Surcharges, Fees</span>
            <CiCircleInfo className="w-4 h-4 ml-1 text-gray-500" />
          </div>
          <span className="text-sm font-medium">${'XXX.xx'}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-sm">VAT</span>
          <span className="text-sm font-medium">${'XXX.xx'}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-300 pt-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Due Now</span>
          <span className="text-sm font-medium">${'XXX.xx'}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Due at Resort</span>
          <span className="text-sm font-medium">${'XXX.xx'}</span>
        </div>
      </div>
      
      <Button className="w-full border-[4px] border-primary text-primary bg-gray hover:bg-blue-50">
        CONTINUE SHOPPING
      </Button>
    </div>
  );
};

export default TripItinerary; 