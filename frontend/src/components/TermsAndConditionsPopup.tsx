import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';

interface TermsAndConditionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsAndConditionsPopup: React.FC<TermsAndConditionsPopupProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#333]">Terms and Conditions</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4 text-[#333]">
          <h3 className="font-semibold">1. Acceptance of Terms</h3>
          <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h3 className="font-semibold">2. Booking and Payment</h3>
          <p>All bookings are subject to availability. Payment is required at the time of booking. We accept various payment methods including credit cards.</p>
          
          <h3 className="font-semibold">3. Cancellation Policy</h3>
          <p>Cancellation policies vary by rate type. Please refer to your specific booking conditions for details.</p>
          
          <h3 className="font-semibold">4. Privacy Policy</h3>
          <p>We are committed to protecting your privacy. Your personal information will be used in accordance with our privacy policy.</p>
          
          <h3 className="font-semibold">5. Liability</h3>
          <p>We shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditionsPopup; 