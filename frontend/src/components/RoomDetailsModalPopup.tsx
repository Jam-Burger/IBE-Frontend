import RoomDetailsModal from "./RoomDetailsModal";
import {Dialog, DialogContent} from "./ui/Dialog.tsx";
import {Room} from "../types";
import {FC} from "react";

interface RoomDetailsModalPopupProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room;
}

const RoomDetailsModalPopup: FC<RoomDetailsModalPopupProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   room,
                                                               }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[1286px] p-0 max-h-[90vh] overflow-hidden border-none rounded-lg mx-auto">
                <div className="overflow-y-auto max-h-[90vh]">
                    <RoomDetailsModal room={room}/>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RoomDetailsModalPopup; 