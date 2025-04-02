import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {PulseLoader} from "react-spinners";
import {HiGlobeAlt} from "react-icons/hi";
import {updateLanguage} from "../redux/languageSlice";
import {fetchExchangeRates, setSelectedCurrency} from "../redux/currencySlice";
import {Link, useNavigate, useParams} from "react-router-dom";
import {Button, Separator, Sheet, SheetContent, SheetTrigger} from "./ui";
import {FiMenu} from "react-icons/fi";
import {BiLogIn, BiLogOut} from "react-icons/bi";
import {fetchConfig} from "../redux/configSlice.ts";
import {ConfigType} from "../types/ConfigType";
import {useAuth} from "react-oidc-context";

const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {tenantId} = useParams<{ tenantId: string }>();
    const auth = useAuth();

    const {selectedLanguage} = useAppSelector(state => state.language);
    const {selectedCurrency} = useAppSelector(state => state.currency);
    const {globalConfig} = useAppSelector(state => state.config);
    const isLoading = !globalConfig;

    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
    const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    const isAuthenticated = auth.isAuthenticated;

    useEffect(() => {
        if (!tenantId) {
            console.error("Tenant ID is not available");
            return;
        }
        dispatch(fetchConfig({tenantId, configType: ConfigType.GLOBAL}));
    }, [tenantId, dispatch]);

    useEffect(() => {
        if (selectedCurrency) {
            dispatch(setSelectedCurrency(selectedCurrency));
            if (selectedCurrency.code !== 'USD') {
                dispatch(fetchExchangeRates());
            }
        }
    }, [dispatch, selectedCurrency]);

    const toggleLanguageDropdown = () => {
        setLanguageDropdownOpen(!languageDropdownOpen);
        setCurrencyDropdownOpen(false);
    };

    const toggleCurrencyDropdown = () => {
        setCurrencyDropdownOpen(!currencyDropdownOpen);
        setLanguageDropdownOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        setLanguageDropdownOpen(false);
        setCurrencyDropdownOpen(false);
    };

    const selectLanguage = (language: { code: string; name: string }) => {
        dispatch(updateLanguage(language));
        setLanguageDropdownOpen(false);
    };

    const selectCurrency = (currency: { code: string; symbol: string }) => {
        dispatch(setSelectedCurrency(currency));
        setCurrencyDropdownOpen(false);
    };

    const handleLogin = () => {
        navigate(`/${tenantId}/login`);
    };

    const handleLogout = () => {
        // First remove the user locally
        auth.removeUser();
        
        // Then redirect to Cognito logout
        const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
        const logoutUri = window.location.origin + "/auth/logout";
        const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
        window.location.href = `https://${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    if (isLoading) {
        return (
            <header
                className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center py-4 px-6 bg-white shadow-md">
                <div className="w-full flex justify-center items-center h-16">
                    <PulseLoader color="var(--primary)" size={10}/>
                </div>
            </header>
        );
    }

    const {brand} = globalConfig.configData;
    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 flex h-[84px] justify-between items-center py-4 px-6 bg-white shadow-md">
            <div className="flex items-center space-x-2 md:space-x-4 lg:mx-20">
                <Link to={`/${tenantId}`} className="flex items-center space-x-2 md:space-x-4">
                    <img src={brand.logoUrl} alt={brand.companyName} className="w-28 h-6 md:w-36 md:h-7"/>
                    <span
                        className="font-bold text-lg md:text-xl text-primary cursor-pointer hover:text-primary/90 transition-colors">{brand.pageTitle}</span>
                </Link>
            </div>

            <div className="md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <button
                            className="text-primary focus:outline-none"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            <FiMenu className="h-6 w-6"/>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                        <div className="flex flex-col h-full overflow-auto p-4 pt-12">
                            <div className="flex flex-col space-y-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-primary font-medium"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    MY BOOKINGS
                                </Button>

                                {isAuthenticated ? (
                                    <Button
                                        className="w-full bg-red-600 hover:bg-red-700 text-white uppercase font-medium text-sm rounded"
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <BiLogOut className="mr-2 h-4 w-4"/>
                                        LOGOUT
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full bg-primary hover:bg-blue-800 text-white uppercase font-medium text-sm rounded"
                                        onClick={() => {
                                            handleLogin();
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <BiLogIn className="mr-2 h-4 w-4"/>
                                        LOGIN
                                    </Button>
                                )}
                            </div>

                            <Separator className="my-4"/>

                            <div className="space-y-4">
                                {/* Language selection */}
                                <div>
                                    <div className="flex items-center mb-2">
                                        <HiGlobeAlt className="w-5 h-5 text-primary mr-2"/>
                                        <h3 className="font-medium text-sm text-primary">Language</h3>
                                    </div>
                                    <div className="space-y-1 pl-7">
                                        {globalConfig.configData.languages.map((lang) => (
                                            <Button
                                                key={lang.code}
                                                variant="ghost"
                                                className={`w-full justify-start py-1 h-auto ${selectedLanguage.code === lang.code ? 'bg-gray-100 font-medium text-primary' : 'text-gray-700'}`}
                                                onClick={() => {
                                                    selectLanguage(lang);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                {lang.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Currency selection */}
                                <div>
                                    <div className="flex items-center mb-2">
                                        <span
                                            className="w-4 h-4 text-primary mr-2 flex items-center justify-center font-medium text-base">
                                            {selectedCurrency.symbol}
                                        </span>
                                        <h3 className="font-medium text-sm text-primary">Currency</h3>
                                    </div>
                                    <div className="space-y-1 pl-7">
                                        {globalConfig.configData.currencies.map((curr) => (
                                            <Button
                                                key={curr.code}
                                                variant="ghost"
                                                className={`w-full justify-start py-1 h-auto ${selectedCurrency.code === curr.code ? 'bg-gray-100 font-medium text-primary' : 'text-gray-700'}`}
                                                onClick={() => {
                                                    selectCurrency(curr);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                {curr.code} ({curr.symbol})
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="hidden md:flex items-center space-x-6 md:space-x-10 lg:mx-20">
                <a href="/#" className="text-[14px] font-bold uppercase text-primary h-[20px] min-w-[102px]">MY
                    BOOKINGS</a>
                <div className="relative">
                    <button
                        className="flex w-[51px] h-[20px] items-center text-blue-900 text-xs md:text-sm cursor-pointer"
                        onClick={toggleLanguageDropdown}>
                        <HiGlobeAlt className="text-primary w-[16px] h-[16px] scale-125"/>

                        <span
                            className="text-sm md:text-base text-primary ml-1 capitalize">{selectedLanguage.code}</span>
                    </button>
                    {languageDropdownOpen && globalConfig?.configData.languages && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                            {globalConfig.configData.languages.map((lang) => (
                                <div key={lang.code} className="px-4 py-2">
                                    <button
                                        className="w-full text-left hover:bg-gray-100 cursor-pointer text-primary focus:outline-none"
                                        onClick={() => selectLanguage(lang)}>
                                        {lang.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="relative">
                    <button
                        className="flex w-[51px] h-[20px] items-center text-blue-900 text-xs md:text-sm cursor-pointer"
                        onClick={toggleCurrencyDropdown}>
                        <span className="text-primary font-medium w-4 h-4 flex items-center justify-center text-base">
                            {selectedCurrency.symbol}
                        </span>
                        <span className="text-sm md:text-base text-primary ml-1">
                            {selectedCurrency.code}
                        </span>
                    </button>
                    {currencyDropdownOpen && globalConfig?.configData.currencies && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                            {globalConfig.configData.currencies.map((curr) => (
                                <div key={curr.code} className="px-4 py-2">
                                    <button
                                        className="w-full text-left hover:bg-gray-100 cursor-pointer text-primary focus:outline-none"
                                        onClick={() => selectCurrency(curr)}>
                                        {curr.code} ({curr.symbol})
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {isAuthenticated ? (
                    <Button
                        className="min-w-[85px] h-[35px] text-sm bg-red-600 hover:bg-red-700 flex items-center"
                        onClick={handleLogout}>
                        <BiLogOut className="mr-1 h-4 w-4" />
                        LOGOUT
                    </Button>
                ) : (
                    <Button
                        className="min-w-[85px] h-[35px] text-sm flex items-center"
                        onClick={handleLogin}>
                        <BiLogIn className="mr-1 h-4 w-4" />
                        LOGIN
                    </Button>
                )}
            </div>
        </header>
    );
};

export default Header;