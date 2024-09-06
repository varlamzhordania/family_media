import {createContext, useContext, useEffect} from 'react';
import useWebSocket from 'react-use-websocket';
import {SOCKET_BASE_URL} from "@src/conf/index.js";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import {parseData} from "@lib/utils/socket.js";
import {useRoomsContext} from "@lib/context/RoomsContext.jsx";
import useSearchParamChange from "@lib/hooks/useSearchParamChange.jsx";
import {showMessageNotification, updateRoomLastMessage} from "@lib/utils/chat.jsx";
import {useUserContext} from "@lib/context/UserContext.jsx";

/**
 * @typedef {Object} WebSocketContextType
 * @property {Function} sendJsonMessage - Function to send JSON message via WebSocket.
 * @property {Object} lastJsonMessage - The last received JSON message.
 */

/**
 * @type {React.Context<WebSocketContextType | null>}
 */
const WebSocketContext = createContext(null);

/**
 * WebSocketProvider component to provide WebSocket context to children.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The children components.
 * @returns {JSX.Element}
 */
export const WebSocketProvider = ({children}) => {
        const [accessToken] = useAccessToken();
        const {user} = useUserContext()
        const {rooms, setRooms} = useRoomsContext();
        const UserSocketUrl = `${SOCKET_BASE_URL}/ws/user/?token=${accessToken}`;
        const directMessage = useSearchParamChange("dm")
        const currentRoom = useSearchParamChange("room")

        const {sendJsonMessage, lastJsonMessage} = useWebSocket(UserSocketUrl, {
            shouldReconnect: () => true,
            onMessage: (event) => {
                const [action, data] = parseData(event.data);

                switch (action) {
                    case "pull_rooms":
                        setRooms(data);
                        break;
                    case "single_room":
                        setRooms(prevRooms => [...prevRooms, data]);
                        break;
                    case "new_message":
                        handleNewMessage(data)
                        break;
                    default:
                        console.log("Unknown action on message", action);
                        break;
                }
            },
        });

        const handleNewMessage = (messageData) => {
            const roomId = messageData.room;
            const roomExists = rooms.find(item => item.id === Number(roomId))
            if (messageData.user.id === user.id)
                return

            if (roomExists) {
                if (roomId === currentRoom) {
                    // do something
                } else {
                    showMessageNotification(messageData);
                }
                setRooms(prevRooms => updateRoomLastMessage(prevRooms, messageData));
            } else {
                sendJsonMessage({action: "pull_rooms"})
                showMessageNotification(messageData);
            }
        };


        useEffect(() => {
            if (directMessage) {
                const exists = rooms.find(item => item?.participants?.find(participant => participant.id === Number(directMessage) && item.type === "private"));
                if (!exists) {
                    sendJsonMessage({
                        action: "get_or_create_room",
                        dm: directMessage,
                    })

                }
            }

        }, [directMessage]);

        return (
            <WebSocketContext.Provider value={{sendJsonMessage, lastJsonMessage}}>
                {children}
            </WebSocketContext.Provider>
        );
    }
;

/**
 * Custom hook to use WebSocket context.
 * @returns {WebSocketContextType} The WebSocket context value.
 * @throws {Error} If used outside of a WebSocketProvider.
 */
export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocketContext must be used within a WebSocketProvider");
    }
    return context;
};
