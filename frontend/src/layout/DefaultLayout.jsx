import RootLayout from "./RootLayout.jsx";
import SideNavigation from "@components/Navigation/SideNavigation.jsx";
import {Container, Grid} from "@mui/material";
import Navbar from "@components/Navbar/Navbar.jsx";
import {useEffect} from "react";
import {userService} from "@src/lib/services/authService.js";
import {useMemberships, useUser} from "@lib/hooks/useUser.jsx";
import toast from "react-hot-toast";
import {useAccessToken} from "@lib/hooks/useToken.jsx";

const DefaultLayout = ({children}) => {
    const [accessToken, _] = useAccessToken()
    const [user, setUser] = useUser()
    const [memberShips, setMemberShips] = useMemberships()

    useEffect(() => {
        const setup = async () => {
            try {
                const [user, memberShips] = await userService()
                setUser(user, null)
                setMemberShips(memberShips, null)
            } catch (error) {
                toast.error("Loading user data failed . \n Please re enter and try again.", {id: "load-user"})
            }
        }
        setup()
    }, [accessToken])


    return (
        <RootLayout>
            <Navbar/>
            <Container maxWidth={"xl"} sx={{marginTop: {xs: "2rem", lg: "100px", xl: "50px"}, position: "relative"}}>
                <Grid container spacing={4} justifyContent={"end"}>
                    <Grid item xs={12} sm={4} md={3} lg={3} xl={2}>
                        <SideNavigation/>
                    </Grid>
                    {children}
                </Grid>
            </Container>
        </RootLayout>
    )
}


export default DefaultLayout