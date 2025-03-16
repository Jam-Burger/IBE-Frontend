import { useQuery, gql } from '@apollo/client';
import { Room } from '../types';
import { ClipLoader } from 'react-spinners';
import RoomCard from './RoomCard';

const GET_ROOMS_BY_PROPERTY = gql`
  query getRoomsByProperty($propertyId: Int!) {
    listRooms(where: { property_id: { equals: $propertyId } }) {
      room_number
      room_type {
        area_in_square_feet
        double_bed
        max_capacity
        room_type_name
        single_bed
      }
    }
  }
`;

interface RoomListProps {
  propertyId: number;
}

const mapToRoom = (apiRoom: any): Room => ({
  roomNumber: apiRoom.room_number,
  roomType: {
    areaInSquareFeet: apiRoom.room_type.area_in_square_feet,
    doubleBed: apiRoom.room_type.double_bed,
    maxCapacity: apiRoom.room_type.max_capacity,
    roomTypeName: apiRoom.room_type.room_type_name,
    singleBed: apiRoom.room_type.single_bed,
  },
});

export const RoomList = ({ propertyId }: RoomListProps) => {
  const { loading, error, data } = useQuery(GET_ROOMS_BY_PROPERTY, {
    variables: { propertyId },
  });

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <ClipLoader
        color="#3B82F6"
        loading={loading}
        size={50}
        aria-label="Loading Rooms"
      />
    </div>
  );
  
  if (error) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-lg text-red-600 bg-red-50 px-4 py-3 rounded-lg">
        Error: {error.message}
      </div>
    </div>
  );

  const rooms: Room[] = data.listRooms.map(mapToRoom);

  if (rooms.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
          No rooms available for this property
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {rooms.map((room) => (
        <RoomCard key={room.roomNumber} room={room} />
      ))}
    </div>
  );
}; 