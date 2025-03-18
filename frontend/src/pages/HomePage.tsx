import React from 'react';
import {useTranslation} from 'react-i18next';

import { Header, Footer } from '../components';


import CardWithForm  from '../components/ui/CardWithForm';

const HomePage: React.FC = () => {
    const {t} = useTranslation("hotel");


    // const handleError = () => {
    //     throw new Error('This is a test error for Sentry');
    // };

   

    return (
        <div className="min-h-screen flex flex-col overflow-hidden">
            <Header/>
            <main className="flex-grow container mx-auto p-4 w-full">
                <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
                <CardWithForm/>
                {/* <Button onClick={handleError}>Test Sentry</Button> */}
            </main>
            <Footer/>
        </div>
    );
};

export default HomePage;
