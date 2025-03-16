import React from 'react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  return (
    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full flex flex-col">
      <div className="p-6 relative z-10 flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Room {room.roomNumber}
        </h2>

        <div className="text-gray-700 space-y-2 text-lg">
          <p>
            <span className="font-medium text-gray-900">Type:</span>{' '}
            {room.roomType.roomTypeName}
          </p>

          <p>
            <span className="font-medium text-gray-900">Area:</span>{' '}
            <span>{room.roomType.areaInSquareFeet} sq ft</span>
          </p>

          <p>
            <span className="font-medium text-gray-900">Capacity:</span>{' '}
            <span>{room.roomType.maxCapacity} persons</span>
          </p>

          <div className="pt-2">
            <span className="font-medium text-gray-900">Bed Configuration:</span>
            <div className="ml-1 mt-1">
              {room.roomType.singleBed > 0 && (
                <p className="text-gray-700">
                  • {room.roomType.singleBed} Single Bed{room.roomType.singleBed > 1 ? 's' : ''}
                </p>
              )}
              {room.roomType.doubleBed > 0 && (
                <p className="text-gray-700">
                  • {room.roomType.doubleBed} Double Bed{room.roomType.doubleBed > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        <button className="w-full bg-[#26266D] text-white py-3 rounded-lg font-semibold hover:bg-[#1f1f58] transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default RoomCard;