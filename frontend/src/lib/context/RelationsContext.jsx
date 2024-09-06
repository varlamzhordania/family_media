import {createContext, useContext} from 'react';
import {useRelations} from "@lib/hooks/useUser.jsx";


// Define the context
const RelationsContext = createContext(null);


export const RelationsProvider = ({children}) => {
    const [relations, setRelations] = useRelations();

    return (
        <RelationsContext.Provider value={{relations, setRelations}}>
            {children}
        </RelationsContext.Provider>
    );
};

export const useRelationsContext = () => {
    const context = useContext(RelationsContext);
    if (!context) {
        throw new Error("useRelationsContext must be used within a RelationsProvider");
    }
    return context;
};
