import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

import Header from '../components/Header';
import Footer from '../components/Footer';

import axios from 'axios';

interface Student {
    name: string;
    age: number;
    email: string;
}

const HomePage: React.FC = () => {
    const {t} = useTranslation("student");

    const {rates, selectedCurrency} = useSelector((state: RootState) => state.currency);
    const language = useSelector((state: RootState) => state.language.language);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getCurrencyDisplay = (): string => {
        if (selectedCurrency === "USD") {
            return "1 USD = 1 USD";
        }
        return `1 USD = ${rates[selectedCurrency] || 'N/A'} ${selectedCurrency}`;
    };

    const [students, setStudents] = useState<Student[]>([]);


    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL;
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/students`, {
                    headers: {
                        "Accept-Language": language, // Replace this with dynamic language if needed
                    },
                });
                setStudents(response.data.data);
            } catch (e: unknown) {
                setError(e as string);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [language]);

    const handleError = () => {
        throw new Error('This is a test error for Sentry');
    };
    const currencyDisplay = getCurrencyDisplay();

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-500">{error}</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col overflow-hidden">
            <Header/>
            <main className="flex-grow container mx-auto p-4 w-full">
                <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        // Centered Loader inside the grid
                        <div className="col-span-full flex justify-center items-center h-40">
                            <div
                                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        students.map((student: Student, index: number) => (
                            <div
                                key={student?.email ?? index}
                                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                            >
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold mb-2">{t('name', {name: student?.name})}</h2>
                                    <div className="text-gray-700">
                                        <p className="mb-1">
                                            <span className="font-medium">{t('age', {age: student?.age})}</span>
                                        </p>
                                        <p className="mb-1">
                                            <span className="font-medium">{t('email', {email: student?.email})}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <h1 className="text-3xl mt-6">
                    The Current Currency Price is: {currencyDisplay}
                </h1>
                <div>
                    <button onClick={handleError}>Test Sentry</button>
                </div>
            </main>

            <Footer/>

        </div>
    );
};

export default HomePage;
