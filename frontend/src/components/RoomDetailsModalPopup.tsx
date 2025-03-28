import RoomDetailsModal from "./RoomDetailsModal";
import { Dialog, DialogContent } from "./ui/dialog";

interface RoomDetailsModalPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoomDetailsModalPopup: React.FC<RoomDetailsModalPopupProps> = ({ 
  isOpen, 
  onClose 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1286px] p-0 max-h-[90vh] overflow-hidden border-none">
        <div className="overflow-y-auto max-h-[90vh]" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 transparent'
        }}>
          <RoomDetailsModal />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsModalPopup; 