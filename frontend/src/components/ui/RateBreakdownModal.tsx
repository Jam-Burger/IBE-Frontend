import React from 'react';
import {Dialog, DialogContent} from './Dialog';

interface RateBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RateBreakdownModal: React.FC<RateBreakdownModalProps> = ({
                                                                   isOpen,
                                                                   onClose
                                                               }) => {
    const dailyRates = [
        {date: new Date('2022-03-09'), rate: 132},
        {date: new Date('2022-03-10'), rate: 132},
        {date: new Date('2022-03-11'), rate: 100},
        {date: new Date('2022-03-12'), rate: 132},
        {date: new Date('2022-03-13'), rate: 132},
        {date: new Date('2022-03-14'), rate: 132},
        {date: new Date('2022-03-15'), rate: 132},
        {date: new Date('2022-03-16'), rate: 132}
    ];

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-[409px] !h-[742px] p-6 overflow-y-auto">
                <div className="relative">
                    {/*<button*/}
                    {/*  onClick={onClose}*/}
                    {/*  className="absolute right-0 top-0 text-black hover:text-gray-700"*/}
                    {/*>*/}
                    {/*  <MdOutlineClose />*/}
                    {/*</button>*/}

                    <h2 className="text-2xl font-bold mb-4">Rate Breakdown</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-1">Room type</h3>
                            <p>Executive Rooms</p>
                        </div>

                        <div>
                            <h3 className="font-medium mb-1">Nightly Rate (per room)</h3>
                            <p className="mb-2">Circus savings promotion</p>
                            {dailyRates.map((dayRate, index) => (
                                <div key={index} className="flex justify-between py-1">
                                    <span>{formatDate(dayRate.date)}</span>
                                    <span>${dayRate.rate}</span>
                                </div>
                            ))}
                            <div className="flex justify-between py-2 border-t mt-2">
                                <span className="font-medium">Room Total</span>
                                <span className="font-medium">$1024</span>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-2">Taxes and fees (per room)</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Resort fee</span>
                                    <span>$132</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Occupancy tax</span>
                                    <span>$132</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Due now</span>
                                <span className="font-medium">$400</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Due at resort</span>
                                <span className="font-medium">$1288</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RateBreakdownModal; 