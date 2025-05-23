import {useMemo, useState} from "react";
import SideNavigation from "@components/Navigation/SideNavigation.jsx";
import {Container, Grid} from "@mui/material";
import Navbar from "@components/Navbar/Navbar.jsx";
import toast from "react-hot-toast";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import {relationListService, userService} from "@lib/services/userServices.js";
import {useUserContext} from "@lib/context/UserContext.jsx";
import {useMembershipsContext} from "@lib/context/MembershipsContext.jsx";
import {useRelationsContext} from "@lib/context/RelationsContext.jsx";
import {useFriendshipsContext} from "@lib/context/FriendshipContext.jsx";

const DefaultLayout = ({children}) => {
    const [showSidebar, setShowSidebar] = useState(false)
    const [accessToken] = useAccessToken();
    const {setUser} = useUserContext();
    const {setMemberships} = useMembershipsContext();
    const {setRelations} = useRelationsContext();
    const {setFriendships} = useFriendshipsContext()

    const handleSidebar = () => {
        setShowSidebar(prevState => !prevState)
    }

    useMemo(() => {
        const setup = async () => {
            try {
                const [user, memberShips, friends] = await userService();
                const response = await relationListService();
                setUser(user);
                setMemberships(memberShips);
                setFriendships(friends);
                setRelations(response);
            } catch (error) {
                toast.error("Loading user data failed. Please re-enter and try again.", {
                    id: "load-user",
                });
            }
        };
        if (accessToken) {
            setup();
        }
    }, [accessToken]);


    return (
        <>
            <Navbar open={showSidebar} handleClose={handleSidebar}/>
            <Container maxWidth="xl" sx={{marginTop: {xs: "2rem", lg: "100px", xl: "50px"}, position: "relative"}}>
                <Grid container spacing={4} justifyContent="end">
                    <Grid item xs={12} sm={12} md={12} lg={3} xl={2}>
                        <SideNavigation open={showSidebar} handleClose={handleSidebar}/>
                    </Grid>
                    {children}
                </Grid>
            </Container>
        </>
    );
};

export default DefaultLayout;
