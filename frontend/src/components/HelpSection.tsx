import React from "react";
import {useAppSelector} from "../redux/hooks";

const HelpSection: React.FC = () => {
    const {propertyDetails} = useAppSelector((state) => state.checkout);

    if (!propertyDetails) return <></>;
    return (
        <div className="w-[400px] h-[150px] bg-gray-100 p-6 rounded-lg mt-6 mx-auto">
            <h2 className="text-xl font-bold mb-3">Need help?</h2>
            <p className="font-bold">Call {propertyDetails.contactNumber}</p>
            <p className="text-sm text-gray-600">
                {propertyDetails.availability}
            </p>
        </div>
    );
};

export default HelpSection;
