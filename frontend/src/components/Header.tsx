import React, {useEffect, useState} from "react";
import {fetchExchangeRates, updateCurrency} from "../redux/currencySlice";
import languageIcon from "../assets/enicon.png";
import currencyIcon from "../assets/currency.png";
import {useNavigate, useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {PulseLoader} from "react-spinners";

declare global {
    interface Window {
        translatePage?: (langCode: string) => void;
    }
}

const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {tenantId} = useParams<{ tenantId: string }>();

    const selectedLanguage = localStorage.getItem('selectedLanguage') ?? 'en';
    const {selectedCurrency, rates, status: currencyStatus} = useAppSelector(state => state.currency);
    const {globalConfig, landingConfig, status} = useAppSelector(state => state.config);
    const isLoading = status === "loading" || !globalConfig || !landingConfig || currencyStatus === "loading";

    const [languageDropdownOpen, setLanguageDropdownOpen] = useState<boolean>(false);
    const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState<boolean>(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    // Fetch exchange rates on component mount
    useEffect(() => {
        if (Object.keys(rates).length === 0) {
            dispatch(fetchExchangeRates());
        }
    }, [dispatch, rates]);

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

    const selectLanguage = (lang: string) => {
        if (window.translatePage) {
            window.translatePage(lang);
            localStorage.setItem('selectedLanguage', lang);
        }

        setLanguageDropdownOpen(false);
        window.location.reload();
    };

    const selectCurrency = (curr: string) => {
        dispatch(updateCurrency(curr));
        setCurrencyDropdownOpen(false);
    };

    const getLanguageName = (code: string): string => {
        if (!globalConfig?.configData.languages) return code;
        const lang = globalConfig.configData.languages.find(l => l.code === code);
        return lang ? lang.name : code;
    };

    const getCurrencySymbol = (code: string): string => {
        if (!globalConfig?.configData.currencies) return code;
        const curr = globalConfig.configData.currencies.find(c => c.code === code);
        return curr ? `${code} (${curr.symbol})` : code;
    };

    if (isLoading) {
        return (
            <header className="relative flex justify-between items-center py-4 px-6 bg-white shadow-md">
                <div className="w-full flex justify-center items-center h-16">
                    <PulseLoader color="#26266D" size={10}/>
                </div>
            </header>
        );
    }

    const {brand} = globalConfig.configData;
    const brandLogo = brand.logoUrl;
    const pageTitle = landingConfig.configData.pageTitle;

    return (
        <header className="relative flex justify-between items-center py-4 px-6 bg-white shadow-md">
            <div className="flex items-center space-x-2 md:space-x-4 lg:mx-20">
                <img src={brandLogo} alt={pageTitle} className="w-28 h-6 md:w-36 md:h-7"/>
                <span className="font-bold text-lg md:text-xl text-[#26266D]">{pageTitle}</span>
            </div>

            <div className="md:hidden">
                <button
                    className="text-[#26266D] focus:outline-none"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M4 6h16M4 12h16M4 18h16"/>
                        )}
                    </svg>
                </button>
            </div>

            <div className="hidden md:flex items-center space-x-6 md:space-x-10 lg:mx-20">
                <a href="/#" className="text-sm font-medium uppercase text-[#26266D]">MY BOOKINGS</a>
                {globalConfig.configData.languages && (
                    <div className="relative">
                        <button className="flex items-center text-blue-900 text-xs md:text-sm cursor-pointer"
                                onClick={toggleLanguageDropdown}>
                            <img src={languageIcon} alt="Language" className="w-5 h-5 md:w-6 md:h-6"/>
                            <span
                                className="text-sm md:text-base text-[#26266D] ml-1">{getLanguageName(selectedLanguage)}</span>
                        </button>
                        {languageDropdownOpen && (
                            <div
                                className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-md rounded-md z-10">
                                {globalConfig.configData.languages.map((lang) => (
                                    <button key={lang.code}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#26266D] w-full text-left"
                                            onClick={() => selectLanguage(lang.code)}>
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {globalConfig.configData.currencies && (
                    <div className="relative">
                        <button className="flex items-center text-blue-900 text-xs md:text-sm cursor-pointer"
                                onClick={toggleCurrencyDropdown}>
                            <img src={currencyIcon} alt="Currency" className="w-5 h-5 md:w-6 md:h-6"/>
                            <span
                                className="text-sm md:text-base text-[#26266D] ml-1">{getCurrencySymbol(selectedCurrency)}</span>
                        </button>
                        {currencyDropdownOpen && (
                            <ul className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-md rounded-md z-10">
                                {globalConfig.configData.currencies.map((curr) => (
                                    <li key={curr.code} className="px-4 py-2">
                                        <button
                                            className="w-full text-left hover:bg-gray-100 cursor-pointer text-[#26266D] focus:outline-none"
                                            onClick={() => selectCurrency(curr.code)}>
                                            {curr.code} ({curr.symbol})
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                <button
                    className="bg-[#26266D] hover:bg-blue-800 text-white px-6 py-2 uppercase font-medium text-sm rounded"
                    onClick={() => {
                        navigate(`/${tenantId}/login`);
                    }}>
                    LOGIN
                </button>
            </div>
        </header>
    );
};

export default Header;