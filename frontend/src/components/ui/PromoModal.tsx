import React from 'react';
import { Dialog, DialogContent } from './Dialog';
import { MdOutlineClose } from "react-icons/md";

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PromoModal: React.FC<PromoModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-6">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 text-black hover:text-gray-700"
          >
            <MdOutlineClose/>
          </button>
          
          <h2 className="text-2xl font-bold mb-2">Circus Saving Promotion</h2>
          
          <div className="space-y-2">
            <p className="text-lg">Save upto 30% OFF room rates</p>
            <p className="text-lg">w/ 2 night minimum stay</p>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Package Total</span>
              <span className="text-lg font-medium">$2570.60</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoModal; 