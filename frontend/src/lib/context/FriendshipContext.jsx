import {createContext, useContext} from 'react';
import {useFriendships} from "@lib/hooks/useUser.jsx";


// Define the context
const FriendshipsContext = createContext(null);


export const FriendshipsProvider = ({children}) => {
    const [friendships, setFriendships] = useFriendships();

    return (
        <FriendshipsContext.Provider value={{friendships, setFriendships}}>
            {children}
        </FriendshipsContext.Provider>
    );
};

export const useFriendshipsContext = () => {
    const context = useContext(FriendshipsContext);
    if (!context) {
        throw new Error("useFriendshipsContext must be used within a MembershipsProvider");
    }
    return context;
};
