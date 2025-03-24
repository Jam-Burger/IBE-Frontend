import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setLanguage } from "../redux/languageSlice";
import { setSelectedCurrency } from "../redux/currencySlice";
import languageIcon from "../assets/enicon.png";
import currencyIcon from "../assets/currency.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation("navbar");
    const navigate = useNavigate();
    
    const selectedLanguage = useSelector((state: RootState) => state.language.language);
    const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
    
    const globalConfig = useSelector((state: RootState) => 
        state.config.globalConfig?.data.configData
      );

    const [languageDropdownOpen, setLanguageDropdownOpen] = useState<boolean>(false);
    const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState<boolean>(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    const brandLogo: string = globalConfig?.brand?.logoUrl || "./kickdrum_logo.png";
    const companyName: string = globalConfig?.brand?.companyName || "Kickdrum";

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
        
        dispatch(setLanguage(lang));
        setLanguageDropdownOpen(false);
    };

    const selectCurrency = (curr: string) => {
        
        dispatch(setSelectedCurrency(curr));
        setCurrencyDropdownOpen(false);
    };

    const getLanguageName = (code: string): string => {
        const lang = globalConfig?.languages?.find((l: { code: string; name: string }) => l.code === code);
        return lang ? lang.name : code.toUpperCase();
    };

    const getCurrencySymbol = (code: string): string => {
        const curr = globalConfig?.currencies?.find((c: { code: string; symbol: string }) => c.code === code);
        return curr ? `${code} (${curr.symbol})` : code;
    };

    return (
        <header className="relative flex justify-between items-center py-4 px-6 bg-white shadow-md">
            <div className="flex items-center space-x-2 md:space-x-4 lg:mx-20">
                <img src={brandLogo} alt={`${companyName} Logo`} className="w-28 h-6 md:w-36 md:h-7" />
                <span className="font-bold text-lg md:text-xl text-[#26266D]">{t(companyName)}</span>
            </div>

            <div className="md:hidden">
                <button
                    className="text-[#26266D] focus:outline-none"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            <div className="hidden md:flex items-center space-x-6 md:space-x-10 lg:mx-20">
                <a href="/#" className="text-sm font-medium uppercase text-[#26266D]">MY BOOKINGS</a>
                <div className="relative">
                    <button className="flex items-center text-blue-900 text-xs md:text-sm cursor-pointer" onClick={toggleLanguageDropdown}>
                        <img src={languageIcon} alt="Language" className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="text-sm md:text-base text-[#26266D] ml-1">{getLanguageName(selectedLanguage)}</span>
                    </button>
                    {languageDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-md rounded-md z-10">
                            {globalConfig?.languages?.map((lang: { code: string; name: string }) => (
                                <button key={lang.code} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#26266D] w-full text-left" onClick={() => selectLanguage(lang.code)}>
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="relative">
                    <button className="flex items-center text-blue-900 text-xs md:text-sm cursor-pointer" onClick={toggleCurrencyDropdown}>
                        <img src={currencyIcon} alt="Currency" className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="text-sm md:text-base text-[#26266D] ml-1">{getCurrencySymbol(selectedCurrency)}</span>
                    </button>
                    {currencyDropdownOpen && (
                        <ul className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-md rounded-md z-10">
                            {globalConfig?.currencies?.map((curr: { code: string; symbol: string }) => (
                                <li key={curr.code} className="px-4 py-2" onClick={() => selectCurrency(curr.code)}>
                                    <button className="w-full text-left hover:bg-gray-100 cursor-pointer text-[#26266D] focus:outline-none">
                                        {curr.code} ({curr.symbol})
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button className="bg-[#26266D] hover:bg-blue-800 text-white px-6 py-2 uppercase font-medium text-sm rounded" onClick={() => navigate("/login")}>
                    LOGIN
                </button>
            </div>
        </header>
    );
};

export default Header;