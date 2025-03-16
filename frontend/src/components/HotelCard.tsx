import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Hotel } from '../types';

interface HotelCardProps {
  hotel: Hotel;
  convertPrice: (amount: number) => string;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, convertPrice }) => {
  const { t } = useTranslation("hotel");
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/property/${hotel.id}/rooms`);
  };

  return (
    <div
      onClick={handleClick}
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
    >
      <div className="p-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {t('hotelName', { name: hotel.name })}
        </h2>

        <div className="text-gray-700 space-y-2 text-lg">
          <p>
            <span className="font-medium text-gray-900">{t('address')}:</span> {hotel.address}
          </p>
          <p>
            <span className="font-medium text-gray-900">{t('description')}:</span> {hotel.description}
          </p>
          <p>
            <span className="font-medium text-gray-900">{t('starRating')}:</span>
            <span className="text-yellow-500 font-semibold"> {hotel.starRating} ⭐</span>
          </p>
          <p>
            <span className="font-medium text-gray-900">{t('pricePerNight')}:</span>
            <span className="text-green-600 font-semibold"> {convertPrice(hotel.pricePerNight)}</span>
          </p>
          <p>
            <span className="font-medium text-gray-900">{t('createdAt')}:</span>
            <span className="text-gray-600">{new Date(hotel.createdAt).toLocaleDateString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HotelCard; 