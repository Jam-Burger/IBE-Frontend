interface PackageData {
    title: string;
    price: number;
    description: string;
}

interface PackageCardProps {
    packageData: PackageData;
}

const PackageCard: React.FC<PackageCardProps> = ({packageData}) => {
    return (
        <div className="w-[618px] h-[130px] flex  rounded-lg shadow-md overflow-hidden">
            {/* Left section */}
            <div className="flex-1 p-4 flex flex-col justify-start gap-2 mt-2">
                <h3 className="font-bold text-[16px] w-[128px] h-[19px]">{packageData.title}</h3>
                <p className="text-gray-600 text-[16px] font-normal w-[354px] h-[35px] leading-[1.4]">
                    {packageData.description}
                </p>
            </div>
            {/* Right section */}
            <div className="w-[200px] h-[130px] bg-[#EFF0F1] flex flex-col items-end justify-center p-4 text-right">
                <span className="text-xl font-bold w-[68px] h-[19px] flex justify-end mb-1">${packageData.price}</span>
                <span className="text-gray-500 text-xs w-[69.29px] h-[21px] flex justify-end">per night</span>
                <button className="mt-2 bg-[#26266D] text-white text-sm w-[153px] h-[35px] rounded">
                    SELECT PACKAGE
                </button>
            </div>
        </div>
    );
};

export default PackageCard;
