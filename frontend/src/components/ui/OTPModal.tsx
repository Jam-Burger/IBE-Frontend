import React from 'react';
import { X } from 'lucide-react';


interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OTPModal: React.FC<OTPModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[29.875rem] h-[16.5625rem] bg-white relative rounded-md p-[2rem]">
        <button 
          onClick={onClose}
          className="w-[1.5rem] h-[1.5rem] absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <div>
          <h2 className="w-[23rem] h-[4.25rem] text-[#000000] font-lato font-bold text-[24px] leading-[140%] tracking-normal">
            Enter OTP for cancelling the room booking
          </h2>
          
          <input
            type="text"
            className="w-[23.3125rem] h-[3rem] rounded-[0.25rem] border-[0.0625rem] border-gray-[#C1C2C2] mt-4 px-4 py-3"
            placeholder=""
          />
          
          <div className="flex justify-end mt-6">
            <button 
              className="w-[7.3125rem] h-[2.5rem] bg-[#26266D] text-white rounded-[0.25rem] font-lato font-[14px] text-sm"
            >
              CONFIRM OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;