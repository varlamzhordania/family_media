import {createContext, useContext} from 'react';
import {useMemberships} from "@lib/hooks/useUser.jsx";


// Define the context
const MembershipsContext = createContext(null);


export const MembershipsProvider = ({children}) => {
    const [memberships, setMemberships] = useMemberships();

    return (
        <MembershipsContext.Provider value={{memberships, setMemberships}}>
            {children}
        </MembershipsContext.Provider>
    );
};

export const useMembershipsContext = () => {
    const context = useContext(MembershipsContext);
    if (!context) {
        throw new Error("useMembershipsContext must be used within a MembershipsProvider");
    }
    return context;
};
