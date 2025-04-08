import React from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from './Dialog';
import {Button} from './Button';

interface ErrorDialogProps {
    onClose: () => void;
    title: string;
    message: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
                                                     onClose,
                                                     title,
                                                     message,
                                                 }) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600">{title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-gray-700">{message}</p>
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ErrorDialog; 