import React, {useCallback, useEffect} from 'react';
import CardWithForm from '../components/ui/CardWithForm';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {fetchGlobalConfig, fetchLandingConfig} from '../redux/configSlice';
import {PulseLoader} from 'react-spinners';
import {useParams} from 'react-router-dom';

const HomePage: React.FC = () => {
    const {tenantId} = useParams<{ tenantId: string }>();
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
            <main className="relative h-screen w-full flex-grow p-9">
                <img
                    src={landingConfig.configData.banner.imageUrl}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="relative z-10 w-fit">
                    <CardWithForm />
                </div>
            </main>
        </div>
    );
};

export default HomePage;
