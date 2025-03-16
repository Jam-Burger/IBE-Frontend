import { RoomList } from '../components';
import { useParams, Link } from 'react-router-dom';

const RoomsPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();

  if (!propertyId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-lg text-red-600 bg-red-50 px-6 py-4 rounded-lg shadow-sm">
          Property ID is required
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Rooms</h1>
            <p className="text-gray-600 mt-2">Select a room to proceed with your booking</p>
          </div>
          <Link 
            to="/#" 
            className="bg-[#26266D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1f1f58] transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            My Bookings
          </Link>
        </div>
        <RoomList propertyId={parseInt(propertyId, 10)} />
      </div>
    </div>
  );
};

export default RoomsPage;