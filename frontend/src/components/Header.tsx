import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {setLanguage} from "../redux/languageSlice";
import {setSelectedCurrency} from "../redux/currencySlice";
import language from "../assets/enicon.png";
import currency from "../assets/currency.png";
import kickLogo from "../assets/kickdrum_logo.png";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

const Header: React.FC = () => {
    const dispatch = useDispatch();
    const {t} = useTranslation("navbar");
    const navigate = useNavigate();
    const selectedLanguage = useSelector((state: RootState) => state.language.language);
    const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
    const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const languages = ["en", "fr"];
    const currencies = ["USD", "EUR"];

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

    return (
        <header className="relative flex justify-between items-center py-4 px-6 bg-white shadow-md">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 md:space-x-4 lg:mx-20">
                <img src={kickLogo} alt="Kickdrum Logo" className="w-28 h-6 md:w-36 md:h-7"/>
                <span className="font-bold text-lg md:text-xl text-[#26266D]">{t("title_header")}</span>
            </div>

            {/* Hamburger Menu for Mobile */}
            <div className="md:hidden">
                <button
                    className="text-[#26266D] focus:outline-none"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 md:space-x-10 lg:mx-20">
                {/* My Bookings Link */}
                <a href="#bookings" className="text-sm font-medium uppercase text-[#26266D]">MY BOOKINGS</a>

                {/* Language Dropdown */}
                <div className="relative">
                    <button
                        className="flex items-center text-blue-900 text-xs md:text-sm cursor-pointer"
                        onClick={toggleLanguageDropdown}
                    >
                        <img src={language} alt="Language" className="w-5 h-5 md:w-6 md:h-6"/>
                        <span
                            className="text-sm md:text-base text-[#26266D] ml-1">{selectedLanguage.toUpperCase()}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 ml-1 text-[#26266D]"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>

                    {languageDropdownOpen && (
                        <div
                            className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 shadow-md rounded-md z-10">
                            {languages.map((lang) => (
                                <button
                                    key={lang}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#26266D]"
                                    onClick={() => selectLanguage(lang)}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Currency Dropdown */}
                <div className="relative">
                    <button
                        className="flex items-center text-blue-900 text-xs md:text-sm cursor-pointer"
                        onClick={toggleCurrencyDropdown}
                    >
                        <img src={currency} alt="Currency" className="w-5 h-5 md:w-6 md:h-6"/>
                        <span className="text-sm md:text-base text-[#26266D] ml-1">{selectedCurrency}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 ml-1 text-[#26266D]"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>

                    {currencyDropdownOpen && (
                        <ul className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 shadow-md rounded-md z-10">
                            {currencies.map((curr) => (
                                <li key={curr} className="px-4 py-2">
                                    <button
                                        className="w-full text-left hover:bg-gray-100 cursor-pointer text-[#26266D] focus:outline-none"
                                        onClick={() => selectCurrency(curr)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") selectCurrency(curr);
                                        }}
                                    >
                                        {curr}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Login Button */}
                <button
                    className="bg-[#26266D] hover:bg-blue-800 text-white px-6 py-2 uppercase font-medium text-sm rounded"
                    onClick={() => navigate("/login")}>
                    LOGIN
                </button>
            </div>

            {mobileMenuOpen && (
                <div className="absolute top-full right-0 w-64 bg-white shadow-lg rounded-bl-md z-20 md:hidden">
                    <div className="flex flex-col p-4 space-y-4">
                        <a className="text-sm font-medium uppercase text-[#26266D] py-2 hover:bg-gray-50 rounded px-2" href="/#">
                            MY BOOKINGS
                        </a>

                        <div className="relative py-2">
                            <button
                                className="flex items-center w-full justify-between text-blue-900 text-sm cursor-pointer hover:bg-gray-50 rounded px-2"
                                onClick={toggleLanguageDropdown}
                            >
                                <div className="flex items-center">
                                    <img src={language} alt="Language" className="w-5 h-5"/>
                                    <span
                                        className="text-sm text-[#26266D] ml-2">{selectedLanguage.toUpperCase()}</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#26266D]" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>

                            {languageDropdownOpen && (
                                <div className="mt-1 w-full bg-gray-50 rounded z-10">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang}
                                            className="block w-full px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#26266D] text-left"
                                            onClick={() => selectLanguage(lang)}
                                        >
                                            {lang.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Currency Selector */}
                        <div className="relative py-2">
                            <button
                                className="flex items-center w-full justify-between text-blue-900 text-sm cursor-pointer hover:bg-gray-50 rounded px-2"
                                onClick={toggleCurrencyDropdown}
                            >
                                <div className="flex items-center">
                                    <img src={currency} alt="Currency" className="w-5 h-5"/>
                                    <span className="text-sm text-[#26266D] ml-2">{selectedCurrency}</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#26266D]" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>

                            {currencyDropdownOpen && (
                                <div className="mt-1 w-full bg-gray-50 rounded z-10">
                                    {currencies.map((curr) => (
                                        <button
                                            key={curr}
                                            className="block w-full px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#26266D] text-left"
                                            onClick={() => selectCurrency(curr)}
                                        >
                                            {curr}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Login Button */}
                        <button
                            className="bg-[#26266D] hover:bg-blue-800 text-white px-6 py-2 uppercase font-medium text-sm rounded self-start"
                            onClick={() => navigate("/login")}
                        >
                            LOGIN
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;