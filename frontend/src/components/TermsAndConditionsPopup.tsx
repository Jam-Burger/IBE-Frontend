import React, {useEffect, useState} from 'react';
import {Dialog, DialogContent} from './ui/Dialog';
import {api} from "../lib/api-client.ts";
import {useAppSelector} from "../redux/hooks.ts";

interface TermsAndConditionsPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const TermsAndConditionsPopup: React.FC<TermsAndConditionsPopupProps> = ({
                                                                             isOpen,
                                                                             onClose
                                                                         }) => {
    const policyUrl = useAppSelector(state => state.checkout.propertyDetails?.termsAndConditions);
    const [htmlContent, setHtmlContent] = useState<string>('');

    const fetchTerms = async () => {
        if (!policyUrl) return;
        const data = await api.getTermsAndPolicy(policyUrl);
        setHtmlContent(data);
    }
    useEffect(() => {
        if (isOpen) {
            fetchTerms();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <div className="mt-4 space-y-4 text-[#333]"
                     dangerouslySetInnerHTML={{__html: htmlContent}}
                />
            </DialogContent>
        </Dialog>
    );
};

export default TermsAndConditionsPopup; 