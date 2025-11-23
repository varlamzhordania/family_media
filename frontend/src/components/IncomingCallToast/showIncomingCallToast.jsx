import {toast} from "react-hot-toast";
import IncomingCallToast from "../IncomingCallToast/IncomingCallToast.jsx";

export const showIncomingCallToast = ({
    roomId,
    roomType,
    roomTitle,
    creator,
    ringingController,
}) => {
    toast.custom(
        (t) => (
            <IncomingCallToast
                t={t}
                roomId={roomId}
                roomType={roomType}
                roomTitle={roomTitle}
                creator={creator}
                ringingController={ringingController}
            />
        ),
        {
            id: `notification-call-${roomId}`,
            duration: Infinity,
        }
    );
};
