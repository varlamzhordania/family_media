import {createContext, useContext} from 'react';
import {useRooms} from "@lib/hooks/useRooms.jsx";


// Define the context
const RoomsContext = createContext(null);


// RoomsProvider component
export const RoomsProvider = ({children}) => {
    const [rooms, setRooms] = useRooms();

    return (
        <RoomsContext.Provider value={{rooms, setRooms}}>
            {children}
        </RoomsContext.Provider>
    );
};

export const useRoomsContext = () => {
    const context = useContext(RoomsContext);
    if (!context) {
        throw new Error("useRoomsContext must be used within a RoomsProvider");
    }
    return context;
};
