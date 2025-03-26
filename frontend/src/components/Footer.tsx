import React from "react";
import {useAppSelector} from "../redux/hooks";

const Footer: React.FC = () => {
    const {globalConfig} = useAppSelector(state => state.config);
    const companyName = globalConfig?.configData.brand.companyName ?? "";

    return (
        <footer className="bg-[#0d0524] text-white py-4 w-full">
            <div
                className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-10 text-center md:text-left">
                <span className="font-bold text-lg md:text-2xl flex items-center leading-[28px]">{companyName.split(" ")[0]}</span>

                <div className="text-sm md:text-base mt-2 md:mt-0 md:text-right text-center leading-[28px]">
                    <p className="mb-1">&copy; {companyName}.</p>
                    <p>All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
