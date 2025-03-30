import RoomDetailsModal from "./RoomDetailsModal";
import { Dialog, DialogContent } from "./ui/Dialog.tsx";
import { Room } from "../types";

interface RoomDetailsModalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
}

const RoomDetailsModalPopup: React.FC<RoomDetailsModalPopupProps> = ({ 
  isOpen, 
  onClose,
  room
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1286px] p-0 max-h-[90vh] overflow-hidden border-none">
        <div className="overflow-y-auto max-h-[90vh]" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 transparent'
        }}>
          <RoomDetailsModal room={room} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsModalPopup; 