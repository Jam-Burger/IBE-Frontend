import React from "react";
import {useTranslation} from "react-i18next";

const Footer: React.FC = () => {
    const {t} = useTranslation("footer");

    return (
        <footer className="bg-[#0d0524] text-white py-4 w-full">
            <div
                className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-10 text-center md:text-left">
                <span className="font-bold text-lg md:text-2xl flex items-center">Kickdrum</span>

                <div className="text-sm md:text-base mt-2 md:mt-0">
                    <p className="mb-1">&copy; {t("company")}</p>
                    <p>{t("rights")}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
