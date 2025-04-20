import React, {useCallback, useEffect} from 'react';
import CardWithForm from '../components/ui/CardWithForm';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {fetchConfig} from '../redux/configSlice';
import {PulseLoader} from 'react-spinners';
import {useParams} from 'react-router-dom';
import {StateStatus} from '../types/common';
import {fetchLocationInfo} from '../redux/languageSlice';
import {ConfigType} from '../types/ConfigType';

const HomePage: React.FC = () => {
    const {tenantId} = useParams<{ tenantId: string }>();
    const dispatch = useAppDispatch();
    const {status, globalConfig, landingConfig} = useAppSelector(state => state.config);
    const {hasInitialized: languageInitialized} = useAppSelector(state => state.language);

    const isLoading = status === StateStatus.LOADING || !globalConfig || !landingConfig;

    const fetchConfigs = useCallback(async () => {
        if (tenantId) {
            dispatch(fetchConfig({tenantId, configType: ConfigType.LANDING}));
        }

        if (!languageInitialized) {
            dispatch(fetchLocationInfo());
        }
    }, [dispatch, tenantId, languageInitialized]);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <PulseLoader color="var(--primary-color)" size={15}/>
                <p className="mt-4 text-gray-600">Loading application configuration...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col overflow-hidden">
            <main className="relative h-screen w-full flex-grow p-4 sm:p-9">
                <img
                    src={landingConfig.configData.banner.imageUrl}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="relative z-10 w-full sm:w-fit flex justify-center sm:justify-start">
                    <CardWithForm/>
                </div>
            </main>
        </div>
    );
};

export default HomePage;
