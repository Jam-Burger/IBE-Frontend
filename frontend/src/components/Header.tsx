// components/Header.tsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setLanguage } from "../redux/languageSlice";
import { setSelectedCurrency } from "../redux/currencySlice";
import language from "../assets/enicon.png";
import currency from "../assets/currency.png";
import kickLogo from "../assets/KickLogo.png";
import { useTranslation } from "react-i18next";

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation("navbar");
 
  const selectedLanguage = useSelector((state: RootState) => state.language.language);
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const languages = ["en","fr"];

  const currencies = ["USD", "EUR"];

  const toggleLanguageDropdown = () => {
    setLanguageDropdownOpen(!languageDropdownOpen);
    setCurrencyDropdownOpen(false);
  };

  const toggleCurrencyDropdown = () => {
    setCurrencyDropdownOpen(!currencyDropdownOpen);
    setLanguageDropdownOpen(false);
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
    <header className="flex justify-between items-center py-4 px-6 bg-white shadow-md">
      {/* Logo and Title */}
      <div className="flex items-center space-x-2 md:space-x-4 lg:mx-20">
        <img src={kickLogo} alt="Kickdrum Logo" className="w-28 h-6 md:w-36 md:h-7" />
        <span className="font-bold text-lg md:text-xl text-[#26266D]">{t("title_header")}</span>
      </div>

      {/* Language and Currency Selectors */}
      <div className="flex items-center space-x-6 md:space-x-10 lg:mx-20">
        {/* Language Dropdown */}
        <div className="relative">
          <button
            className="flex items-center text-blue-900 text-xs md:text-sm cursor-pointer"
            onClick={toggleLanguageDropdown}
            
          >
            <img src={language} alt="Language" className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-sm md:text-base text-[#26266D] ml-1">{selectedLanguage.toUpperCase()}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 ml-1 text-[#26266D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {languageDropdownOpen && (
            <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 shadow-md rounded-md z-10">
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
            <img src={currency} alt="Currency" className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-sm md:text-base text-[#26266D] ml-1">{selectedCurrency}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 ml-1 text-[#26266D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
      </div>
    </header>
  );
};

export default Header;
