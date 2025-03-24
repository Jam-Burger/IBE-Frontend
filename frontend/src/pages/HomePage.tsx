import React, {useCallback, useEffect} from 'react';
import CardWithForm from '../components/ui/CardWithForm';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {fetchGlobalConfig, fetchLandingConfig} from '../redux/configSlice';
import {PulseLoader} from 'react-spinners';
import {useParams} from 'react-router-dom';

const HomePage: React.FC = () => {
    const {tenantId} = useParams<{tenantId: string}>();
    const dispatch = useAppDispatch();
    const {status, globalConfig, landingConfig} = useAppSelector(state => state.config);

    const isLoading = status === 'loading' || !globalConfig || !landingConfig;

    const fetchConfigs = useCallback(async () => {
        await Promise.all([
            dispatch(fetchGlobalConfig(tenantId)),
            dispatch(fetchLandingConfig(tenantId))
        ]);
    }, [dispatch, tenantId]);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <PulseLoader color="#26266D" size={15}/>
                <p className="mt-4 text-gray-600">Loading application configuration...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col overflow-hidden">
            <main
                className="bg-[url('/banner.avif')] bg-cover bg-center h-screen w-full flex-grow container mx-auto p-4">
                <CardWithForm/>
            </main>
        </div>
    );
};

export default HomePage;
