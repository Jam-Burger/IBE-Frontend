import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

import Header from '../components/Header';
import Footer from '../components/Footer';

import axios from 'axios';
import ErrorComponent from '../components/ErrorComponent';

import { Hotel } from '../types/Hotel'


const HomePage: React.FC = () => {
  const { t } = useTranslation("hotel");

  const { rates, selectedCurrency } = useSelector((state: RootState) => state.currency);
  const language = useSelector((state: RootState) => state.language.language);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [hotels, setHotels] = useState<Hotel[]>([]);

  const convertPrice = (amount: number): string => {
    if (selectedCurrency === "USD") {
      return `$${amount.toFixed(2)}`;
    }
    const rate = rates[selectedCurrency] || 1;
    return `€${(amount * rate).toFixed(2)}`;
  };

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{ data: Hotel[] }>(`${API_URL}/hotels`, {
          headers: {
            "Accept-Language": language,
          },
        });
      
  
       setHotels(response.data.data);
      
      } catch (err) {
        console.error(err);
        setError("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };
    

    fetchStudents();
  }, [language]);

  const handleError = () => {
    throw new Error('This is a test error for Sentry');
  };

  if (error) {
    return <ErrorComponent />;
  }
 

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-grow container mx-auto p-4 w-full">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center items-center h-40">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            hotels?.map((hotel, index) => (
              <div
                key={hotel.id ?? index}
                className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
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
            ))
            
          )}
        </div>
        <div className="mt-6">
          <button 
            onClick={handleError} 
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
          >
            Test Sentry
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
