import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import { Header, Footer, ErrorComponent, HotelCard } from '../components';
import axios from 'axios';
import {Hotel} from '../types';
import { ClipLoader } from 'react-spinners';

const API_URL = import.meta.env.VITE_API_URL;

const HomePage: React.FC = () => {
    const {t} = useTranslation("hotel");
    const {rates, selectedCurrency} = useSelector((state: RootState) => state.currency);
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

    const fetchHotels = useCallback(async () => {
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
            setError("Failed to fetch hotels");
        } finally {
            setLoading(false);
        }
    }, [language]);

    useEffect(() => {
        fetchHotels();
    }, [fetchHotels]);

    const handleError = () => {
        throw new Error('This is a test error for Sentry');
    };

    if (error) {
        return <ErrorComponent/>;
    }

    return (
        <div className="min-h-screen flex flex-col overflow-hidden">
            <Header/>
            <main className="flex-grow container mx-auto p-4 w-full">
                <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full flex justify-center items-center h-40">
                            <ClipLoader
                                color="#3B82F6"
                                loading={loading}
                                size={50}
                                aria-label="Loading Hotels"
                            />
                        </div>
                    ) : (
                        hotels?.map((hotel) => (
                            <HotelCard
                                key={hotel.id}
                                hotel={hotel}
                                convertPrice={convertPrice}
                            />
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
            <Footer/>
        </div>
    );
};

export default HomePage;
