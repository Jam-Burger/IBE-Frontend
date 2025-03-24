import React from 'react';

import { Header, Footer } from '../components';


import CardWithForm  from '../components/ui/CardWithForm';

const HomePage: React.FC = () => {
      
    return (
        <div className="min-h-screen flex flex-col overflow-hidden">
            <Header/>
            <main className="bg-[url('/banner.avif')] bg-cover bg-center h-screen w-full  flex-grow container mx-auto p-4 w-full">
                <CardWithForm />
            </main>
            <Footer/>
        </div>
    );
};

export default HomePage;
