import {createContext, useContext} from 'react';
import {useUser} from "@lib/hooks/useUser.jsx";


// Define the context
const UserContext = createContext(null);


// RoomsProvider component
export const UserProvider = ({children}) => {
    const [user, setUser] = useUser();

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
};
