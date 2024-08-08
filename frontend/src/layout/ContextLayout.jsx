import {RoomsProvider} from "@lib/context/RoomsContext.jsx";
import {UserProvider} from "@lib/context/UserContext.jsx";
import {MembershipsProvider} from "@lib/context/MembershipsContext.jsx";
import {RelationsProvider} from "@lib/context/RelationsContext.jsx";
import {WebSocketProvider} from "@lib/context/WebSocketContext.jsx";
import {FriendshipsProvider} from "@lib/context/FriendshipContext.jsx";


const ContextLayout = ({children}) => {
    return (
        <UserProvider>
            <MembershipsProvider>
                <FriendshipsProvider>
                    <RelationsProvider>
                        <RoomsProvider>
                            <WebSocketProvider>
                                {children}
                            </WebSocketProvider>
                        </RoomsProvider>
                    </RelationsProvider>
                </FriendshipsProvider>
            </MembershipsProvider>
        </UserProvider>
    )
}

export default ContextLayout