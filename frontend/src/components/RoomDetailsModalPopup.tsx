import RoomDetailsModal from "./RoomDetailsModal";
import {Dialog, DialogContent} from "./ui/Dialog.tsx";
import {Room} from "../types";
import {FC} from "react";

interface RoomDetailsModalPopupProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room;
    onSelectRoom: () => void;
}

const RoomDetailsModalPopup: FC<RoomDetailsModalPopupProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   room,
                                                                   onSelectRoom
                                                               }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[1286px] p-0 max-h-[90vh] overflow-hidden border-none">
                <div className="overflow-y-auto max-h-[90vh]">
                    <RoomDetailsModal room={room} onClose={onClose} onSelectRoom={onSelectRoom}/>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RoomDetailsModalPopup; 