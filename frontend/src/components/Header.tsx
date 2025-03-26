import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {PulseLoader} from "react-spinners";
import {HiGlobeAlt} from "react-icons/hi";
import {TbCurrencyDollar} from "react-icons/tb";
import {updateLanguage} from "../redux/languageSlice";
import {fetchExchangeRates, setSelectedCurrency} from "../redux/currencySlice";
import {useNavigate, useParams, Link} from "react-router-dom";
import {Button, Separator, Sheet, SheetContent, SheetTrigger} from "./ui";
import {FiMenu} from "react-icons/fi";
import {BiLogIn} from "react-icons/bi";

const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {tenantId} = useParams<{ tenantId: string }>();

    const {selectedLanguage} = useAppSelector(state => state.language);
    const {selectedCurrency} = useAppSelector(state => state.currency);
    const {globalConfig} = useAppSelector(state => state.config);
    const isLoading = !globalConfig;

    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
    const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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

    if (isLoading) {
        return (
            <header className="relative flex justify-between items-center py-4 px-6 bg-white shadow-md">
                <div className="w-full flex justify-center items-center h-16">
                    <PulseLoader color="var(--primary)" size={10}/>
                </div>
            </header>
        );
    }

    const {brand} = globalConfig.configData;

    return (
        <header className="relative flex h-[84px] justify-between items-center py-4 px-6 bg-white shadow-md">
            <div className="flex items-center space-x-2 md:space-x-4 lg:mx-20">
                <Link to={`/${tenantId}`} className="flex items-center space-x-2 md:space-x-4">
                    <img src={brand.logoUrl} alt={brand.companyName} className="w-28 h-6 md:w-36 md:h-7"/>
                    <span className="font-bold text-lg md:text-xl text-primary cursor-pointer hover:text-primary/90 transition-colors">{brand.pageTitle}</span>
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

                                <Button
                                    className="w-full bg-primary hover:bg-blue-800 text-white uppercase font-medium text-sm rounded"
                                    onClick={() => {
                                        navigate(`/${tenantId}/login`);
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    <BiLogIn className="mr-2 h-4 w-4"/>
                                    LOGIN
                                </Button>
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
                                        <TbCurrencyDollar className="w-5 h-5 text-primary mr-2"/>
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
                <a href="/#" className="text-sm font-medium uppercase text-primary">MY BOOKINGS</a>
                <div className="relative">
                    <button className="flex w-[51px] h-[20px] items-center text-blue-900 text-xs md:text-sm cursor-pointer"
                            onClick={toggleLanguageDropdown}>
                        <HiGlobeAlt width="18px" className="text-primary"/>
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
                    <button className="flex w-[51px] h-[20px] items-center text-blue-900 text-xs md:text-sm cursor-pointer"
                            onClick={toggleCurrencyDropdown}>
                        <TbCurrencyDollar width="18px" className="text-primary"/>
                        <span
                            className="text-sm md:text-base text-primary ml-1">{selectedCurrency.code}</span>
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
                <button
                    className="bg-primary hover:bg-blue-800 text-white w-[85px] h-[35px] uppercase font-medium text-sm rounded"
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